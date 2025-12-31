
import { config } from "dotenv";
config();
console.log("DATABASE_URL starts with:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : "undefined");
import { prisma } from "./lib/prisma.js";

async function main() {
  const providers = await prisma.serviceProvider.findMany({
    include: { user: true }
  });
  
  console.log("Providers found:", providers.length);
  
  for (const p of providers) {
    console.log(`Provider: ${p.id} (${p.user.firstName} ${p.user.lastName})`);
    console.log(`  verificationStatus: ${p.verificationStatus}`);
    console.log(`  isVerified: ${p.isVerified}`);
    console.log(`  user.isProvider: ${p.user.isProvider}`);
    console.log(`  user.role: ${p.user.role}`);
    console.log("-------------------");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
