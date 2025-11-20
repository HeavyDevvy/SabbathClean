import { 
  type Cart,
  type InsertCart,
  type CartItem,
  type InsertCartItem,
  carts,
  cartItems
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface ICartStorage {
  getOrCreateCart(userId?: string, sessionToken?: string): Promise<Cart>;
  mergeGuestCartToUser(sessionToken: string, userId: string): Promise<Cart>;
  getCart(cartId: string): Promise<Cart | undefined>;
  getCartWithItems(cartId: string): Promise<{ cart: Cart; items: CartItem[] } | undefined>;
  addItemToCart(cartId: string, item: InsertCartItem): Promise<CartItem>;
  updateCartItem(itemId: string, updates: Partial<CartItem>): Promise<CartItem>;
  removeCartItem(itemId: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  getCartItemCount(cartId: string): Promise<number>;
}

export class CartStorage implements ICartStorage {
  async getOrCreateCart(userId?: string, sessionToken?: string): Promise<Cart> {
    // Require at least one identifier to prevent orphan carts
    if (!userId && !sessionToken) {
      throw new Error("Cart requires either userId or sessionToken");
    }

    // Try to find existing active cart that hasn't expired
    let cart: Cart | undefined;
    const now = new Date();
    
    if (userId) {
      [cart] = await db.select().from(carts)
        .where(and(
          eq(carts.userId, userId),
          eq(carts.status, "active"),
          sql`${carts.expiresAt} > ${now}` // Check not expired
        ))
        .limit(1);
    } else if (sessionToken) {
      [cart] = await db.select().from(carts)
        .where(and(
          eq(carts.sessionToken, sessionToken),
          eq(carts.status, "active"),
          sql`${carts.expiresAt} > ${now}` // Check not expired
        ))
        .limit(1);
    }

    // Create new cart if none exists or existing one expired
    if (!cart) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14); // Cart expires in 14 days

      [cart] = await db.insert(carts).values({
        userId: userId || null,
        sessionToken: sessionToken || null,
        status: "active",
        expiresAt
      }).returning();
    }

    return cart;
  }

  async mergeGuestCartToUser(sessionToken: string, userId: string): Promise<Cart> {
    // Get guest cart
    const [guestCart] = await db.select().from(carts)
      .where(and(
        eq(carts.sessionToken, sessionToken),
        eq(carts.status, "active")
      ))
      .limit(1);

    if (!guestCart) {
      // No guest cart to merge, just create/get user cart
      return this.getOrCreateCart(userId);
    }

    // Get or create user cart
    const userCart = await this.getOrCreateCart(userId);

    // Move all items from guest cart to user cart
    const guestItems = await db.select().from(cartItems)
      .where(eq(cartItems.cartId, guestCart.id));

    if (guestItems.length > 0) {
      // Update cart ID for all items
      await db.update(cartItems)
        .set({ cartId: userCart.id })
        .where(eq(cartItems.cartId, guestCart.id));
    }

    // Mark guest cart as converted
    await db.update(carts)
      .set({ status: "converted" })
      .where(eq(carts.id, guestCart.id));

    return userCart;
  }

  async getCart(cartId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, cartId));
    return cart || undefined;
  }

  async getCartWithItems(cartId: string): Promise<{ cart: Cart; items: CartItem[] } | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, cartId));
    if (!cart) return undefined;

    const items = await db.select().from(cartItems)
      .where(eq(cartItems.cartId, cartId))
      .orderBy(desc(cartItems.addedAt));

    return { cart, items };
  }

  async addItemToCart(cartId: string, item: InsertCartItem): Promise<CartItem> {
    // Check for duplicate service on same date/time (deduplicate)
    // Build conditions array and filter out undefined to prevent Drizzle errors
    const conditions = [
      eq(cartItems.cartId, cartId),
      eq(cartItems.scheduledDate, item.scheduledDate),
      eq(cartItems.scheduledTime, item.scheduledTime)
    ];
    
    // Only add serviceId condition if it exists
    if (item.serviceId) {
      conditions.push(eq(cartItems.serviceId, item.serviceId));
    }
    
    const [existing] = await db.select().from(cartItems)
      .where(and(...conditions))
      .limit(1);

    if (existing) {
      // Return existing item instead of creating duplicate
      return existing;
    }

    const [cartItem] = await db.insert(cartItems).values({
      ...item,
      cartId
    }).returning();

    // Update cart timestamp
    await db.update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    return cartItem;
  }

  async updateCartItem(itemId: string, updates: Partial<CartItem>): Promise<CartItem> {
    // Only allow updating mutable fields (prevent id, cartId changes)
    const allowedUpdates: Partial<CartItem> = {};
    const mutableFields = ['comments', 'scheduledDate', 'scheduledTime', 'selectedAddOns', 
                          'basePrice', 'addOnsPrice', 'subtotal', 'serviceDetails'];
    
    for (const key of mutableFields) {
      if (key in updates) {
        (allowedUpdates as any)[key] = (updates as any)[key];
      }
    }

    const [item] = await db.update(cartItems)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId))
      .returning();
    return item;
  }

  async removeCartItem(itemId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async clearCart(cartId: string): Promise<void> {
    console.log(`🗑️ Clearing cart: ${cartId}`);
    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    console.log(`✅ Deleted cart items:`, result);
    
    // Verify deletion
    const remaining = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
    console.log(`📊 Remaining items after delete: ${remaining.length}`);
  }

  async getCartItemCount(cartId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));
    return result[0]?.count || 0;
  }
}
