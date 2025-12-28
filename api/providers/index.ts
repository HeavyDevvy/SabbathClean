import { prisma } from "../../lib/prisma.js";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    console.log('Provider registration:', body.email);
    
    const {
      email,
      firstName,
      lastName,
      phone,
      bio,
      hourlyRate,
      servicesOffered,
      category,
      experience,
      location,
      bankingDetails,
      providerType
    } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { serviceProvider: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already has provider
    if (user.serviceProvider) {
      return res.status(409).json({
        error: 'Provider already exists',
        providerId: user.serviceProvider.id
      });
    }

    // Map category to enum
    const validCategories = [
      "HOUSE_CLEANING",
      "PLUMBING_SERVICES",
      "ELECTRICAL_SERVICES",
      "GARDEN_CARE",
      "POOL_CLEANING_MAINTENANCE",
      "CHEF_CATERING",
      "WAITERING_SERVICES",
      "MOVING_SERVICES",
      "AU_PAIR_SERVICES",
      "LOCKSMITH_SERVICES"
    ];

    let finalCategory = category;
    if (!validCategories.includes(category)) {
      // Try to map from servicesOffered
      const firstService = Array.isArray(servicesOffered) ? servicesOffered[0] : null;
      if (firstService && validCategories.includes(firstService)) {
        finalCategory = firstService;
      } else {
        return res.status(400).json({
          error: 'Invalid service category. Please select a valid service.'
        });
      }
    }

    // Create provider
    const provider = await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        businessName: `${firstName} ${lastName}`.trim(),
        description: bio || `Professional ${finalCategory.toLowerCase().replace(/_/g, ' ')} service provider`,
        category: finalCategory,
        servicesOffered: Array.isArray(servicesOffered) ? servicesOffered : [finalCategory],
        hourlyRate: parseFloat(hourlyRate) || 250,
        experience: experience || null,
        location: location || null,
        bankName: bankingDetails?.bankName || null,
        accountNumber: bankingDetails?.accountNumber || null,
        accountHolderName: bankingDetails?.accountHolder || null,
        branchCode: bankingDetails?.branchCode || null,
        accountType: bankingDetails?.accountType || null,
        verificationStatus: 'PENDING',
        isVerified: false,
      }
    });

    console.log('Provider created:', provider.id, 'Category:', provider.category);

    return res.status(201).json({
      success: true,
      providerId: provider.id,
      category: provider.category
    });

  } catch (error: any) {
    console.error('Provider creation error:', error);
    return res.status(500).json({
      error: 'Failed to create provider',
      details: error.message
    });
  }
}