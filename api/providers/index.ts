import { prisma } from "../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log('📝 Request received');
    console.log('Body keys:', Object.keys(req.body || {}));
    
    const body = req.body;
    const { userId, firstName, lastName, email } = body;
    
    console.log('User info:', { userId, firstName, lastName, email });
    
    // Try to create JUST the user first (no provider)
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    console.log('User found:', !!user);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Try minimal provider creation
    const provider = await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        businessName: `${firstName} ${lastName}`,
        description: "Test",
        category: "OTHER",
        hourlyRate: "100", // Ensure this is string if schema expects string, or number if decimal
      }
    });
    
    console.log('Provider created:', provider.id);
    
    return res.status(201).json({ success: true, providerId: provider.id });
    
  } catch (e: any) {
    console.error('❌ ERROR:', e?.message);
    console.error('Stack:', e?.stack);
    return res.status(500).json({
      error: e?.message || "Unknown error"
    });
  }
}
