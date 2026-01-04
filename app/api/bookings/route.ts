import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { storage } from "../../../server/storage"

function generateBookingReference() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BE-${year}-${randomChars}`;
}

export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions as any)

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

    // Map to storage schema
    // Note: storage.createBooking expects fields matching InsertBooking schema
    // We need to map frontend fields to schema fields
    const bookingReference = generateBookingReference();
    
    const bookingData: any = {
      customerId: session.user.id,
      providerId,
      serviceId: "unknown-service", // Fallback or need to fetch/derive
      bookingNumber: bookingReference, // Use reference as number for consistency
      bookingReference,
      scheduledDate: new Date(eventDate),
      scheduledTime: eventTime,
      duration: eventDuration || 2,
      totalPrice: String(totalAmount || "0"),
      serviceType: eventType || "General",
      address: eventLocation || "Not provided",
      specialInstructions: specialRequests,
      status: "pending-provider", // Lowercase status for Drizzle/Schema
      paymentStatus: "pending",
      numberOfGuests: numberOfGuests, // Note: Schema might not have this, checked schema: it has numberOfGuests Int?
    };

    // Note: In storage.createBooking, we need serviceId.
    // If body doesn't provide it, we might fail constraint.
    // We will try to fetch a default service if needed or assume frontend sends it?
    // The previous Prisma code didn't use serviceId?
    // Prisma schema: serviceId String @references...
    // The previous code:
    // const booking = await prisma.booking.create({ ... data: { ... serviceId is MISSING in previous code! } ... })
    // Wait, the previous code I read DID NOT have serviceId in data.
    // But schema.prisma says serviceId is a relation and required?
    // model Booking { ... serviceId String ... }
    // If previous code didn't provide it, Prisma would throw error!
    // Maybe that was the error? "The column (not available) does not exist"??
    // Or maybe serviceId has a default? No default in schema.
    
    // We must provide serviceId.
    // Let's look up a service by type.
    const services = await storage.getServicesByCategory(eventType);
    if (services.length > 0) {
        bookingData.serviceId = services[0].id;
    } else {
        // Fallback to any service or fail?
        // Let's try to get all services
        const allServices = await storage.getAllServices();
        if (allServices.length > 0) bookingData.serviceId = allServices[0].id;
    }

    const booking = await storage.createBooking(bookingData);

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Failed to create booking", details: (error as any).message },
      { status: 500 },
    )
  }
}

export async function GET(_request: Request) {
  try {
    const session: any = await getServerSession(authOptions as any)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const bookings = await storage.getBookingsByCustomer(session.user.id);

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    )
  }
}

