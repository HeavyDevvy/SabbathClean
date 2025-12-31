
import { prisma } from "./lib/prisma";

async function main() {
  console.log("Checking database for APPROVED providers...");
  try {
    const providers = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: 'APPROVED'
      },
      select: {
        id: true,
        businessName: true,
        category: true,
        verificationStatus: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(JSON.stringify(providers, null, 2));
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
