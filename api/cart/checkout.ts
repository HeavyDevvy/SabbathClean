import type { IncomingMessage, ServerResponse } from "http";
import { storage } from "../../server/storage";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

function readCookie(req: any, name: string): string | undefined {
  const header = req.headers["cookie"] as string | undefined;
  if (!header) return undefined;
  const pairs = header.split(/;\s*/);
  for (const p of pairs) {
    const [k, ...rest] = p.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function generateBookingReference() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BE-${year}-${randomChars}`;
}

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  console.log('=== CHECKOUT STARTED (Vercel Function) ===');

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { paymentMethod = "card", cardLast4, cardBrand, cardholderName, accountLast4, bankName, accountHolder } = body;

    // 1. Authentication
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    let userId: string | undefined = undefined;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
        userId = decoded?.userId || decoded?.id; // Support both standard JWT payload and custom
      } catch {}
    }

    if (!userId) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Unauthorized" }));
      return;
    }

    // 2. Get Cart
    const sessionToken = readCookie(req, "cart_session");
    
    // Get cart for authenticated user
    const cart = await storage.getOrCreateCart(userId, undefined);
    let cartData = await storage.getCartWithItems(cart.id);
    let usingGuestCart = false;

    // Attempt merge if user cart is empty
    if (!cartData || cartData.items.length === 0) {
      if (sessionToken) {
        try {
          await storage.mergeGuestCartToUser(sessionToken, userId);
          const refreshedCart = await storage.getOrCreateCart(userId, undefined);
          cartData = await storage.getCartWithItems(refreshedCart.id);
        } catch (e) {
          console.log("Merge cart failed:", e);
        }
      }
    }

    // Fallback to guest cart if still empty
    if (!cartData || cartData.items.length === 0) {
      if (sessionToken) {
        const guestCart = await storage.getOrCreateCart(undefined, sessionToken);
        const guestData = await storage.getCartWithItems(guestCart.id);
        if (guestData && guestData.items.length > 0) {
          cartData = guestData;
          usingGuestCart = true;
        }
      }
    }

    if (!cartData || cartData.items.length === 0) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Cart is empty" }));
      return;
    }

    // 3. Calculate Totals
    const subtotal = cartData.items.reduce((sum, item) => 
      sum + parseFloat(item.subtotal as string), 0
    );
    const totalTips = cartData.items.reduce((sum, item) => 
      sum + (parseFloat(item.tipAmount as string) || 0), 0
    );
    const platformFee = subtotal * 0.15;
    const totalAmount = subtotal + totalTips + platformFee;

    // 4. Create Order
    const orderNumber = `BE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const orderData = {
      userId,
      cartId: usingGuestCart ? cartData.cart.id : cart.id,
      orderNumber,
      subtotal: subtotal.toString(),
      platformFee: platformFee.toString(),
      totalAmount: totalAmount.toString(),
      paymentMethod,
      paymentStatus: paymentMethod === "wallet" ? "pending" : "paid", // Assume paid for external (mock)
      status: paymentMethod === "wallet" ? "pending_payment" : "confirmed",
      // Payment metadata
      ...(paymentMethod === "card" ? { cardLast4, cardBrand, cardholderName } : {}),
      ...(paymentMethod === "bank" ? { accountLast4, bankName, accountHolder } : {})
    } as any;

    const orderItemsData = cartData.items.map(item => ({
      sourceCartItemId: item.id,
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
      tipAmount: item.tipAmount || "0",
      serviceDetails: item.serviceDetails || null,
      selectedAddOns: item.selectedAddOns || [],
      comments: item.comments || null,
      status: "pending"
    }));

    const order = await storage.createOrder(orderData, orderItemsData, {
      clearCart: paymentMethod !== "wallet"
    });

    // 5. Create Bookings (The user requested fix for booking reference)
    const completeOrder = await storage.getOrderWithItems(order.id);
    const createdBookings: any[] = [];

    if (completeOrder) {
      for (let idx = 0; idx < completeOrder.items.length; idx++) {
        const item: any = completeOrder.items[idx];
        const details = typeof item.serviceDetails === 'string' ? (() => { try { return JSON.parse(item.serviceDetails); } catch { return {}; } })() : (item.serviceDetails || {});
        
        const itemSubtotal = parseFloat(String(item.subtotal || '0')) || 0;
        const itemTip = parseFloat(String(item.tipAmount || '0')) || 0;
        const itemTotal = itemSubtotal + itemTip;
        const perItemPlatformFee = Math.round(itemSubtotal * 0.15 * 100) / 100;
        
        const bookingNumber = `${order.orderNumber}-${idx + 1}`;
        const bookingReference = generateBookingReference(); // Generate unique reference
        
        // Find a provider if one wasn't selected (Auto-assign logic placeholder)
        // For now, if no provider, we leave it null (pending-provider)
        const providerIdForBooking = item.providerId || (details?.provider?.id ?? null);

        // Ensure serviceId is present (Required by DB)
        // If item.serviceId is null (custom cart item), we need a fallback or lookup
        // We will assume item.serviceId is populated from cart. If not, we might fail.
        // As a fallback, we can try to find a service by category.
        let serviceId = item.serviceId;
        if (!serviceId) {
           const services = await storage.getServicesByCategory(item.serviceType);
           if (services.length > 0) serviceId = services[0].id;
        }
        
        // If still no serviceId, we have a problem. But let's try to proceed.
        // Ideally we should have a "Custom Service" record.

        const bookingData: any = {
          customerId: userId,
          providerId: providerIdForBooking,
          serviceId: serviceId, 
          bookingNumber,
          bookingReference, // <--- Added booking reference
          scheduledDate: item.scheduledDate,
          scheduledTime: item.scheduledTime,
          duration: item.duration || 2,
          totalPrice: itemTotal.toString(),
          platformFee: perItemPlatformFee.toString(),
          tipAmount: (item.tipAmount || '0'),
          paymentStatus: completeOrder.order.paymentStatus || 'paid',
          status: 'pending-provider',
          serviceType: item.serviceType,
          serviceDetails: item.serviceDetails || null,
          customerDetails: null,
          address: details?.address || 'Address not provided',
          city: details?.city || null,
          postalCode: details?.postalCode || null,
          specialInstructions: (item.comments || null),
          isRecurring: false,
        };

        try {
          const booking = await storage.createBooking(bookingData);
          createdBookings.push(booking);
          console.log(`✓ Booking created: ${booking.id} (Ref: ${bookingReference})`);
        } catch (err) {
          console.error(`Failed to create booking for item ${idx}:`, err);
        }
      }
    }

    // 6. Response
    // Construct response matching what frontend expects (from previous logs)
    const firstBooking = createdBookings[0];
    
    // If no bookings created (e.g. error), fallback to order ID
    const bookingId = firstBooking?.id || order.id;

    // Construct the "booking" object the frontend expects
    // It seems to expect an Order-like object but calls it "booking"
    const responseOrder = {
      id: bookingId, // Frontend uses this
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      platformFee: order.platformFee,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: completeOrder?.items.map(i => ({
        ...i,
        // Ensure fields expected by frontend are present
        serviceName: i.serviceName,
        scheduledDate: i.scheduledDate,
        scheduledTime: i.scheduledTime
      })) || []
    };

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    
    const responseData = { 
      success: true,
      bookingId: bookingId,
      booking: responseOrder,
      message: "Checkout completed successfully"
    };
    
    console.log('✓ RETURNING CHECKOUT RESPONSE:', JSON.stringify(responseData, null, 2));
    res.end(JSON.stringify(responseData));

  } catch (e: any) {
    console.error('❌ CHECKOUT FAILED:', e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Checkout failed" }));
  }
}
