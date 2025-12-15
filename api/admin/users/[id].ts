import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const auth = req.headers["authorization"] || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const secret = process.env.JWT_SECRET || "";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (!decoded || (decoded as any).role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const id = req.query?.id || req.params?.id || (req.url?.split("/").pop());
    if (!id) {
      return res.status(400).json({ error: "user id required" });
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const updates: any = {};
    if (typeof body.firstName === "string") updates.firstName = body.firstName;
    if (typeof body.lastName === "string") updates.lastName = body.lastName;
    if (typeof body.email === "string") updates.email = body.email;
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (body.role && ["CLIENT","PROVIDER","ADMIN"].includes(body.role)) updates.role = body.role;

    const updated = await prisma.user.update({ where: { id }, data: updates });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "User updated", user: updated }));
  } catch (e: any) {
    console.error("Admin user update error:", e?.message || e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

