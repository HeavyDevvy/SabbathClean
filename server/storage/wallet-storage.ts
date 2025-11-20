import { 
  type Wallet,
  type InsertWallet,
  type WalletTransaction,
  type InsertWalletTransaction,
  wallets,
  walletTransactions
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IWalletStorage {
  getOrCreateWallet(userId: string): Promise<Wallet>;
  getWalletBalance(userId: string): Promise<number>;
  addWalletFunds(userId: string, amount: number, stripePaymentIntentId?: string, description?: string): Promise<WalletTransaction>;
  withdrawWalletFunds(userId: string, amount: number, description?: string): Promise<WalletTransaction>;
  processWalletPayment(userId: string, amount: number, bookingId?: string, serviceId?: string, description?: string): Promise<WalletTransaction>;
  getWalletTransactions(userId: string, limit?: number, offset?: number): Promise<WalletTransaction[]>;
  updateAutoReloadSettings(userId: string, settings: { enabled: boolean; threshold: number; amount: number; paymentMethodId?: string }): Promise<void>;
}

export class WalletStorage implements IWalletStorage {
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    // First try to get existing wallet
    const [existingWallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    
    if (existingWallet) {
      return existingWallet;
    }

    // Create new wallet if none exists
    const [newWallet] = await db.insert(wallets)
      .values({
        userId,
        balance: "0.00",
        currency: "USD",
        isActive: true
      })
      .returning();
    
    return newWallet;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return parseFloat(wallet.balance);
  }

  async addWalletFunds(userId: string, amount: number, stripePaymentIntentId?: string, description?: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const currentBalance = parseFloat(wallet.balance);
    const newBalance = currentBalance + amount;

    // Update wallet balance
    await db.update(wallets)
      .set({ 
        balance: newBalance.toFixed(2),
        updatedAt: new Date()
      })
      .where(eq(wallets.id, wallet.id));

    // Record transaction
    const [transaction] = await db.insert(walletTransactions)
      .values({
        walletId: wallet.id,
        userId,
        type: 'deposit',
        amount: amount.toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: description || `Added funds to wallet`,
        status: 'completed',
        stripePaymentIntentId
      })
      .returning();

    return transaction;
  }

  async withdrawWalletFunds(userId: string, amount: number, description?: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const currentBalance = parseFloat(wallet.balance);
    
    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = currentBalance - amount;

    // Update wallet balance
    await db.update(wallets)
      .set({ 
        balance: newBalance.toFixed(2),
        updatedAt: new Date()
      })
      .where(eq(wallets.id, wallet.id));

    // Record transaction
    const [transaction] = await db.insert(walletTransactions)
      .values({
        walletId: wallet.id,
        userId,
        type: 'withdraw',
        amount: amount.toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: description || `Withdrawn funds from wallet`,
        status: 'completed'
      })
      .returning();

    return transaction;
  }

  async processWalletPayment(userId: string, amount: number, bookingId?: string, serviceId?: string, description?: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const currentBalance = parseFloat(wallet.balance);
    
    // Pre-check for better error messages (non-authoritative, UX only)
    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // ATOMIC UPDATE: Decrement balance and check in SINGLE SQL statement
    // This prevents race conditions by using database-level atomic operations
    const [updatedWallet] = await db.update(wallets)
      .set({ 
        // CRITICAL: Use SQL decrement, not precomputed value
        balance: sql`CAST(balance AS DECIMAL) - ${amount}`,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(wallets.id, wallet.id),
          // Atomic check: only update if balance is STILL >= amount at execution time
          sql`CAST(balance AS DECIMAL) >= ${amount}`
        )
      )
      .returning();
    
    // If no rows updated, balance was insufficient at the moment of execution
    // This catches race conditions where concurrent transactions depleted funds
    if (!updatedWallet) {
      throw new Error('Insufficient wallet balance (concurrent transaction detected)');
    }
    
    // Use the ACTUAL balance from the database for transaction record
    const newBalance = parseFloat(updatedWallet.balance);

    // Record transaction
    const [transaction] = await db.insert(walletTransactions)
      .values({
        walletId: wallet.id,
        userId,
        type: 'payment',
        amount: amount.toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: description || `Payment for service`,
        status: 'completed',
        bookingId,
        serviceId
      })
      .returning();

    return transaction;
  }

  async getWalletTransactions(userId: string, limit: number = 50, offset: number = 0): Promise<WalletTransaction[]> {
    return await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateAutoReloadSettings(userId: string, settings: { enabled: boolean; threshold: number; amount: number; paymentMethodId?: string }): Promise<void> {
    await db.update(wallets)
      .set({
        autoReloadEnabled: settings.enabled,
        autoReloadThreshold: settings.threshold.toFixed(2),
        autoReloadAmount: settings.amount.toFixed(2),
        autoReloadPaymentMethodId: settings.paymentMethodId,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId));
  }
}
