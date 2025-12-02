import type { IncomingMessage, ServerResponse } from "http";
import { prisma } from "../../lib/prisma.js";
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

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const paymentMethod = body?.paymentMethod || "card";

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
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Unauthorized" }));
      return;
    }

    const sessionToken = readCookie(req, "cart_session") || undefined;
    const cart = await prisma.cart.findFirst({ where: { sessionToken } });
    if (!cart) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Cart not found" }));
      return;
    }

    const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    if (!items || items.length === 0) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Cart is empty" }));
      return;
    }

    const confirmations: Array<{ bookingId: string; paymentId: string }> = [];

    for (const item of items) {
      const booking = await prisma.booking.create({
        data: {
          userId: userId,
          providerId: item.providerId || cart.id, // fallback to avoid failure if provider missing
          eventDate: item.scheduledDate,
          eventTime: item.scheduledTime || "",
          eventDuration: item.duration || 1,
          eventType: item.serviceType,
          eventLocation: "unspecified",
          numberOfGuests: null,
          specialRequests: item.comments || null,
          status: "CONFIRMED",
          totalAmount: String(item.subtotal || "0"),
        }
      });

      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId: userId,
          providerId: booking.providerId,
          amount: String(item.subtotal || "0"),
          platformCommission: "0",
          providerPayout: String(item.subtotal || "0"),
          paymentMethod: paymentMethod,
          paymentStatus: "COMPLETED",
          transactionId: Math.random().toString(36).slice(2),
          paymentDate: new Date(),
        }
      });

      confirmations.push({ bookingId: booking.id, paymentId: payment.id });
    }

    await prisma.cart.update({ where: { id: cart.id }, data: { status: "checked_out" } });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Checkout completed", confirmations }));
    return;
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Checkout failed" }));
    return;
  }
}

