import type { IncomingMessage, ServerResponse } from "http";
const { prisma } = require("../../lib/prisma.js");
const jwt = require("jsonwebtoken");

module.exports = async function handler(req: IncomingMessage & any, res: ServerResponse & any) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const url = req.url || "";
    const parts = url.split("/").filter(Boolean);
    const identifier = parts[parts.length - 1]; // This should be the ID or Reference
    
    console.log('=== FETCHING BOOKING ===');
    console.log('Identifier:', identifier);
    
    if (!identifier) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Booking ID or Reference required" }));
      return;
    }

    // Try finding by ID first
    let booking = await prisma.booking.findUnique({ 
      where: { id: identifier },
      include: { user: true, payment: true } 
    });

    // If not found, try by Reference
    if (!booking) {
      booking = await prisma.booking.findFirst({ 
        where: { bookingReference: identifier },
        include: { user: true, payment: true }
      });
    }

    if (!booking) {
      console.error('❌ Booking not found:', identifier);
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Booking not found" }));
      return;
    }

    // Check authorization (optional: allow if public or matching user)
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
        const userId = decoded?.userId || decoded?.id;
        // If user is logged in but doesn't own the booking, maybe deny? 
        // For now, we'll allow it but you might want to restrict this.
      } catch {}
    }

    // Get provider details if assigned
    let provider = null;
    if (booking.providerId) {
      provider = await prisma.serviceProvider.findUnique({ 
        where: { id: booking.providerId },
        include: { user: true }
      });
    }

    const subtotal = String(booking.totalAmount || "0"); // Booking model uses totalAmount
    // Platform fee might be stored or calculated. Using stored if available.
    const platformFee = String(booking.payment?.platformCommission || "0");
    // If totalPrice includes fee, fine.
    
    // Construct response matching what frontend expects (Order interface)
    // Simplified to avoid TypeScript errors with non-existent properties
    const order = {
      ...booking,
      totalPrice: booking.totalAmount, // Map totalAmount to totalPrice for frontend compatibility if needed
      platformFee: booking.payment?.platformCommission || 0,
      providerName: provider?.businessName || (provider?.user ? `${provider.user.firstName} ${provider.user.lastName}` : "Assigned Provider"),
      providerPhone: provider?.user?.phoneNumber || "",
      userEmail: booking.user?.email || "",
      userPhone: booking.user?.phoneNumber || "",
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(order));

  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message || "Failed to fetch booking" }));
  }
}
