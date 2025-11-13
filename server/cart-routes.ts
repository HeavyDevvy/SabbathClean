import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import { encryptGateCode } from "./encryption";

// Helper to get or create cart ID from session/user
function getCartIdentifier(req: Request): { userId?: string; sessionToken?: string } {
  // Check if user is authenticated (from auth middleware)
  const userId = (req as any).user?.id;
  
  if (userId) {
    return { userId };
  }
  
  // For guest users, use/create session token
  let sessionToken = req.cookies?.cartSession;
  if (!sessionToken) {
    sessionToken = randomUUID();
    // Set cookie for 14 days (Phase 4.1: Extended cart persistence)
    (req as any).res?.cookie('cartSession', sessionToken, {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }
  
  return { sessionToken };
}

export function registerCartRoutes(app: Express) {
  
  // GET /api/cart - Get current cart with items
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const { userId, sessionToken } = getCartIdentifier(req);
      
      // Get or create cart
      const cart = await storage.getOrCreateCart(userId, sessionToken);
      
      // Get cart with items
      const cartData = await storage.getCartWithItems(cart.id);
      
      if (!cartData) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Flatten cart and items for frontend compatibility
      res.json({
        ...cartData.cart,
        items: cartData.items
      });
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // POST /api/cart/items - Add item to cart
  app.post("/api/cart/items", async (req: Request, res: Response) => {
    try {
      const { userId, sessionToken } = getCartIdentifier(req);
      
      // Get or create cart
      const cart = await storage.getOrCreateCart(userId, sessionToken);
      
      // Extract gate code before validation (not part of schema)
      const { gateCode, ...itemDataRaw } = req.body;
      
      // Validate request body
      const itemData = insertCartItemSchema.parse(itemDataRaw);
      
      // Check cart item limit (max 3 services)
      const currentCount = await storage.getCartItemCount(cart.id);
      if (currentCount >= 3) {
        return res.status(400).json({ 
          message: "Cart limit reached. Maximum 3 services allowed per booking." 
        });
      }
      
      // Add item to cart (deduplication handled in storage layer)
      const cartItem = await storage.addItemToCart(cart.id, itemData);
      
      // If gate code provided, encrypt and store it (Phase 3.2)
      if (gateCode && gateCode.trim()) {
        const { encryptedData, iv, authTag } = encryptGateCode(gateCode.trim());
        await storage.createGateCode(
          cartItem.id, // Using cart item ID as reference
          encryptedData,
          iv,
          authTag || ""
        );
      }
      
      // Return updated cart with flattened structure
      const cartData = await storage.getCartWithItems(cart.id);
      
      if (!cartData) {
        return res.status(500).json({ message: "Failed to retrieve cart data" });
      }
      
      res.status(201).json({ 
        item: cartItem,
        cart: {
          ...cartData.cart,
          items: cartData.items
        }
      });
    } catch (error: any) {
      console.error("Error adding item to cart:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid cart item data",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: error.message });
    }
  });
  
  // PATCH /api/cart/items/:id - Update cart item
  app.patch("/api/cart/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = req.params.id;
      
      // Update cart item (field constraints applied in storage layer)
      const updatedItem = await storage.updateCartItem(itemId, req.body);
      
      res.json(updatedItem);
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // DELETE /api/cart/items/:id - Remove cart item
  app.delete("/api/cart/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = req.params.id;
      
      await storage.removeCartItem(itemId);
      
      res.json({ message: "Item removed from cart" });
    } catch (error: any) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // DELETE /api/cart - Clear entire cart
  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      const { userId, sessionToken } = getCartIdentifier(req);
      
      const cart = await storage.getOrCreateCart(userId, sessionToken);
      
      await storage.clearCart(cart.id);
      
      res.json({ message: "Cart cleared" });
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // POST /api/cart/checkout - Convert cart to order
  app.post("/api/cart/checkout", async (req: Request, res: Response) => {
    try {
      const { userId, sessionToken } = getCartIdentifier(req);
      
      // Get cart (works for both authenticated users and guests)
      const cart = await storage.getOrCreateCart(userId, sessionToken);
      const cartData = await storage.getCartWithItems(cart.id);
      
      if (!cartData || cartData.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate totals
      const subtotal = cartData.items.reduce((sum, item) => 
        sum + parseFloat(item.subtotal as string), 0
      );
      
      // HOUSE CLEANING ONLY: Add tip amounts to total
      const totalTips = cartData.items.reduce((sum, item) => 
        sum + (parseFloat(item.tipAmount as string) || 0), 0
      );
      
      const platformFee = subtotal * 0.15; // 15% platform fee (does not apply to tips)
      const totalAmount = subtotal + totalTips + platformFee;
      
      // Generate order number
      const orderNumber = `BE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Validate payment data from request body
      const { paymentMethod, cardLast4, cardBrand, cardholderName, accountLast4, bankName, accountHolder } = req.body;
      
      if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method required" });
      }
      
      // Create order with items and payment metadata
      const orderData = {
        userId: userId || null, // Support guest checkout
        cartId: cart.id,
        orderNumber,
        subtotal: subtotal.toString(),
        platformFee: platformFee.toString(),
        totalAmount: totalAmount.toString(),
        paymentMethod,
        paymentStatus: "paid", // Mark as paid for frontend flow
        status: "confirmed",
        // Add payment metadata (masked data only)
        ...(paymentMethod === "card" ? {
          cardLast4,
          cardBrand,
          cardholderName
        } : {
          accountLast4,
          bankName,
          accountHolder
        })
      } as any;
      
      // Convert cart items to order items
      const orderItemsData = cartData.items.map(item => ({
        sourceCartItemId: item.id, // Phase 3.2: Enable 1:1 gate code transfer
        serviceId: item.serviceId,
        providerId: item.providerId || null,
        serviceName: item.serviceName,
        serviceType: item.serviceType,
        scheduledDate: item.scheduledDate,
        scheduledTime: item.scheduledTime,
        duration: item.duration || null,
        basePrice: item.basePrice,
        addOnsPrice: item.addOnsPrice || "0",
        subtotal: item.subtotal,
        tipAmount: item.tipAmount || "0", // HOUSE CLEANING ONLY: Transfer tip from cart to order
        serviceDetails: item.serviceDetails || null,
        selectedAddOns: item.selectedAddOns || [],
        comments: item.comments || null,
        status: "pending"
      }));
      
      // Create order (transaction-wrapped, clears cart automatically)
      // Gate code transfer happens automatically within the createOrder transaction
      const order = await storage.createOrder(orderData, orderItemsData);
      
      const completeOrder = await storage.getOrderWithItems(order.id);
      
      if (!completeOrder) {
        return res.status(500).json({ message: "Failed to retrieve order" });
      }
      
      res.status(201).json({
        message: "Order created successfully",
        order: {
          ...completeOrder.order,
          items: completeOrder.items
        }
      });
      
    } catch (error: any) {
      console.error("Error during checkout:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // GET /api/orders - Get user's orders
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const orders = await storage.getUserOrders(userId);
      
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // GET /api/orders/:id - Get specific order with items
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      
      const orderData = await storage.getOrderWithItems(orderId);
      
      if (!orderData) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Map snake_case database fields to camelCase for frontend
      const mappedOrder = {
        ...orderData.order,
        totalAmount: orderData.order.totalAmount || orderData.order.total_amount,
        platformFee: orderData.order.platformFee || orderData.order.platform_fee,
        taxAmount: orderData.order.taxAmount || orderData.order.tax_amount,
        serviceFee: orderData.order.serviceFee || orderData.order.service_fee,
        orderNumber: orderData.order.orderNumber || orderData.order.order_number,
        paymentStatus: orderData.order.paymentStatus || orderData.order.payment_status,
        paymentMethod: orderData.order.paymentMethod || orderData.order.payment_method,
        paymentIntentId: orderData.order.paymentIntentId || orderData.order.payment_intent_id,
        stripeChargeId: orderData.order.stripeChargeId || orderData.order.stripe_charge_id,
        cardLast4: orderData.order.cardLast4 || orderData.order.card_last4,
        cardBrand: orderData.order.cardBrand || orderData.order.card_brand,
        cardholderName: orderData.order.cardholderName || orderData.order.cardholder_name,
        accountLast4: orderData.order.accountLast4 || orderData.order.account_last4,
        bankName: orderData.order.bankName || orderData.order.bank_name,
        accountHolder: orderData.order.accountHolder || orderData.order.account_holder,
        confirmationSentAt: orderData.order.confirmationSentAt || orderData.order.confirmation_sent_at,
        createdAt: orderData.order.createdAt || orderData.order.created_at,
        updatedAt: orderData.order.updatedAt || orderData.order.updated_at,
        userId: orderData.order.userId || orderData.order.user_id,
        cartId: orderData.order.cartId || orderData.order.cart_id
      };
      
      // Map items as well
      const mappedItems = orderData.items.map((item: any) => ({
        ...item,
        orderId: item.orderId || item.order_id,
        sourceCartItemId: item.sourceCartItemId || item.source_cart_item_id,
        serviceId: item.serviceId || item.service_id,
        providerId: item.providerId || item.provider_id,
        serviceName: item.serviceName || item.service_name,
        serviceType: item.serviceType || item.service_type,
        scheduledDate: item.scheduledDate || item.scheduled_date,
        scheduledTime: item.scheduledTime || item.scheduled_time,
        basePrice: item.basePrice || item.base_price,
        addOnsPrice: item.addOnsPrice || item.add_ons_price,
        tipAmount: item.tipAmount || item.tip_amount,
        serviceDetails: item.serviceDetails || item.service_details,
        selectedAddOns: item.selectedAddOns || item.selected_add_ons,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at
      }));
      
      res.json({ order: mappedOrder, items: mappedItems });
    } catch (error: any) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
