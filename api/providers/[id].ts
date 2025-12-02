import { prisma } from "../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const id = req.query?.id || req.params?.id || (req.url?.split("/").pop());
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }
    const provider = await prisma.serviceProvider.findUnique({ where: { id } });
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    const response = {
      ...provider,
      isVerified: true,
      verificationStatus: "approved",
    } as any;
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Get provider error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
