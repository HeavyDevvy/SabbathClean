import type { Express, Request, Response } from "express";
import type { IStorage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export function registerChatRoutes(app: Express, storage: IStorage) {
  
  // Get or create conversation for a booking
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { bookingId, customerId, providerId } = req.body;
      
      if (!bookingId || !customerId || !providerId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const conversation = await storage.getOrCreateConversation(bookingId, customerId, providerId);
      res.json(conversation);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user's conversations
  app.get("/api/conversations/user/:userId", async (req: Request, res: Response) => {
    try {
      const conversations = await storage.getUserConversations(req.params.userId);
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching user conversations:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get provider's conversations
  app.get("/api/conversations/provider/:providerId", async (req: Request, res: Response) => {
    try {
      const conversations = await storage.getProviderConversations(req.params.providerId);
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching provider conversations:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Send a message
  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.sendMessage(messageData);
      
      // Broadcast message via WebSocket if available
      if (typeof (app as any).broadcastChatMessage === 'function') {
        (app as any).broadcastChatMessage(messageData.conversationId, message);
      }
      
      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: error.message });
    }
  });
  
  // Mark messages as read
  app.post("/api/conversations/:id/mark-read", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      await storage.markMessagesAsRead(req.params.id, userId);
      res.json({ message: "Messages marked as read" });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
