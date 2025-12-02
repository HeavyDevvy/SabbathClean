import type { IncomingMessage, ServerResponse } from "http";
import { prisma } from "../../lib/prisma.js";

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

function writeCookie(res: any, name: string, value: string, days = 14) {
  const maxAge = days * 24 * 60 * 60;
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  const prev = res.getHeader("Set-Cookie");
  const arr = Array.isArray(prev) ? prev.concat(cookie) : prev ? [prev as string, cookie] : [cookie];
  res.setHeader("Set-Cookie", arr);
}

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      let sessionToken = readCookie(req, "cart_session") || undefined;
      let cart = await prisma.cart.findFirst({ where: { sessionToken } });
      if (!cart) {
        // create session cart and set cookie
        if (!sessionToken) {
          sessionToken = Math.random().toString(36).slice(2);
          writeCookie(res, "cart_session", sessionToken);
        }
        cart = await prisma.cart.create({ data: { sessionToken, status: "active" } });
      }

      const item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          serviceId: body.serviceId || null,
          providerId: body.providerId || null,
          serviceType: body.serviceType || body.serviceId || "service",
          serviceName: body.serviceName || "Service",
          scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : new Date(),
          scheduledTime: body.scheduledTime || "",
          duration: Number(body.duration || 2),
          basePrice: String(body.basePrice || "0"),
          addOnsPrice: String(body.addOnsPrice || "0"),
          subtotal: String(body.subtotal || body.basePrice || "0"),
          tipAmount: String(body.tipAmount || "0"),
          serviceDetails: body.serviceDetails || null,
          selectedAddOns: Array.isArray(body.selectedAddOns) ? body.selectedAddOns : [],
          comments: body.comments || null,
        }
      });

      const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ item, cart: { id: cart.id, status: cart.status, items } }));
      return;
    } catch (e: any) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: e?.message || "Failed to add item" }));
      return;
    }
  }

  if (req.method === "DELETE") {
    try {
      const sessionToken = readCookie(req, "cart_session") || undefined;
      const cart = await prisma.cart.findFirst({ where: { sessionToken } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Cart items cleared" }));
      return;
    } catch (e: any) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Failed to clear items" }));
      return;
    }
  }

  res.statusCode = 405;
  res.setHeader("Allow", "POST, DELETE");
  res.end(JSON.stringify({ error: "Method Not Allowed" }));
}
