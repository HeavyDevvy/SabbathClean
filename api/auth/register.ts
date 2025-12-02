import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { email, password, firstName, lastName, phoneNumber } = body || {};

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName,
        lastName,
        phoneNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const secret = process.env.JWT_SECRET || "";
    const accessToken = jwt.sign({ userId: user.id, type: "access" }, secret, { expiresIn: "24h" });
    const refreshToken = jwt.sign({ userId: user.id, type: "refresh" }, secret, { expiresIn: "30d" });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isProvider: user.role === "PROVIDER",
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
