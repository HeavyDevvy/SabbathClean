import { z } from "zod";

// User Management
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
  role: 'customer' | 'provider' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  defaultLocation?: string;
  preferredProviders: string[];
  paymentMethodId?: string;
}

// Service Provider Management
export interface ServiceProvider {
  id: string;
  userId: string;
  businessName?: string;
  bio: string;
  services: string[];
  serviceAreas: string[];
  hourlyRates: { [serviceId: string]: number };
  availability: ProviderAvailability;
  isVerified: boolean;
  backgroundChecked: boolean;
  insuranceVerified: boolean;
  yearsExperience: number;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  responseTime: number; // minutes
  profileImages: string[];
  documents: ProviderDocument[];
  bankingInfo?: BankingInfo;
  createdAt: Date;
}

export interface ProviderAvailability {
  schedule: WeeklySchedule;
  timeoff: TimeOffPeriod[];
  sameDay: boolean;
  advance: number; // days
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  available: boolean;
  start: string; // "09:00"
  end: string;   // "17:00"
  breaks: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface TimeOffPeriod {
  id: string;
  start: Date;
  end: Date;
  reason: string;
}

export interface ProviderDocument {
  id: string;
  type: 'id' | 'insurance' | 'certification' | 'reference';
  filename: string;
  url: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface BankingInfo {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: 'checking' | 'savings';
}

// Service Management
export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  subcategory: string;
  duration: number; // minutes
  basePrice: number;
  priceUnit: 'hour' | 'job' | 'sqm';
  requirements: string[];
  addons: ServiceAddon[];
  isActive: boolean;
  icon: string;
}

export type ServiceCategory = 'indoor' | 'outdoor' | 'specialized' | 'maintenance' | 'fulltime';

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number;
}

// Booking System
export interface Booking {
  id: string;
  customerId: string;
  providerId?: string;
  serviceId: string;
  status: BookingStatus;
  type: 'one-time' | 'recurring';
  
  // Service Details
  title: string;
  description?: string;
  duration: number;
  
  // Location & Timing
  address: Address;
  scheduledDate: Date;
  scheduledTime: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  
  // Pricing
  basePrice: number;
  addons: BookingAddon[];
  totalAmount: number;
  tips?: number;
  
  // Recurring Settings
  recurringSettings?: RecurringSettings;
  parentBookingId?: string;
  
  // Service Delivery
  specialInstructions?: string;
  accessInstructions?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  completionNotes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  
  // Communication
  messages: BookingMessage[];
  lastMessageAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | 'pending' | 'provider-assigned' | 'confirmed' 
  | 'in-progress' | 'completed' | 'cancelled' 
  | 'requires-payment' | 'disputed';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  propertyType: 'apartment' | 'house' | 'office' | 'other';
  propertySize?: number; // sqm
  accessNotes?: string;
}

export interface BookingAddon {
  addonId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RecurringSettings {
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  endDate?: Date;
  maxOccurrences?: number;
  preferredProviderId?: string;
  pausedUntil?: Date;
}

export interface BookingMessage {
  id: string;
  senderId: string;
  senderRole: 'customer' | 'provider' | 'admin';
  message: string;
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

// Payment System
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  tip: number;
  totalAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  processedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet' | 'cash';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially-refunded';

// Review System
export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'customer' | 'provider';
  rating: number; // 1-5
  comment?: string;
  categories: ReviewCategory[];
  isPublic: boolean;
  response?: ReviewResponse;
  reportedBy?: string[];
  isHidden: boolean;
  createdAt: Date;
}

export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface ReviewResponse {
  message: string;
  respondedAt: Date;
}

// Notification System
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type NotificationType = 
  | 'booking-confirmed' | 'booking-cancelled' | 'booking-reminder'
  | 'provider-assigned' | 'service-started' | 'service-completed'
  | 'payment-received' | 'review-received' | 'message-received'
  | 'system-announcement';

// Admin & Analytics
export interface AdminUser extends User {
  permissions: AdminPermission[];
  lastLoginAt?: Date;
}

export type AdminPermission = 
  | 'user-management' | 'provider-verification' | 'booking-oversight'
  | 'payment-management' | 'content-management' | 'analytics-access'
  | 'dispute-resolution' | 'system-settings';

export interface PlatformStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  activeProviders: number;
  bookingsToday: number;
  revenueToday: number;
}

// Validation Schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  role: z.enum(['customer', 'provider']),
});

export const createBookingSchema = z.object({
  serviceId: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('South Africa'),
    propertyType: z.enum(['apartment', 'house', 'office', 'other']),
  }),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  description: z.string().optional(),
  specialInstructions: z.string().optional(),
  addons: z.array(z.object({
    addonId: z.string(),
    quantity: z.number().min(1),
  })).default([]),
  recurringSettings: z.object({
    frequency: z.enum(['weekly', 'bi-weekly', 'monthly']),
    endDate: z.string().optional(),
    maxOccurrences: z.number().optional(),
  }).optional(),
});

export const createProviderSchema = z.object({
  businessName: z.string().optional(),
  bio: z.string().min(50),
  services: z.array(z.string()).min(1),
  serviceAreas: z.array(z.string()).min(1),
  hourlyRates: z.record(z.string(), z.number()),
  yearsExperience: z.number().min(2),
  availability: z.object({
    schedule: z.record(z.string(), z.object({
      available: z.boolean(),
      start: z.string().optional(),
      end: z.string().optional(),
    })),
    sameDay: z.boolean(),
    advance: z.number(),
  }),
});

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  categories: z.array(z.object({
    category: z.string(),
    rating: z.number().min(1).max(5),
  })).default([]),
});

// Type exports for forms
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;