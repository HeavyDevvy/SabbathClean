import jwt from "jsonwebtoken";
import { prisma } from "../../../../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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
    const providerId =
      req.query?.providerId ||
      req.params?.providerId ||
      req.query?.id ||
      req.params?.id ||
      (req.url?.split("/").slice(-2)[0]);
    if (!providerId) {
      return res.status(400).json({ error: "providerId required" });
    }
    const existing = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
    if (!existing) {
      return res.status(404).json({ error: "Provider not found" });
    }
    const updated = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: { verificationStatus: "REJECTED", isVerified: false },
    });
    return res.status(200).json(updated);
  } catch (e: any) {
    console.error("Provider decline error:", e?.message || e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

