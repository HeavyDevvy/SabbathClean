import { z } from 'zod';

// Comprehensive Admin Stats Response Schema
export const adminStatsResponseSchema = z.object({
  // Basic metrics
  totalUsers: z.number(),
  totalProviders: z.number(),
  activeBookings: z.number(),
  totalRevenue: z.number(),
  pendingApplications: z.number(),
  
  // Enhanced KPIs
  monthlyRecurringRevenue: z.number(),
  customerAcquisitionCost: z.number(),
  customerLifetimeValue: z.number(),
  churnRate: z.number(),
  conversionRate: z.number(),
  averageOrderValue: z.number(),
  providerUtilization: z.number(),
  customerSatisfaction: z.number(),
  
  // Growth metrics
  revenueGrowth: z.number(),
  userGrowth: z.number(),
  bookingGrowth: z.number(),
  
  // Time-based metrics
  todayBookings: z.number(),
  thisWeekRevenue: z.number(),
  thisMonthRevenue: z.number(),
  
  // Performance metrics
  averageResponseTime: z.number(),
  disputeRate: z.number(),
  retentionRate: z.number()
});

export type AdminStatsResponse = z.infer<typeof adminStatsResponseSchema>;

// Provider Performance Schema
export const providerPerformanceSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
  totalBookings: z.number(),
  totalRevenue: z.number(),
  responseTimeAvg: z.number(),
  completionRate: z.number(),
  customerSatisfaction: z.number(),
  servicesOffered: z.array(z.string()),
  isVerified: z.boolean(),
  joinDate: z.date()
});

export type ProviderPerformance = z.infer<typeof providerPerformanceSchema>;

// Customer Analytics Schema  
export const customerAnalyticsSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  totalBookings: z.number(),
  totalSpent: z.number(),
  averageOrderValue: z.number(),
  lastBookingDate: z.date().nullable(),
  customerSince: z.date(),
  favoriteServices: z.array(z.string()),
  satisfactionScore: z.number(),
  riskScore: z.number() // For churn prediction
});

export type CustomerAnalytics = z.infer<typeof customerAnalyticsSchema>;

// Revenue Analytics Schema
export const revenueAnalyticsSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  date: z.string(),
  revenue: z.number(),
  bookings: z.number(),
  averageOrderValue: z.number(),
  topServices: z.array(z.object({
    service: z.string(),
    revenue: z.number(),
    percentage: z.number()
  }))
});

export type RevenueAnalytics = z.infer<typeof revenueAnalyticsSchema>;