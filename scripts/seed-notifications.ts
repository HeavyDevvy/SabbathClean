import { db } from "../server/db";
import { notifications } from "../shared/schema";
import type { InsertNotification } from "../shared/schema";

async function seedNotifications() {
  try {
    console.log("🌱 Seeding sample notifications...");

    // Get a user ID from the database (we'll use the first user we find)
    const users = await db.query.users.findMany({ limit: 1 });
    
    if (users.length === 0) {
      console.log("❌ No users found. Please create a user first.");
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`📌 Using user ID: ${userId}`);

    const sampleNotifications: InsertNotification[] = [
      {
        userId,
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: "Your house cleaning service with Sarah M. has been confirmed for Nov 20, 2025.",
        actionUrl: "/my-bookings",
        isRead: false
      },
      {
        userId,
        type: "payment_received",
        title: "Payment Received",
        message: "We've received your payment of R450.00.",
        data: { amount: 450 },
        actionUrl: "/my-bookings",
        isRead: false
      },
      {
        userId,
        type: "message_received",
        title: "New Message",
        message: "Sarah M.: Hi! I'm looking forward to cleaning your home tomorrow. Please let me know if you have any specific requirements.",
        actionUrl: "/chat/123",
        isRead: false
      },
      {
        userId,
        type: "booking_created",
        title: "Booking Created",
        message: "Your plumbing service booking has been created successfully.",
        actionUrl: "/my-bookings",
        isRead: true
      },
      {
        userId,
        type: "system",
        title: "Welcome to Berry Events!",
        message: "Thank you for joining Berry Events. Book your first service and enjoy premium domestic services.",
        actionUrl: "/",
        isRead: true
      }
    ];

    // Insert notifications
    for (const notification of sampleNotifications) {
      await db.insert(notifications).values(notification);
      console.log(`✅ Created: ${notification.title}`);
    }

    console.log("🎉 Seeding completed successfully!");
    console.log(`📊 Created ${sampleNotifications.length} notifications`);
    
  } catch (error) {
    console.error("❌ Error seeding notifications:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedNotifications();
