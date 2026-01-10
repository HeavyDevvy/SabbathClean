import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

const useMem = process.env.USE_MEM_STORAGE === '1';

function normalizeConnectionString(url: string) {
  try {
    const u = new URL(url);
    const params = u.searchParams;
    if (!params.has('pgbouncer')) params.set('pgbouncer', 'true');
    if (!params.has('connect_timeout')) params.set('connect_timeout', '5');
    if (!params.has('sslmode')) params.set('sslmode', 'require');
    u.search = params.toString();
    return u.toString();
  } catch {
    return url;
  }
}

if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !useMem) {
  throw new Error(
    "DATABASE_URL or POSTGRES_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = useMem
  ? null
  : new Pool({
      connectionString: (() => {
        const url = process.env.POSTGRES_URL || process.env.DATABASE_URL!;
        if (url) {
          const masked = url.replace(/(:[^:@]+@)/, ':****@');
          console.log(`[DB] Initializing pool with URL from ${process.env.POSTGRES_URL ? 'POSTGRES_URL' : 'DATABASE_URL'}: ${masked}`);
          if (url.includes('prisma-data.net')) {
             console.warn('[DB] WARNING: Using Prisma Accelerate URL for Drizzle/PG connection. This may fail.');
          }
        }
        return normalizeConnectionString(url);
      })(),
      max: 20,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });

export const db = useMem ? ({} as any) : drizzle({ client: pool as any, schema });
