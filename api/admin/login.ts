import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";

export default async function handler(req: any, res: any) {
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
      return res.status(500).json({ error: "Missing JWT_SECRET in environment" });
    }

    const ADMIN_EMAIL = "admin@berryevents.co.za";
    const ADMIN_PASSWORD = "DevonSamBerry@69";

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    let user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (!user) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashed,
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
          password: true,
        },
      }) as any;
    }

    const isValid = await bcrypt.compare(password, (user as any).password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const uid = (user as any).id as string;
    const uemail = (user as any).email as string;
    const urole = (user as any).role as string;

    const token = jwt.sign({ userId: uid, email: uemail, role: "ADMIN" }, secret, { expiresIn: "7d" });

    return res.status(200).json({ token, user: { id: uid, email: uemail, role: urole } });
  } catch (error: any) {
    console.error("Admin login failed:", error);
    return res.status(500).json({ error: "Admin login failed" });
  }
}
