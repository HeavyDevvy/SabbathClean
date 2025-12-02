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

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method === "GET") {
    try {
      const sessionToken = readCookie(req, "cart_session") || undefined;
      const auth = req.headers["authorization"] || "";
      const userId = (auth && auth.startsWith("Bearer ")) ? undefined : undefined; // optional JWT parsing if needed

      let cart = await prisma.cart.findFirst({
        where: {
          OR: [
            userId ? { userId } : undefined,
            sessionToken ? { sessionToken } : undefined,
          ].filter(Boolean) as any
        }
      });

      if (!cart) {
        cart = await prisma.cart.create({ data: { userId, sessionToken, status: "active" } });
      }

      const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ id: cart.id, status: cart.status, items }));
      return;
    } catch (e: any) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: e?.message || "Failed to fetch cart" }));
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
      res.end(JSON.stringify({ message: "Cart cleared" }));
      return;
    } catch (e: any) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: e?.message || "Failed to clear cart" }));
      return;
    }
  }

  res.statusCode = 405;
  res.setHeader("Allow", "GET, DELETE");
  res.end(JSON.stringify({ error: "Method Not Allowed" }));
}
