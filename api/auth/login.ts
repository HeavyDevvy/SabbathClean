import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { email, password, rememberMe } = body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { serviceProvider: true }
    });
    if (!user || !user.password) {
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    // Check if user is an approved provider
    if (user.serviceProvider?.isVerified && 
        user.serviceProvider?.verificationStatus === 'APPROVED') {
      
      // Update user role to PROVIDER if not already set
      if (user.role !== 'PROVIDER') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'PROVIDER' }
        });
        user.role = 'PROVIDER';
      }
    }

    const secret = process.env.JWT_SECRET || "";
    if (!secret) {
      console.error("Missing JWT_SECRET in environment");
      return res.status(500).json({ error: "Server config error" });
    }

    const accessToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        isProvider: !!user.serviceProvider,
        isApprovedProvider: user.serviceProvider?.verificationStatus === 'APPROVED',
        providerId: user.serviceProvider?.id || null,
        userId: user.id, // Keeping backward compatibility
        type: "access"
      },
      secret,
      { expiresIn: "24h" },
    );

    const refreshToken = rememberMe
      ? jwt.sign(
          { userId: user.id, type: "refresh" },
          secret,
          { expiresIn: "30d" },
        )
      : null;

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: (user as any).profilePictureUrl || null,
        isProvider: user.role === "PROVIDER",
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
