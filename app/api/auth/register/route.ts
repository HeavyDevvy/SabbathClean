import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";
import { env } from "../../../../config/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phoneNumber, password } = body;

    // 1. Basic validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user in DB
    // ⚠️ We *do not* set role here, we let Prisma use the default (CLIENT)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,       // optional field in your schema
        password: hashedPassword,
        // role and isActive will use the defaults from your Prisma schema
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    const secret = env.jwtSecret || "";
    const accessToken = jwt.sign({ userId: user.id, type: "access" }, secret, { expiresIn: "24h" });
    const refreshToken = jwt.sign({ userId: user.id, type: "refresh" }, secret, { expiresIn: "30d" });

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Register API error", err);

    // TEMP: expose the error text so we can see what's wrong
    return NextResponse.json(
      {
        message: "Internal server error",
        error: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

// Explicit 405 for non-POST so we know if something hits the wrong method
export function GET() {
  return NextResponse.json(
    { message: "Method Not Allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
