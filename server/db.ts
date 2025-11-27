import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const useMem = process.env.USE_MEM_STORAGE === '1';
if (!process.env.DATABASE_URL && !useMem) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = useMem
  ? null
  : new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
    });

export const db = useMem ? ({} as any) : drizzle({ client: pool as any, schema });
