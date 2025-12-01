import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

/**
 * POST /api/auth/register
 * Handles user sign-up from the Berry Events frontend.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    } = body || {};

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        // Adjust these fields to match your actual Prisma schema:
        isActive: true,
        role: "CLIENT",
      },
    });

    // You can return minimal info to the frontend
    return NextResponse.json(
      {
        message: "Registration successful",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
    );
  }
}