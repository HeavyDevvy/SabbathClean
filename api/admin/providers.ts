import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";

function toLowerStatus(status: string | null | undefined): string {
  const s = (status || "").toString().toUpperCase();
  if (s === "APPROVED") return "approved";
  if (s === "REJECTED") return "rejected";
  return "pending";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
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

    const page = Number((req.query?.page || 1));
    const limit = Number((req.query?.limit || 50));
    const skip = (page - 1) * limit;

    const providers = await prisma.serviceProvider.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    const enriched = providers.map((p) => ({
      ...p,
      verificationStatus: toLowerStatus((p as any).verificationStatus),
    }));

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(enriched));
  } catch (e: any) {
    console.error("Admin providers fetch error:", e?.message || e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

