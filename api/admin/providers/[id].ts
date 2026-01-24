// @ts-ignore
const jwt = require("jsonwebtoken");
// @ts-ignore
const { prisma } = require("../../../lib/prisma.js");

module.exports = async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  
  if (req.method !== "POST" && req.method !== "PATCH") {
    res.setHeader("Allow", "POST, PATCH");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Auth check
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

    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Get providerId from URL path
    const { id: providerId } = req.query;
    
    if (!providerId || typeof providerId !== 'string') {
      return res.status(400).json({ error: "Provider ID required" });
    }

    // Get action from request body
    const { action } = req.body || {};
    
    if (!action || (action !== 'approve' && action !== 'decline')) {
      return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'decline'" });
    }

    // Check if provider exists
    const existing = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: { user: true }
    });

    if (!existing) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Perform action
    let updated;
    if (action === 'approve') {
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
    console.error("Provider action error:", e?.message || e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
