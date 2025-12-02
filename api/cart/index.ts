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

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method === "GET") {
    const session = readCookie(req, "cart_session") || "guest-cart";
    const cookieVal = readCookie(req, "cart_items");
    const items = cookieVal ? JSON.parse(cookieVal) : [];
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: session, status: "active", items }));
    return;
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", [
      "cart_items=; Path=/; Max-Age=0; SameSite=Lax",
    ]);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Cart cleared" }));
    return;
  }

  res.statusCode = 405;
  res.setHeader("Allow", "GET, DELETE");
  res.end(JSON.stringify({ error: "Method Not Allowed" }));
}

