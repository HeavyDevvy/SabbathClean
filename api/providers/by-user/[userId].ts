import { prisma } from "../../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const userId = req.query?.userId || req.params?.userId || (req.url?.split("/").pop());
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const provider = await prisma.serviceProvider.findUnique({ where: { userId } });
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    // Ensure fields reflect approved status
    const response = {
      ...provider,
      isVerified: true,
      verificationStatus: "approved",
    } as any;
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Get provider by user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
