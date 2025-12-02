import { prisma } from "../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const {
        userId,
        firstName,
        lastName,
        email,
        phone,
        bio,
        hourlyRate,
        servicesOffered,
        experience,
        location,
        bankingDetails,
        providerType,
        companyName,
        companyRegistration,
      } = body || {};

      if (!userId || !email || !firstName || !lastName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await prisma.serviceProvider.findUnique({ where: { userId } });
      if (existing) {
        return res.status(200).json(existing);
      }

      const provider = await prisma.serviceProvider.create({
        data: {
          userId,
          businessName: companyName || `${firstName} ${lastName}`,
          description: bio || "",
          category: "OTHER",
          hourlyRate: (hourlyRate && typeof hourlyRate === "string") ? (hourlyRate as any) : ("250.00" as any),
          portfolioImages: [],
          isVerified: true,
          verificationStatus: "APPROVED",
          bankName: bankingDetails?.bankName || null,
          accountNumber: bankingDetails?.accountNumber || null,
          accountHolderName: bankingDetails?.accountHolder || null,
          branchCode: bankingDetails?.branchCode || null,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { role: "PROVIDER" },
      });

      return res.status(201).json(provider);
    } catch (error: any) {
      console.error("Create provider error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", "POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
