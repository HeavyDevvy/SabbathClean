import type { IncomingMessage, ServerResponse } from "http";
import { prisma } from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    let userId: string | undefined = undefined;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
        userId = decoded?.userId;
      } catch {}
    }
    if (!userId) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: "Unauthorized" }));
      return;
    }

    const bookings = await prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    const paymentsByBooking: Record<string, any> = {};
    const payments = await prisma.payment.findMany({ where: { userId } });
    for (const p of payments) paymentsByBooking[p.bookingId] = p;

    const orders = bookings.map((b) => {
      const pay = paymentsByBooking[b.id];
      const subtotal = String(b.totalAmount || "0");
      const platformFee = String((Number(subtotal) * 0.15).toFixed(2));
      const totalAmount = String((Number(subtotal) + Number(platformFee)).toFixed(2));
      return {
        id: b.id,
        orderNumber: `BE-${new Date(b.createdAt).getFullYear()}-${b.id.slice(-6)}`,
        createdAt: b.createdAt,
        subtotal,
        platformFee,
        totalAmount,
        paymentMethod: pay?.paymentMethod || "card",
        paymentStatus: pay?.paymentStatus || "COMPLETED",
        items: [
          {
            id: b.id,
            serviceId: b.eventType,
            serviceType: b.eventType,
            serviceName: b.eventType,
            scheduledDate: b.eventDate,
            scheduledTime: b.eventTime,
            duration: b.eventDuration,
            basePrice: subtotal,
            addOnsPrice: "0",
            subtotal,
            tipAmount: "0",
            serviceDetails: null,
            selectedAddOns: [],
            comments: null,
          },
        ],
      };
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(orders));
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Failed to fetch orders" }));
  }
}

