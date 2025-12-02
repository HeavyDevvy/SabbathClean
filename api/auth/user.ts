import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const auth = req.headers["authorization"] || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const secret = process.env.JWT_SECRET || "";
    if (!secret) {
      console.error("Missing JWT_SECRET in environment");
      return res.status(500).json({ message: "Server config error" });
    }

    const decoded: any = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: (user as any).phoneNumber || undefined,
      profileImage: (user as any).profilePictureUrl || undefined,
      isProvider: user.role === "PROVIDER",
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return res.status(403).json({ message: "Invalid token" });
  }
}