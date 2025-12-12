import type { IncomingMessage, ServerResponse } from "http";
import { prisma } from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }
  try {
    const auth = req.headers["authorization"] || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
    if (!token) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: "Unauthorized" }));
      return;
    }
    let userId: string | undefined;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
      userId = decoded?.userId;
    } catch {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: "Invalid token" }));
      return;
    }
    const user = await prisma.user.update({ where: { id: userId! }, data: { role: "ADMIN" } });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Promoted to ADMIN", user: { id: user.id, role: user.role, email: user.email } }));
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Failed to promote" }));
  }
}

