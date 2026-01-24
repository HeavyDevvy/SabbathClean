// @ts-ignore
const jwt = require("jsonwebtoken");
// @ts-ignore
const { prisma } = require("../../lib/prisma.js");

module.exports = async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");

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

  if (req.method === "GET") {
    try {
      const page = Number(req.query?.page || 1);
      const limit = Number(req.query?.limit || 50);
      const skip = (page - 1) * limit;

      const providers = await prisma.serviceProvider.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              role: true
            }
          }
        }
      });

      const enriched = providers.map((p: any) => ({
        id: p.id,
        businessName: p.businessName,
        description: p.description,
        category: p.category,
        hourlyRate: String(p.hourlyRate || "0"),
        verificationStatus: p.verificationStatus,
        verificationStatusLabel: String(p.verificationStatus || "").toLowerCase(),
        isVerified: p.isVerified,
        createdAt: p.createdAt,
        email: p.user?.email || null,
        firstName: p.user?.firstName || null,
        lastName: p.user?.lastName || null,
        phoneNumber: p.user?.phoneNumber || null
      }));

      res.statusCode = 200;
      res.end(JSON.stringify(enriched));
      return;
    } catch (e: any) {
      console.error("Admin providers fetch error:", e?.message || e);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Internal server error" }));
      return;
    }
  }

  if (req.method === "POST" || req.method === "PATCH") {
    try {
      const providerId =
        req.query?.id ||
        req.params?.id ||
        (typeof req.url === "string" ? req.url.split("/").filter(Boolean).pop() : undefined);

      if (!providerId || typeof providerId !== "string") {
        return res.status(400).json({ error: "Provider ID required" });
      }

      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const action = body?.action;

      if (!action || (action !== "approve" && action !== "decline")) {
        return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'decline'" });
      }

      const existing = await prisma.serviceProvider.findUnique({
        where: { id: providerId },
        include: { user: true }
      });

      if (!existing) {
        return res.status(404).json({ error: "Provider not found" });
      }

      let updated;
      if (action === "approve") {
        updated = await prisma.serviceProvider.update({
          where: { id: providerId },
          data: {
            verificationStatus: "APPROVED",
            isVerified: true
          },
          include: { user: true }
        });
      } else {
        updated = await prisma.serviceProvider.update({
          where: { id: providerId },
          data: {
            verificationStatus: "REJECTED",
            isVerified: false
          },
          include: { user: true }
        });
      }

      return res.status(200).json(updated);
    } catch (e: any) {
      console.error("Admin provider action error:", e?.message || e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return res.status(405).json({ error: "Method Not Allowed" });
}
