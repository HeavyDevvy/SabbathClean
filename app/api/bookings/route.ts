import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "../../../lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const body = await request.json()
    const {
      providerId,
      eventDate,
      eventTime,
      eventDuration,
      eventType,
      eventLocation,
      numberOfGuests,
      specialRequests,
      totalAmount,
    } = body || {}

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        providerId,
        eventDate: new Date(eventDate),
        eventTime,
        eventDuration,
        eventType,
        eventLocation,
        numberOfGuests,
        specialRequests,
        totalAmount,
        status: "PENDING",
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    )
  }
}

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    )
  }
}

