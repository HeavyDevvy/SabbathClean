import type { IncomingMessage, ServerResponse } from "http";
import { storage } from "../../server/storage.js";
import jwt from "jsonwebtoken";

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

export function generateBookingReference() {
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

  console.log('=== CHECKOUT STARTED ===');
  console.log('Environment Check:');
  console.log('POSTGRES_URL set:', !!process.env.POSTGRES_URL);
  
  const dbUrl = process.env.DATABASE_URL || "";
  const maskedDbUrl = dbUrl.replace(/(:[^:@]+@)/, ':****@');
  console.log('DATABASE_URL value:', maskedDbUrl);
  
  console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL?.includes('prisma')) {
    console.log('DATABASE_URL is Prisma Accelerate URL');
  }

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
        userId = decoded?.userId || decoded?.id;
      } catch {}
    }

    console.log('User ID:', userId);

    if (!userId) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Unauthorized" }));
      return;
    }

    // 2. Get Cart
    const sessionToken = readCookie(req, "cart_session");
    console.log("[CHECKOUT] Database connection attempt...");
    const cart = await storage.getOrCreateCart(userId, undefined);
    let cartData = await storage.getCartWithItems(cart.id);
    let usingGuestCart = false;

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

    if (!cartData || cartData.items.length === 0) {
      // Fallback check
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
      console.error('❌ Cart is empty');
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
      paymentStatus: paymentMethod === "wallet" ? "pending" : "paid",
      status: paymentMethod === "wallet" ? "pending_payment" : "confirmed",
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

    // 5. Create Bookings with ONE Reference
    const bookingRef = generateBookingReference();
    console.log('📋 Generated Reference:', bookingRef);

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
        
        // Find service ID fallback
        let serviceId = item.serviceId;
        if (!serviceId) {
           const services = await storage.getServicesByCategory(item.serviceType);
           if (services.length > 0) serviceId = services[0].id;
        }

        const bookingData: any = {
          customerId: userId,
          providerId: item.providerId || (details?.provider?.id ?? null),
          serviceId: serviceId || "unknown",
          bookingNumber,
          bookingReference: bookingRef, // Shared reference
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
          console.log(`✅ BOOKING CREATED: ${booking.id} (Ref: ${bookingRef})`);
        } catch (err) {
          console.error(`Failed to create booking for item ${idx}:`, err);
        }
      }
    }

    // Verify booking was saved (check the first one)
    if (createdBookings.length > 0) {
        const firstId = createdBookings[0].id;
        const verifyBooking = await storage.getBooking(firstId);
        if (!verifyBooking) {
            console.error('❌ CRITICAL: Booking not found immediately after creation!');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to save booking' }));
            return;
        }
        console.log('✅ Booking verified in database');
    } else {
        console.error('❌ No bookings created from order items');
    }

    const firstBooking = createdBookings[0];
    const bookingId = firstBooking?.id || order.id;

    const responseOrder = {
      id: bookingId,
      bookingReference: bookingRef,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      platformFee: order.platformFee,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: completeOrder?.items.map(i => ({
        ...i,
        serviceName: i.serviceName,
        scheduledDate: i.scheduledDate,
        scheduledTime: i.scheduledTime
      })) || []
    };

    const responseData = { 
      success: true,
      bookingId: bookingId,
      bookingReference: bookingRef,
      booking: responseOrder,
      message: "Checkout completed successfully"
    };
    
    console.log('✓ RETURNING CHECKOUT RESPONSE');
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(responseData));

  } catch (e: any) {
    console.error('❌ CHECKOUT FAILED:', e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Checkout failed" }));
  }
}
