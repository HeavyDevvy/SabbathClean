import { PrismaClient } from '@prisma/client/index.js'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
    adapter: new PrismaPg(new Pool({ 
      connectionString: (() => {
        const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
        if (url) {
           const masked = url.replace(/(:[^:@]+@)/, ':****@');
           console.log(`[PRISMA] Initializing client with URL from ${process.env.POSTGRES_URL ? 'POSTGRES_URL' : 'DATABASE_URL'}: ${masked}`);
           if (url.includes('prisma-data.net')) {
             console.warn('[PRISMA] WARNING: Using Prisma Accelerate URL with pg adapter. This WILL fail.');
           }
        }
        return url;
      })()
    }))
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
