// @ts-ignore
const { prisma } = require("../../lib/prisma.js");
const jwt = require("jsonwebtoken");

module.exports = async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }
  try {
    const auth = req.headers["authorization"] || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
    if (!token) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: "Unauthorized" }));
      return;
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
    const user = await prisma.user.findUnique({ where: { id: decoded?.userId } });
    if (!user) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "User not found" }));
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Failed to fetch admin info" }));
  }
}

