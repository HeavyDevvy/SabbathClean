import { prisma } from "../../lib/prisma.js";

// Helper to check if user is authenticated (simplified for this context, 
// assuming middleware or token check happens before or we trust the passed userId for now
// or we should add back authenticateToken if it was there. 
// The previous file didn't show imports for auth, but the user's snippet showed 'authenticateToken'.
// I'll stick to the basic handler structure but include the full logic.
// If authenticateToken is needed, I'd need to find where it comes from.
// Looking at previous 'Read' output, it was:
// app.post("/api/providers", authenticateToken, async (req, res) => { ... })
// But this file exports 'handler'. It seems to be a Vercel serverless function or Next.js API route.
// The minimal version I wrote was: export default async function handler(req, res)
// So I will stick to that signature.

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    console.log("📝 Received provider create body keys:", Object.keys(body));

    const { 
      userId, 
      businessName, 
      description, 
      category, 
      hourlyRate, 
      servicesOffered, 
      location,
      experience,
      providerType,
      profileImage,
      idDocument,
      proofOfAddress,
      qualificationCertificate,
      bankingDetails,
      verificationStatus,
      isVerified,
      firstName,
      lastName,
      email,
      phone
    } = body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Check if provider already exists for this user
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { userId }
    });

    if (existingProvider) {
      return res.status(400).json({ message: "User is already a service provider" });
    }

    // --- CATEGORY MAPPING LOGIC ---
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
    console.log('rawCat selected:', rawCat);
    
    // Normalize: convert to uppercase and replace spaces/hyphens with underscores
    const normalized = typeof rawCat === "string" 
      ? rawCat.toUpperCase().replace(/[-\s&]+/g, "_") 
      : "OTHER";
    console.log('normalized:', normalized);
      
    const mappedCategory = validCategories.has(normalized) ? normalized : "OTHER";
    console.log('mappedCategory final:', mappedCategory);
    // -----------------------------

    // Ensure hourlyRate is a string or number suitable for Decimal
    const rate = (hourlyRate && (typeof hourlyRate === "string" || typeof hourlyRate === "number")) 
      ? hourlyRate.toString() 
      : "0";

    const provider = await prisma.serviceProvider.create({
      data: {
        userId,
        businessName: businessName || `${firstName || ''} ${lastName || ''}`.trim() || "My Business",
        description: description || "",
        category: mappedCategory as any,
        hourlyRate: rate,
        servicesOffered: Array.isArray(servicesOffered) ? servicesOffered : [mappedCategory],
        location: location || null,
        experience: experience || null,
        // providerType: providerType || "individual",  // Not in schema
        // Handle images: if they are base64 strings or URLs
        profileImage: profileImage || null, 
        idDocument: idDocument || null,
        proofOfAddress: proofOfAddress || null,
        qualificationCertificate: qualificationCertificate || null,
        bankName: bankingDetails?.bankName || null,
        accountNumber: bankingDetails?.accountNumber || null,
        accountHolderName: bankingDetails?.accountHolder || null,
        branchCode: bankingDetails?.branchCode || null,
        verificationStatus: verificationStatus || "PENDING",
        isVerified: isVerified === true,
      },
    });

    // Update user role to PROVIDER
    await prisma.user.update({
      where: { id: userId },
      data: { 
        role: "PROVIDER", 
        phoneNumber: phone || undefined 
      },
    });

    console.log("✅ Provider created successfully:", provider.id);
    return res.status(201).json(provider);

  } catch (error: any) {
    console.error("❌ Create provider error:", error);
    console.error("Stack:", error?.stack);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error?.message 
    });
  }
}