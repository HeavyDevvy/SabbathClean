import type { IStorage } from "./storage";
import type { InsertNotification } from "@shared/schema";

export class NotificationHelper {
  constructor(private storage: IStorage) {}

  async createBookingNotification(
    userId: string,
    bookingId: string,
    type: 'booking_created' | 'booking_confirmed' | 'booking_completed' | 'booking_cancelled',
    providerName?: string
  ) {
    const messages = {
      booking_created: {
        title: "Booking Created",
        message: `Your booking has been created successfully.`,
        actionUrl: `/my-bookings`
      },
      booking_confirmed: {
        title: "Booking Confirmed",
        message: `Your booking with ${providerName || 'provider'} has been confirmed.`,
        actionUrl: `/my-bookings`
      },
      booking_completed: {
        title: "Service Completed",
        message: `Your service has been completed. Please leave a review!`,
        actionUrl: `/my-bookings`
      },
      booking_cancelled: {
        title: "Booking Cancelled",
        message: `Your booking has been cancelled.`,
        actionUrl: `/my-bookings`
      }
    };

    const notification: InsertNotification = {
      userId,
      type,
      title: messages[type].title,
      message: messages[type].message,
      data: { bookingId },
      actionUrl: messages[type].actionUrl,
      isRead: false
    };

    return await this.storage.createNotification(notification);
  }

  async createPaymentNotification(
    userId: string,
    amount: number,
    paymentType: 'payment_received' | 'payment_processed' | 'refund_issued',
    bookingId?: string
  ) {
    const messages = {
      payment_received: {
        title: "Payment Received",
        message: `We've received your payment of R${amount.toFixed(2)}.`,
        actionUrl: bookingId ? `/my-bookings` : `/wallet`
      },
      payment_processed: {
        title: "Payment Processed",
        message: `Your payment of R${amount.toFixed(2)} has been processed successfully.`,
        actionUrl: bookingId ? `/my-bookings` : `/wallet`
      },
      refund_issued: {
        title: "Refund Issued",
        message: `A refund of R${amount.toFixed(2)} has been issued to your account.`,
        actionUrl: `/wallet`
      }
    };

    const notification: InsertNotification = {
      userId,
      type: paymentType,
      title: messages[paymentType].title,
      message: messages[paymentType].message,
      data: { amount, bookingId },
      actionUrl: messages[paymentType].actionUrl,
      isRead: false
    };

    return await this.storage.createNotification(notification);
  }

  async createMessageNotification(
    userId: string,
    senderName: string,
    conversationId: string,
    messagePreview: string
  ) {
    const notification: InsertNotification = {
      userId,
      type: 'message_received',
      title: "New Message",
      message: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
      data: { conversationId },
      actionUrl: `/chat/${conversationId}`,
      isRead: false
    };

    return await this.storage.createNotification(notification);
  }

  async createReviewNotification(
    userId: string,
    customerName: string,
    rating: number,
    bookingId: string
  ) {
    const notification: InsertNotification = {
      userId,
      type: 'review_received',
      title: "New Review",
      message: `${customerName} left you a ${rating}-star review!`,
      data: { bookingId, rating },
      actionUrl: `/provider/reviews`,
      isRead: false
    };

    return await this.storage.createNotification(notification);
  }

  async createWelcomeNotification(userId: string) {
    const notification: InsertNotification = {
      userId,
      type: 'system',
      title: "Welcome to Berry Events!",
      message: "Thank you for joining Berry Events. Book your first service and enjoy premium domestic services.",
      actionUrl: "/",
      isRead: false
    };

    return await this.storage.createNotification(notification);
  }
}
