import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, type InsertCartItem } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import { encryptGateCode } from "./encryption";
import { authenticateToken, optionalAuth } from "./auth-routes";

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
  app.get("/api/cart", optionalAuth, async (req: Request, res: Response) => {
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
  app.post("/api/cart/items", optionalAuth, async (req: Request, res: Response) => {
    try {
      const { userId, sessionToken } = getCartIdentifier(req);
      
      // Get or create cart
      const cart = await storage.getOrCreateCart(userId, sessionToken);
      
      // Extract gate code before validation (not part of schema)
      const { gateCode, ...itemDataRaw } = req.body;
      
      // Validate request body
      const itemData: Omit<InsertCartItem, 'cartId'> = insertCartItemSchema.omit({ cartId: true }).parse(itemDataRaw as any);
      
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
        const { encryptedGateCode: encryptedData, iv, authTag } = encryptGateCode(gateCode.trim());
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
      console.error("Error adding item to cart:", error?.message || String(error));
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid cart item data",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: error?.message || 'Failed to add item' });
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
  app.delete("/api/cart", optionalAuth, async (req: Request, res: Response) => {
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
  
  // POST /api/cart/checkout - Convert cart to order (REQUIRES AUTHENTICATION)
  app.post("/api/cart/checkout", authenticateToken, async (req: Request, res: Response) => {
    try {
      // Extract authenticated user ID
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required for checkout" });
      }
      
      // Get cart for authenticated user only
      const cart = await storage.getOrCreateCart(userId, undefined);
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
      const { paymentMethod, cardLast4, cardBrand, cardholderName, accountLast4, bankName, accountHolder, walletBalance } = req.body;
      
      if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method required" });
      }
      
      // PRE-VALIDATE wallet payment (non-destructive check only)
      if (paymentMethod === "wallet") {
        // Verify wallet has sufficient funds BEFORE order creation
        const currentBalance = await storage.getWalletBalance(userId);
        
        if (currentBalance < totalAmount) {
          return res.status(400).json({ 
            message: `Insufficient wallet balance. You have ${currentBalance.toFixed(2)}, but need ${totalAmount.toFixed(2)}.` 
          });
        }
      }
      
      // Create order with items and payment metadata
      // WALLET PAYMENT: Start with pending status, update to paid/confirmed AFTER successful deduction
      const orderData = {
        userId, // Authentication required - userId is always present
        cartId: cart.id,
        orderNumber,
        subtotal: subtotal.toString(),
        platformFee: platformFee.toString(),
        totalAmount: totalAmount.toString(),
        paymentMethod,
        paymentStatus: paymentMethod === "wallet" ? "pending" : "paid", // Wallet: pending until funds deducted
        status: paymentMethod === "wallet" ? "pending_payment" : "confirmed", // Wallet: wait for payment
        // Add payment metadata (masked data only)
        ...(paymentMethod === "card" ? {
          cardLast4,
          cardBrand,
          cardholderName
        } : paymentMethod === "bank" ? {
          accountLast4,
          bankName,
          accountHolder
        } : paymentMethod === "wallet" ? {
          walletBalance: totalAmount.toFixed(2), // Amount to be deducted from wallet
        } : {})
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
      
      // Create order (transaction-wrapped)
      // Gate code transfer happens automatically within the createOrder transaction
      // For wallet payments, defer cart clearing until after successful payment
      const order = await storage.createOrder(orderData, orderItemsData, {
        clearCart: paymentMethod !== "wallet" // Don't clear cart for wallet payments yet
      });
      
      // TRANSACTION INTEGRITY: Process wallet payment AFTER order creation
      // Order is created with pending status; update to paid/confirmed only after successful deduction
      if (paymentMethod === "wallet") {
        try {
          // Deduct funds from wallet and create transaction (atomic balance check inside)
          await storage.processWalletPayment(
            userId,
            totalAmount,
            order.id, // bookingId/orderId for transaction reference
            undefined, // serviceId
            `Payment for order ${orderNumber} (${cartData.items.length} service${cartData.items.length > 1 ? 's' : ''})`
          );
          
          // SUCCESS: Update order to paid and confirmed status
          await storage.updateOrderStatus(order.id, 'confirmed', 'paid');
          
          // Clear cart only after successful wallet deduction
          if (orderData.cartId) {
            await storage.clearCart(orderData.cartId);
            console.log(`✅ Cart ${orderData.cartId} cleared after successful wallet payment`);
          }
          
          console.log(`💰 Wallet payment processed: User ${userId}, Amount: ${totalAmount}, Order: ${orderNumber}`);
        } catch (walletError: any) {
          console.error('❌ Wallet payment failed after order creation:', walletError);
          
          // TRANSACTION RECOVERY: Mark order as cancelled, preserve cart for retry
          // Cart was NOT cleared since payment failed - user can retry with same items
          try {
            await storage.updateOrderStatus(order.id, 'cancelled', 'failed');
            console.log(`⚠️ Order ${order.id} cancelled due to wallet payment failure - cart preserved for retry`);
          } catch (updateError) {
            console.error('Failed to cancel order after wallet error:', updateError);
          }
          
          // Return clear error to user - cart intact, they can retry immediately
          return res.status(400).json({ 
            message: walletError.message || 'Insufficient wallet balance. Your cart has been preserved - please top up your wallet or select a different payment method.',
            error: 'wallet_payment_failed',
            canRetry: true
          });
        }
      }
      
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
  
  // GET /api/orders - Get user's orders with items
  app.get("/api/orders", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const orders = await storage.getUserOrders(userId);
      
      // Fetch items for each order and flatten the structure
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderData = await storage.getOrderWithItems(order.id);
          // Return flat structure: order properties + items array
          return orderData ? { ...orderData.order, items: orderData.items } : order;
        })
      );
      
      res.json(ordersWithItems);
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
      
      // Return flattened structure: order object with items property (Drizzle already returns camelCase)
      res.json({ ...orderData.order, items: orderData.items });
    } catch (error: any) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // PATCH /api/orders/:id/cancel - Cancel an order with refund policy
  app.patch("/api/orders/:id/cancel", authenticateToken, async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const userId = (req as any).user?.id;
      const { reason, refundAmount, deductionAmount } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "Cancellation reason is required" });
      }

      // Get the order to verify ownership
      const orderData = await storage.getOrderWithItems(orderId);
      
      if (!orderData) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify the order belongs to the authenticated user
      if (orderData.order.userId !== userId) {
        return res.status(403).json({ message: "You can only cancel your own orders" });
      }

      // Check if order is already cancelled or completed
      if (orderData.order.status === "cancelled") {
        return res.status(400).json({ message: "This order is already cancelled" });
      }

      if (orderData.order.status === "completed") {
        return res.status(400).json({ message: "Completed orders cannot be cancelled" });
      }

      // Update order with cancellation information (single update for efficiency)
      await storage.updateOrder(orderId, {
        status: "cancelled",
        paymentStatus: refundAmount > 0 ? "refund_pending" : "no_refund",
        cancellationReason: reason.trim(),
        cancelledAt: new Date(),
        refundAmount: refundAmount?.toString() || "0",
      } as any);

      res.json({
        message: "Order cancelled successfully",
        refundAmount: refundAmount || 0,
        refundStatus: refundAmount > 0 ? "pending" : "no_refund"
      });
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
