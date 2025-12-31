import { prisma } from "../../../lib/prisma.js";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    console.log(`Fetching providers for service category: ${category}`);

    const categoryStr = String(category);
    
    // Robust mapping for category names to handle inconsistencies
    // Maps frontend/URL kebab-case to backend/DB SCREAMING_SNAKE_CASE and other variations
    const categoryMap: Record<string, string[]> = {
      'house-cleaning': ['HOUSE_CLEANING', 'house-cleaning', 'cleaning'],
      'cleaning': ['HOUSE_CLEANING', 'house-cleaning', 'cleaning'],
      
      'gardening': ['GARDEN_CARE', 'gardening', 'garden-care'],
      'garden-care': ['GARDEN_CARE', 'gardening', 'garden-care'],
      'garden-maintenance': ['GARDEN_CARE', 'gardening', 'garden-care'],
      
      'pool-cleaning': ['POOL_CLEANING_MAINTENANCE', 'pool-cleaning'],
      'pool-cleaning-maintenance': ['POOL_CLEANING_MAINTENANCE', 'pool-cleaning'],
      
      'chef-catering': ['CHEF_CATERING', 'chef-catering'],
      
      'plumbing': ['PLUMBING_SERVICES', 'plumbing', 'plumbing-services'],
      'plumbing-services': ['PLUMBING_SERVICES', 'plumbing', 'plumbing-services'],
      
      'electrical': ['ELECTRICAL_SERVICES', 'electrical'],
      'electrical-services': ['ELECTRICAL_SERVICES', 'electrical'],
      
      'event-staff': ['WAITERING_SERVICES', 'waitering', 'event-staff'],
      'waitering': ['WAITERING_SERVICES', 'waitering', 'event-staff'],
      
      'moving': ['MOVING_SERVICES', 'moving'],
      
      'au-pair': ['AU_PAIR_SERVICES', 'au-pair'],
      
      'locksmith': ['LOCKSMITH_SERVICES', 'locksmith'],
    };

    // Get all possible variations for the requested category
    const searchCategories = categoryMap[categoryStr] || [categoryStr];
    
    // Also add the raw category and its uppercase version just in case
    if (!searchCategories.includes(categoryStr)) searchCategories.push(categoryStr);
    const upperStr = categoryStr.toUpperCase().replace(/-/g, '_');
    if (!searchCategories.includes(upperStr)) searchCategories.push(upperStr);

    console.log(`Searching for categories: ${JSON.stringify(searchCategories)}`);

    // Fetch approved providers that offer this service
    // We handle uppercase status (Prisma Enum) and isVerified boolean
    const providers = await prisma.serviceProvider.findMany({
      where: {
        AND: [
          {
            OR: [
              { verificationStatus: 'APPROVED' },
              { isVerified: true }
            ]
          },
          {
            OR: [
              { category: { in: searchCategories as any } },
              // Prisma Postgres array contains check (using OR with has for compatibility)
              ...searchCategories.map(cat => ({ servicesOffered: { has: cat } }))
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            email: true
          }
        }
      },
      orderBy: { rating: 'desc' }
    });

    console.log(`Found ${providers.length} providers for ${category}`);

    const formatted = providers.map((p: any) => ({
      id: p.id,
      businessName: p.businessName,
      companyName: p.businessName, 
      firstName: p.user?.firstName,
      lastName: p.user?.lastName,
      email: p.user?.email,
      // phone property might not exist on provider or user in this selection
      bio: p.description,
      profileImage: p.user?.profilePictureUrl,
      
      category: p.category,
      servicesOffered: p.servicesOffered,
      
      hourlyRate: p.hourlyRate?.toString(),
      rating: p.rating?.toString(),
      totalReviews: p.totalReviews,
      
      location: p.location,
      verificationStatus: p.verificationStatus ? p.verificationStatus.toLowerCase() : 'pending',
      isVerified: p.isVerified
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    console.error('Get service providers error:', error);
    return res.status(500).json({ error: 'Failed to fetch providers', details: error.message });
  }
}
