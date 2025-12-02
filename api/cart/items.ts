import type { IncomingMessage, ServerResponse } from "http";

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
      const item = {
        id: Date.now().toString(36),
        cartId: "guest-cart",
        serviceId: body.serviceId || null,
        providerId: body.providerId || null,
        serviceType: body.serviceType || body.serviceId || "service",
        serviceName: body.serviceName || "Service",
        scheduledDate: body.scheduledDate || new Date().toISOString(),
        scheduledTime: body.scheduledTime || "",
        duration: Number(body.duration || 2),
        basePrice: String(body.basePrice || "0"),
        addOnsPrice: String(body.addOnsPrice || "0"),
        subtotal: String(body.subtotal || body.basePrice || "0"),
        tipAmount: String(body.tipAmount || "0"),
        serviceDetails: body.serviceDetails || null,
        selectedAddOns: Array.isArray(body.selectedAddOns) ? body.selectedAddOns : [],
        comments: body.comments || null,
        addedAt: new Date().toISOString()
      };

      const cookieVal = readCookie(req, "cart_items");
      const items = cookieVal ? JSON.parse(cookieVal) : [];
      items.push(item);
      writeCookie(res, "cart_items", JSON.stringify(items));
      writeCookie(res, "cart_session", "guest-cart");

      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ item, cart: { id: "guest-cart", status: "active", items } }));
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
      writeCookie(res, "cart_items", JSON.stringify([]));
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

