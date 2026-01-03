import type { IncomingMessage, ServerResponse } from "http";
import { prisma } from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }
  try {
    const url = req.url || "";
    const parts = url.split("/").filter(Boolean);
    const bookingId = parts[parts.length - 1];
    console.log('=== FETCHING BOOKING ===');
    console.log('Looking for booking ID:', bookingId);
    
    if (!bookingId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "bookingId required" }));
      return;
    }
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    let userId: string | undefined = undefined;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
        userId = decoded?.userId;
      } catch {}
    }
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    
    console.log('BOOKING FOUND:', booking ? 'YES' : 'NO');
    if (booking) {
      console.log('BOOKING DATA:', JSON.stringify({ id: booking.id, status: booking.status }, null, 2));
    } else {
      console.error('❌ NO BOOKING FOUND FOR ID:', bookingId);
    }

    if (!booking) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Booking not found" }));
      return;
    }
    
    // Allow public access if no user ID (for confirmation page) but limit details if needed
    if (userId && booking.userId !== userId) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "Forbidden" }));
      return;
    }

    const payment = await prisma.payment.findUnique({ where: { bookingId: bookingId } });
    
    // Get provider details
    const provider = await prisma.serviceProvider.findUnique({ 
      where: { id: booking.providerId },
      include: { user: true }
    });
    
    // Get user details
    const user = await prisma.user.findUnique({ where: { id: booking.userId } });

    const subtotal = String(booking.totalAmount || "0");
    const platformFee = String((Number(subtotal) * 0.15).toFixed(2));
    const totalAmount = String((Number(subtotal) + Number(platformFee)).toFixed(2));
    const order = {
      id: booking.id,
      orderNumber: `BE-${new Date(booking.createdAt).getFullYear()}-${booking.id.slice(-6)}`,
      createdAt: booking.createdAt,
      subtotal,
      platformFee,
      totalAmount,
      paymentMethod: payment?.paymentMethod || "card",
      paymentStatus: payment?.paymentStatus || "COMPLETED",
      eventLocation: booking.eventLocation,
      providerName: provider?.businessName || (provider?.user ? `${provider.user.firstName} ${provider.user.lastName}` : "Assigned Provider"),
      providerPhone: provider?.user?.phoneNumber || "",
      userEmail: user?.email || "",
      userPhone: user?.phoneNumber || "",
      items: [
        {
          id: booking.id,
          serviceId: booking.eventType,
          serviceType: booking.eventType,
          serviceName: booking.eventType,
          scheduledDate: booking.eventDate,
          scheduledTime: booking.eventTime,
          duration: booking.eventDuration,
          basePrice: subtotal,
          addOnsPrice: "0",
          subtotal,
          tipAmount: "0",
          serviceDetails: {
             address: booking.eventLocation
          },
          selectedAddOns: [],
          comments: booking.specialRequests,
        },
      ],
    };
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(order));
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: e?.message || "Failed to fetch booking" }));
  }
}
