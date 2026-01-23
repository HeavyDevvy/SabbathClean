import type { IncomingMessage, ServerResponse } from "http";
const { storage } = require("../../server/storage.js");

module.exports = async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { bookingId, bookingReference } = body;
    
    console.log('=== PAYMENT CREATION ===');
    console.log('💳 Booking ID:', bookingId);
    console.log('📋 Booking Reference:', bookingReference);
    
    // Verify booking exists BEFORE creating payment
    // Try by ID first, then Reference
    let booking: any = await storage.getBooking(bookingId);
    if (!booking && bookingReference) {
        booking = await storage.getBookingByReference(bookingReference);
    }

    if (!booking) {
      console.error('❌ Booking not found:', bookingId);
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Booking not found' }));
      return;
    }
    
    console.log('✅ Booking verified:');
    console.log('  - Reference:', booking.bookingReference);
    console.log('  - Amount:', booking.totalPrice);
    console.log('  - User:', booking.customerId);
    
    // Yoco configuration
    const yocoSecretKey = (process.env.YOCO_MODE === 'live'
      ? process.env.YOCO_SECRET_KEY_LIVE
      : process.env.YOCO_SECRET_KEY_TEST) || process.env.YOCO_SECRET_KEY || "";

    if (!yocoSecretKey) {
        console.error('❌ Yoco secret key missing');
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Payment configuration missing' }));
        return;
    }

    // Create Yoco payment
    // IMPORTANT: Ensure URL params match what frontend expects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.berryevents.co.za";
    const successUrl = `${appUrl}/booking-confirmation?ref=${bookingReference || booking.bookingReference}&id=${booking.id}`;
    console.log('🔗 Success URL:', successUrl);
    
    const amountInCents = Math.round(parseFloat(String(booking.totalPrice)) * 100);

    const yocoResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${yocoSecretKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `checkout_${booking.id}_${Math.floor(Date.now() / (1000 * 60 * 60))}` // Idempotent for 1 hour
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: 'ZAR',
        successUrl: successUrl,
        cancelUrl: `${appUrl}/cart-checkout`,
        failureUrl: `${appUrl}/cart-checkout?failed=true`,
        metadata: {
          booking_id: booking.id,
          booking_reference: bookingReference || booking.bookingReference,
          user_id: booking.customerId
        }
      })
    });

    if (!yocoResponse.ok) {
        const errorText = await yocoResponse.text();
        console.error('❌ Yoco API Error:', errorText);
        throw new Error(`Yoco API failed: ${errorText}`);
    }

    const yocoCheckout = await yocoResponse.json();
    
    console.log('✅ Yoco checkout created');
    console.log('  - Redirect URL:', yocoCheckout.redirectUrl);
    
    // Update booking with payment intent ID (checkout ID) if possible
    // Note: storage.updateBookingStatus doesn't support adding paymentIntentId directly in IStorage interface
    // But we can assume it's pending until webhook callback
    
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ 
      redirectUrl: yocoCheckout.redirectUrl 
    }));
    
  } catch (error: any) {
    console.error('❌ PAYMENT CREATION FAILED:', error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: 'Payment creation failed', details: error.message }));
  }
}
