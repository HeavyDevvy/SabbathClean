import { 
  type Notification,
  type InsertNotification,
  notifications
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface INotificationStorage {
  getNotificationsByUser(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteExpiredNotifications(): Promise<void>;
}

export class NotificationStorage implements INotificationStorage {
  async getNotificationsByUser(userId: string, limit: number = 50): Promise<Notification[]> {
    const result = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
    return result;
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    return Number(result[0]?.count || 0);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications)
      .values(notification)
      .returning();
    return result;
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
  }

  async deleteExpiredNotifications(): Promise<void> {
    await db.delete(notifications)
      .where(
        and(
          sql`${notifications.expiresAt} IS NOT NULL`,
          sql`${notifications.expiresAt} < NOW()`
        )
      );
  }
}
