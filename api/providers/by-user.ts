// @ts-ignore
const { prisma } = require("../../lib/prisma.js");

module.exports = async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Support /api/providers/by-user and /api/providers/by-user/:userId via rewrite
    const url = req.url || "";
    const parts = url.split("/").filter(Boolean);
    const tail = parts[parts.length - 1];
    const userId = req.query?.userId || (tail !== "by-user" ? tail : undefined);

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const provider = await prisma.serviceProvider.findUnique({ where: { userId } });
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    return res.status(200).json(provider);
  } catch (error: any) {
    console.error("Get provider by user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
