import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Session } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as Session | null
    const userId = (session as any)?.user?.id as string | undefined

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const body = await request.json()
    const {
      businessName,
      description,
      category,
      hourlyRate,
      bankName,
      accountNumber,
      accountHolderName,
      branchCode,
    } = body || {}

    const provider = await prisma.serviceProvider.create({
      data: {
        userId: userId,
        businessName,
        description,
        category,
        hourlyRate,
        bankName,
        accountNumber,
        accountHolderName,
        branchCode,
        verificationStatus: "APPROVED",
        isVerified: true,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { role: "PROVIDER" },
    })

    return NextResponse.json(
      { message: "Provider registered successfully", provider },
      { status: 201 },
    )
  } catch (error) {
    console.error("Provider registration error:", error)
    return NextResponse.json(
      { error: "Failed to register provider" },
      { status: 500 },
    )
  }
}
