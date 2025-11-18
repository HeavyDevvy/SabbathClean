import type { Express, Request, Response } from "express";
import type { IStorage } from "./storage";
import { insertNotificationSchema } from "@shared/schema";
import { authenticateToken } from "./auth-routes";

export function registerNotificationRoutes(app: Express, storage: IStorage) {
  
  // Get notifications for a user
  app.get("/api/notifications", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getNotificationsByUser(userId, limit);
      res.json(notifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get unread notifications count
  app.get("/api/notifications/unread-count", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error: any) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Mark a notification as read
  app.patch("/api/notifications/:id/read", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      await storage.markNotificationAsRead(req.params.id, userId);
      res.json({ message: "Notification marked as read" });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Mark all notifications as read
  app.post("/api/notifications/mark-all-read", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
