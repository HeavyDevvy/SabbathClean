import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const bookingId = String(body?.bookingId || "");
    if (!bookingId) {
      return res.status(400).json({ error: "bookingId required" });
    }
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const existingPayment = await prisma.payment.findUnique({ where: { bookingId } });
    if (existingPayment && existingPayment.paymentStatus === "COMPLETED") {
      console.warn(`[CreateCheckout] Conflict: Booking ${bookingId} already paid`);
      return res.status(409).json({ error: "Booking already paid", code: "BOOKING_PAID" });
    }

    // Clear any previous pending payment state or invalid transaction IDs
    if (existingPayment && existingPayment.paymentStatus !== "COMPLETED") {
       console.log(`[CreateCheckout] Resetting previous payment attempt for booking ${bookingId}`);
    }

    const subtotalRands = Number(booking.totalAmount || 0);
    const platformFeeCents = Math.round(subtotalRands * 100 * 0.15);
    const totalCents = Math.round(subtotalRands * 100) + platformFeeCents;
    const yocoSecretKey = (process.env.YOCO_MODE === 'live'
      ? process.env.YOCO_SECRET_KEY_LIVE
      : process.env.YOCO_SECRET_KEY_TEST) || "";
    if (!yocoSecretKey) {
      console.error("[CreateCheckout] Yoco secret key missing");
      return res.status(500).json({ error: "Payment configuration missing" });
    }

    console.log(`[CreateCheckout] Creating Yoco checkout for booking ${bookingId}, amount: ${totalCents}`);

    const r = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${yocoSecretKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `checkout_${bookingId}_${Math.floor(Date.now() / (1000 * 60 * 60))}` // Idempotent for 1 hour
      },
      body: JSON.stringify({
        amount: totalCents,
        currency: "ZAR",
        metadata: {
          bookingId,
          environment: process.env.NODE_ENV || "production",
        },
      }),
    });
    const data: any = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(502).json({ error: "Failed to create checkout", details: data });
    }
    const checkoutId = data?.id || data?.checkoutId || "";
    const redirectUrl = data?.url || data?.redirectUrl || "";
    const platformFeeRands = (platformFeeCents / 100).toFixed(2);
    const subtotalRandsStr = subtotalRands.toFixed(2);
    const totalRandsStr = ((totalCents || 0) / 100).toFixed(2);
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: totalRandsStr,
          platformCommission: platformFeeRands,
          providerPayout: subtotalRandsStr,
          paymentMethod: "yoco",
          paymentStatus: "PENDING",
          transactionId: checkoutId || existingPayment.transactionId || null,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          bookingId,
          userId: booking.userId,
          providerId: booking.providerId,
          amount: totalRandsStr,
          platformCommission: platformFeeRands,
          providerPayout: subtotalRandsStr,
          paymentMethod: "yoco",
          paymentStatus: "PENDING",
          transactionId: checkoutId || null,
        },
      });
    }
    return res.status(200).json({ redirectUrl, checkoutId });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
