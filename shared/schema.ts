import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  isProvider: boolean("is_provider").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  servicesOffered: text("services_offered").array().notNull(),
  experience: text("experience"),
  availability: jsonb("availability"), // JSON object for schedule
  isVerified: boolean("is_verified").default(false),
  verificationStatus: text("verification_status").default("pending"), // pending, under_review, approved, rejected
  insuranceVerified: boolean("insurance_verified").default(false),
  backgroundCheckVerified: boolean("background_check_verified").default(false),
  hasInsurance: boolean("has_insurance").default(false),
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  idDocument: text("id_document"),
  qualificationCertificate: text("qualification_certificate"),
  bankingDetails: jsonb("banking_details"), // For payment distribution
  providerType: text("provider_type").default("individual"), // individual, company
  companyName: text("company_name"),
  companyRegistration: text("company_registration"),
  taxNumber: text("tax_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // house-cleaning, deep-cleaning, maintenance, gardening
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  duration: integer("duration").notNull(), // in hours
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  berryEventsCommission: decimal("berry_events_commission", { precision: 10, scale: 2 }).default("0"),
  providerPayout: decimal("provider_payout", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid_to_berry, paid_to_provider
  status: text("status").notNull().default("pending"), // pending, confirmed, in-progress, completed, cancelled
  serviceType: text("service_type").notNull(), // house-cleaning, chef-catering, waitering, etc.
  serviceDetails: jsonb("service_details"), // Store service-specific details
  propertySize: text("property_size"),
  bathrooms: integer("bathrooms"),
  address: text("address").notNull(),
  specialInstructions: text("special_instructions"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"), // weekly, bi-weekly, monthly
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars overall
  serviceQuality: integer("service_quality"), // 1-5 stars
  punctuality: integer("punctuality"), // 1-5 stars  
  professionalism: integer("professionalism"), // 1-5 stars
  comment: text("comment"),
  wouldRecommend: boolean("would_recommend").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Provider locations for real-time tracking
export const providerLocations = pgTable("provider_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job queue for automatic allocation
export const jobQueue = pgTable("job_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  serviceType: varchar("service_type").notNull(),
  customerLatitude: real("customer_latitude").notNull(),
  customerLongitude: real("customer_longitude").notNull(),
  maxRadius: real("max_radius").default(20), // km
  priority: integer("priority").default(1), // 1-5, higher is more urgent
  status: varchar("status").default("pending"), // pending, assigned, expired
  assignedProviderId: varchar("assigned_provider_id").references(() => serviceProviders.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Payment methods
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // card, bank_transfer, cash
  cardNumber: varchar("card_number"), // masked for display (e.g., ****1234)
  cardHolderName: varchar("card_holder_name"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  bankName: varchar("bank_name"),
  cardType: varchar("card_type"), // visa, mastercard, amex
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Training and Certification System Tables
export const trainingModules = pgTable("training_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // safety, technical, customer-service, specialized
  serviceType: text("service_type").notNull(), // chef-catering, house-cleaning, plumbing, etc.
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
  content: jsonb("content").notNull(), // structured content with sections, videos, documents
  prerequisites: text("prerequisites").array(),
  isRequired: boolean("is_required").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const providerTrainingProgress = pgTable("provider_training_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  moduleId: varchar("module_id").references(() => trainingModules.id).notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // percentage 0-100
  timeSpent: integer("time_spent").default(0), // in minutes
  attempts: integer("attempts").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certifications = pgTable("certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(),
  level: text("level").notNull(), // basic, intermediate, advanced, expert
  requiredModules: text("required_modules").array().notNull(),
  validityPeriod: integer("validity_period").notNull(), // in months
  badgeIcon: text("badge_icon"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const providerCertifications = pgTable("provider_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  certificationId: varchar("certification_id").references(() => certifications.id).notNull(),
  status: text("status").notNull().default("in_progress"), // in_progress, earned, expired, revoked
  earnedAt: timestamp("earned_at"),
  expiresAt: timestamp("expires_at"),
  certificateNumber: text("certificate_number"),
  verificationCode: text("verification_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillAssessments = pgTable("skill_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(),
  assessmentType: text("assessment_type").notNull(), // quiz, practical, portfolio
  questions: jsonb("questions").notNull(), // structured assessment questions
  passingScore: integer("passing_score").notNull(), // percentage
  timeLimit: integer("time_limit"), // in minutes
  maxAttempts: integer("max_attempts").default(3),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const providerAssessmentResults = pgTable("provider_assessment_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  assessmentId: varchar("assessment_id").references(() => skillAssessments.id).notNull(),
  score: integer("score").notNull(), // percentage
  passed: boolean("passed").notNull(),
  answers: jsonb("answers"), // provider's answers
  feedback: text("feedback"),
  attemptNumber: integer("attempt_number").notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  serviceProvider: one(serviceProviders, {
    fields: [users.id],
    references: [serviceProviders.userId],
  }),
  bookingsAsCustomer: many(bookings, { relationName: "customerBookings" }),
  reviews: many(reviews),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
  trainingProgress: many(providerTrainingProgress),
  certifications: many(providerCertifications),
  assessmentResults: many(providerAssessmentResults),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: "customerBookings",
  }),
  provider: one(serviceProviders, {
    fields: [bookings.providerId],
    references: [serviceProviders.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [reviews.providerId],
    references: [serviceProviders.id],
  }),
}));

export const providerLocationsRelations = relations(providerLocations, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerLocations.providerId],
    references: [serviceProviders.id],
  }),
}));

export const jobQueueRelations = relations(jobQueue, ({ one }) => ({
  booking: one(bookings, {
    fields: [jobQueue.bookingId],
    references: [bookings.id],
  }),
  assignedProvider: one(serviceProviders, {
    fields: [jobQueue.assignedProviderId],
    references: [serviceProviders.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

// Training system relations
export const trainingModulesRelations = relations(trainingModules, ({ many }) => ({
  progress: many(providerTrainingProgress),
}));

export const providerTrainingProgressRelations = relations(providerTrainingProgress, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerTrainingProgress.providerId],
    references: [serviceProviders.id],
  }),
  module: one(trainingModules, {
    fields: [providerTrainingProgress.moduleId],
    references: [trainingModules.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ many }) => ({
  providerCertifications: many(providerCertifications),
}));

export const providerCertificationsRelations = relations(providerCertifications, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerCertifications.providerId],
    references: [serviceProviders.id],
  }),
  certification: one(certifications, {
    fields: [providerCertifications.certificationId],
    references: [certifications.id],
  }),
}));

export const skillAssessmentsRelations = relations(skillAssessments, ({ many }) => ({
  results: many(providerAssessmentResults),
}));

export const providerAssessmentResultsRelations = relations(providerAssessmentResults, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerAssessmentResults.providerId],
    references: [serviceProviders.id],
  }),
  assessment: one(skillAssessments, {
    fields: [providerAssessmentResults.assessmentId],
    references: [skillAssessments.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  rating: true,
  totalReviews: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Training system insert schemas
export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderTrainingProgressSchema = createInsertSchema(providerTrainingProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
});

export const insertProviderCertificationSchema = createInsertSchema(providerCertifications).omit({
  id: true,
  createdAt: true,
});

export const insertSkillAssessmentSchema = createInsertSchema(skillAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertProviderAssessmentResultSchema = createInsertSchema(providerAssessmentResults).omit({
  id: true,
  createdAt: true,
});

// Training system types
export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;

export type ProviderTrainingProgress = typeof providerTrainingProgress.$inferSelect;
export type InsertProviderTrainingProgress = z.infer<typeof insertProviderTrainingProgressSchema>;

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;

export type ProviderCertification = typeof providerCertifications.$inferSelect;
export type InsertProviderCertification = z.infer<typeof insertProviderCertificationSchema>;

export type SkillAssessment = typeof skillAssessments.$inferSelect;
export type InsertSkillAssessment = z.infer<typeof insertSkillAssessmentSchema>;

export type ProviderAssessmentResult = typeof providerAssessmentResults.$inferSelect;
export type InsertProviderAssessmentResult = z.infer<typeof insertProviderAssessmentResultSchema>;

export const insertProviderLocationSchema = createInsertSchema(providerLocations).omit({
  id: true,
  lastSeen: true,
  updatedAt: true,
});

export const insertJobQueueSchema = createInsertSchema(jobQueue).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ProviderLocation = typeof providerLocations.$inferSelect;
export type InsertProviderLocation = z.infer<typeof insertProviderLocationSchema>;

export type JobQueue = typeof jobQueue.$inferSelect;
export type InsertJobQueue = z.infer<typeof insertJobQueueSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
