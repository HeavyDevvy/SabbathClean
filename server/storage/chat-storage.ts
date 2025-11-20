import { 
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  conversations,
  messages
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IChatStorage {
  getOrCreateConversation(bookingId: string, customerId: string, providerId: string): Promise<Conversation>;
  getConversation(conversationId: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getProviderConversations(providerId: string): Promise<Conversation[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
}

export class ChatStorage implements IChatStorage {
  async getOrCreateConversation(bookingId: string, customerId: string, providerId: string): Promise<Conversation> {
    // Try to find existing conversation
    let [conversation] = await db.select().from(conversations)
      .where(and(
        eq(conversations.bookingId, bookingId),
        eq(conversations.customerId, customerId),
        eq(conversations.providerId, providerId)
      ));
    
    // Create if doesn't exist
    if (!conversation) {
      [conversation] = await db.insert(conversations).values({
        bookingId,
        customerId,
        providerId,
        status: "active",
      }).returning();
    }
    
    return conversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations)
      .where(eq(conversations.id, conversationId));
    return conversation || undefined;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.customerId, userId))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getProviderConversations(providerId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.providerId, providerId))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    // Insert message
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update conversation lastMessageAt
    await db.update(conversations)
      .set({ 
        lastMessageAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db.update(messages)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(and(
        eq(messages.conversationId, conversationId),
        sql`${messages.senderId} != ${userId}`,
        eq(messages.isRead, false)
      ));
  }
}
