/**
 * Domain Storage Modules
 * 
 * This directory contains domain-specific storage implementations
 * following the Single Responsibility Principle. Each module handles
 * database operations for a specific business domain.
 * 
 * Architecture Pattern: Composition
 * - Main DatabaseStorage class delegates to domain storage modules
 * - Each domain storage is independently testable
 * - Clear separation of concerns by business domain
 */

export { WalletStorage, type IWalletStorage } from './wallet-storage';
export { CartStorage, type ICartStorage } from './cart-storage';
export { ChatStorage, type IChatStorage } from './chat-storage';
export { NotificationStorage, type INotificationStorage } from './notification-storage';
