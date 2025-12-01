import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { refreshToken } = body || {};
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded: any = jwt.verify(refreshToken, env.jwtSecret || "");
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = jwt.sign({ userId: user.id, type: "access" }, env.jwtSecret || "", { expiresIn: "24h" });
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}
