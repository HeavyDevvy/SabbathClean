import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  console.log("[AdminLogin] method:", req.method);
  const hasDbUrl = !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  console.log("[AdminLogin] env:", { hasDbUrl, hasJwtSecret });
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { email, password } = body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const secret = process.env.JWT_SECRET || "";
    if (!secret) {
      console.error("[AdminLogin] JWT_SECRET missing");
      return res.status(500).json({ error: "Admin login failed" });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("[AdminLogin] ADMIN_EMAIL or ADMIN_PASSWORD missing");
      return res.status(500).json({ error: "Admin login failed" });
    }

    if ((email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const isBcryptHash = ADMIN_PASSWORD.startsWith("$2a$") || ADMIN_PASSWORD.startsWith("$2b$") || ADMIN_PASSWORD.startsWith("$2y$");
    let passwordValid = false;
    if (isBcryptHash) {
      try {
        passwordValid = await bcrypt.compare(password, ADMIN_PASSWORD);
      } catch (e: any) {
        console.error("[AdminLogin] bcrypt compare failed:", e?.message || e);
        passwordValid = false;
      }
    } else {
      passwordValid = password === ADMIN_PASSWORD;
    }
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const uemail = ADMIN_EMAIL;
    const token = jwt.sign({ userId: "env-admin", email: uemail, role: "ADMIN" }, secret, { expiresIn: "7d" });
    return res.status(200).json({ token, user: { id: "env-admin", email: uemail, role: "ADMIN" } });
  } catch (error: any) {
    console.error("[AdminLogin] error:", { name: error?.name, message: error?.message, stack: error?.stack });
    return res.status(500).json({ error: "Admin login failed" });
  }
}
