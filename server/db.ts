import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

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

if (!process.env.DATABASE_URL && !useMem) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = useMem
  ? null
  : new Pool({
      connectionString: normalizeConnectionString(process.env.DATABASE_URL!),
      max: 20,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
    });

export const db = useMem ? ({} as any) : drizzle({ client: pool as any, schema });
