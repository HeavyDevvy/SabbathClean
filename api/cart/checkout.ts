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

async function getOrCreateProviderForUser(uId: string): Promise<string> {
  const existing = await prisma.serviceProvider.findFirst({ where: { userId: uId } });
  if (existing) return existing.id;
  const user = await prisma.user.findUnique({ where: { id: uId } });
  const businessName = user ? `${user.firstName} ${user.lastName}`.trim() || "System Provider" : "System Provider";
  const provider = await prisma.serviceProvider.create({
    data: {
      userId: uId,
      businessName,
      description: "Auto-generated provider for checkout",
      category: "OTHER",
      hourlyRate: "0",
      portfolioImages: [],
      isVerified: true,
      verificationStatus: "APPROVED",
    }
  });
  return provider.id;
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
      const resolvedProviderId = item.providerId || await getOrCreateProviderForUser(userId);
      const booking = await prisma.booking.create({
        data: {
          userId: userId,
          providerId: resolvedProviderId,
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
          providerId: resolvedProviderId,
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

    const first = confirmations[0];
    const booking = first ? await prisma.booking.findUnique({ where: { id: first.bookingId } }) : null;
    const payment = first ? await prisma.payment.findUnique({ where: { id: first.paymentId } }) : null;
    const subtotal = booking ? String(booking.totalAmount || "0") : "0";
    const platformFee = String((Number(subtotal) * 0.15).toFixed(2));
    const totalAmount = String((Number(subtotal) + Number(platformFee)).toFixed(2));

    const order = booking ? {
      id: booking.id,
      orderNumber: `BE-${new Date(booking.createdAt).getFullYear()}-${booking.id.slice(-6)}`,
      createdAt: booking.createdAt,
      subtotal,
      platformFee,
      totalAmount,
      paymentMethod: payment?.paymentMethod || "card",
      paymentStatus: payment?.paymentStatus || "COMPLETED",
      items: [
        {
          id: booking.id,
          serviceId: booking.eventType,
          serviceType: booking.eventType,
          serviceName: booking.eventType,
          scheduledDate: booking.eventDate,
          scheduledTime: booking.eventTime,
          duration: booking.eventDuration,
          basePrice: subtotal,
          addOnsPrice: "0",
          subtotal,
          tipAmount: "0",
          serviceDetails: null,
          selectedAddOns: [],
          comments: null,
        },
      ],
    } : null;

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Checkout completed", confirmations, order }));
    return;
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Checkout failed" }));
    return;
  }
}
