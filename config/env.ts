export const env = {
  databaseUrl: process.env.DATABASE_URL || "",
  publicApiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || "",
  appBaseUrl: process.env.APP_BASE_URL || process.env.FRONTEND_URL || "",
  jwtSecret: process.env.JWT_SECRET || process.env.AUTH_SECRET || "",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
};

export function resolveAppBaseUrl(fallbackOrigin?: string): string {
  return env.appBaseUrl || fallbackOrigin || "";
}
