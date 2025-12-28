import { prisma } from "../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      console.log("Received provider create body:", body);
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
        category,
      } = body || {};

      if (!userId || !email || !firstName || !lastName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await prisma.serviceProvider.findUnique({ where: { userId } });
      if (existing) {
        return res.status(200).json(existing);
      }

      const validCategories = new Set([
      "HOUSE_CLEANING",
      "PLUMBING_SERVICES",
      "ELECTRICAL_SERVICES",
      "GARDEN_CARE",
      "POOL_CLEANING_MAINTENANCE",
      "CHEF_CATERING",
      "WAITERING_SERVICES",
      "MOVING_SERVICES",
      "AU_PAIR_SERVICES",
      "LOCKSMITH_SERVICES",
      "OTHER"
    ]);

    console.log('🔍 CATEGORY DEBUG:');
    console.log('Raw body.category:', category);
    console.log('Raw body.servicesOffered:', servicesOffered);

    const rawCat = category || (Array.isArray(servicesOffered) ? servicesOffered[0] : undefined);
    console.log('rawCat:', rawCat);
    
    // Normalize: convert to uppercase and replace spaces/hyphens with underscores
    const normalized = typeof rawCat === "string" 
      ? rawCat.toUpperCase().replace(/[-\s&]+/g, "_") 
      : "OTHER";
    console.log('normalized:', normalized);
      
    const mappedCategory = validCategories.has(normalized) ? normalized : "OTHER";
    console.log('mappedCategory:', mappedCategory);
    console.log('Was in valid set?', validCategories.has(normalized));

      const provider = await prisma.serviceProvider.create({
        data: {
          userId,
          businessName: companyName || `${firstName} ${lastName}`,
          description: bio || "",
          category: mappedCategory as any,
          hourlyRate: (hourlyRate && typeof hourlyRate === "string") ? (hourlyRate as any) : ("250.00" as any),
          portfolioImages: [],
          isVerified: false,
          verificationStatus: "PENDING",
          bankName: bankingDetails?.bankName || null,
          accountNumber: bankingDetails?.accountNumber || null,
          accountHolderName: bankingDetails?.accountHolder || null,
          branchCode: bankingDetails?.branchCode || null,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { role: "PROVIDER", phoneNumber: phone || undefined },
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
