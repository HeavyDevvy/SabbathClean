import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  profileImage: text("profile_image"),
  isProvider: boolean("is_provider").default(false),
  isVerified: boolean("is_verified").default(false),
  // Social authentication providers
  googleId: text("google_id"),
  appleId: text("apple_id"),
  twitterId: text("twitter_id"),
  instagramId: text("instagram_id"),
  authProvider: text("auth_provider").default("email"), // email, google, apple, twitter, instagram
  // Password storage for remember me functionality
  rememberToken: text("remember_token"),
  rememberTokenExpiresAt: timestamp("remember_token_expires_at"),
  // Email verification tokens
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpiresAt: timestamp("email_verification_expires_at"),
  // Password reset tokens
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  // User preferences and settings
  preferences: jsonb("preferences"), // UI preferences, notification settings
  notificationSettings: jsonb("notification_settings").default('{"email": true, "sms": true, "push": true, "marketing": false}'),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  category: text("category").notNull(), // indoor-services, outdoor-services, specialized-services, maintenance, full-time-placements
  subcategory: text("subcategory"), // house-cleaning, laundry-ironing, garden-maintenance, etc.
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  priceType: text("price_type").default("hourly"), // hourly, fixed, per_room, per_sqm
  estimatedDuration: integer("estimated_duration"), // in minutes
  icon: text("icon"),
  features: text("features").array(),
  requirements: text("requirements").array(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  bookingNumber: text("booking_number").notNull().unique(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  duration: integer("duration").notNull(), // in hours
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0"),
  paymentProcessingFee: decimal("payment_processing_fee", { precision: 10, scale: 2 }).default("0"),
  providerPayout: decimal("provider_payout", { precision: 10, scale: 2 }).default("0"),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: text("payment_status").default("pending"), // pending, authorized, captured, refunded
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  status: text("status").notNull().default("pending"), // pending, confirmed, provider_assigned, in_progress, completed, cancelled, refunded
  serviceType: text("service_type").notNull(),
  serviceDetails: jsonb("service_details"),
  customerDetails: jsonb("customer_details"), // contact info, preferences
  address: text("address").notNull(),
  city: text("city"),
  postalCode: text("postal_code"),
  propertyType: text("property_type"), // house, apartment, office, etc.
  propertySize: text("property_size"),
  rooms: integer("rooms"),
  bathrooms: integer("bathrooms"),
  accessInstructions: text("access_instructions"),
  specialInstructions: text("special_instructions"),
  emergencyContact: jsonb("emergency_contact"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"), // weekly, bi-weekly, monthly
  recurringEndDate: timestamp("recurring_end_date"),
  parentBookingId: varchar("parent_booking_id"), // for recurring bookings - self reference
  remindersSent: integer("reminders_sent").default(0),
  customerRating: integer("customer_rating"), // 1-5 stars given by customer
  customerRatingBreakdown: jsonb("customer_rating_breakdown"), // detailed ratings from customer
  providerRating: integer("provider_rating"), // 1-5 stars given by provider
  providerRatingBreakdown: jsonb("provider_rating_breakdown"), // detailed ratings from provider
  notes: text("notes"), // internal notes
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
  reviewType: text("review_type").notNull(), // customer_to_provider, provider_to_customer
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer reviews from providers - for rating customers
export const customerReviews = pgTable("customer_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars overall
  communication: integer("communication"), // 1-5 stars - how well customer communicated
  courtesy: integer("courtesy"), // 1-5 stars - customer politeness and respect  
  cleanliness: integer("cleanliness"), // 1-5 stars - how clean/organized customer's space was
  accessibility: integer("accessibility"), // 1-5 stars - how easy it was to access property
  instructions: integer("instructions"), // 1-5 stars - clarity of customer instructions
  comment: text("comment"),
  wouldWorkAgain: boolean("would_work_again").default(true),
  isPrivate: boolean("is_private").default(false), // private feedback not shown to customer
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

// Payment methods with enhanced security
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // card, bank_transfer, mobile_money, cash
  stripePaymentMethodId: text("stripe_payment_method_id"), // Stripe payment method ID
  cardLast4: varchar("card_last4"), // last 4 digits for display
  cardBrand: varchar("card_brand"), // visa, mastercard, amex
  cardHolderName: varchar("card_holder_name"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  bankName: varchar("bank_name"),
  accountHolderName: varchar("account_holder_name"),
  nickname: varchar("nickname"), // user-friendly name for the payment method
  billingAddress: jsonb("billing_address"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages and Communication System
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  subject: text("subject"),
  status: text("status").default("active"), // active, closed, archived
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, image, document, system
  attachments: jsonb("attachments"), // file URLs and metadata
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications System
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // booking_update, payment_received, message_received, review_received
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // additional notification data
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: text("action_url"), // URL to navigate when clicked
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  category: text("category").notNull(), // payment, service_quality, technical, account, other
  priority: text("priority").default("medium"), // low, medium, high, urgent
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").default("open"), // open, in_progress, resolved, closed
  assignedTo: varchar("assigned_to"), // admin/support staff ID
  resolutionNotes: text("resolution_notes"),
  attachments: jsonb("attachments"),
  customerSatisfactionRating: integer("customer_satisfaction_rating"), // 1-5
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider Availability and Schedule
export const providerAvailability = pgTable("provider_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
  maxBookingsPerSlot: integer("max_bookings_per_slot").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const providerTimeOff = pgTable("provider_time_off", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Provider Earnings and Payouts
export const providerEarnings = pgTable("provider_earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default("0"),
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformCommission: decimal("platform_commission", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  payoutStatus: text("payout_status").default("pending"), // pending, processing, paid, failed
  payoutDate: timestamp("payout_date"),
  payoutReference: text("payout_reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Promotional Codes and Discounts
export const promotionalCodes = pgTable("promotional_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed_amount
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }),
  maximumDiscount: decimal("maximum_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").default(true),
  applicableServices: text("applicable_services").array(),
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

export const customerReviewsRelations = relations(customerReviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [customerReviews.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [customerReviews.customerId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [customerReviews.providerId],
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

export const insertCustomerReviewSchema = createInsertSchema(customerReviews).omit({
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

export type CustomerReview = typeof customerReviews.$inferSelect;
export type InsertCustomerReview = z.infer<typeof insertCustomerReviewSchema>;

export type ProviderLocation = typeof providerLocations.$inferSelect;
export type InsertProviderLocation = z.infer<typeof insertProviderLocationSchema>;

export type JobQueue = typeof jobQueue.$inferSelect;
export type InsertJobQueue = z.infer<typeof insertJobQueueSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

// Wallet System Tables
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  currency: text("currency").default("USD").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // Auto-reload settings
  autoReloadEnabled: boolean("auto_reload_enabled").default(false),
  autoReloadThreshold: decimal("auto_reload_threshold", { precision: 10, scale: 2 }).default("10.00"),
  autoReloadAmount: decimal("auto_reload_amount", { precision: 10, scale: 2 }).default("50.00"),
  autoReloadPaymentMethodId: varchar("auto_reload_payment_method_id"),
  // Stripe customer info
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'deposit', 'withdraw', 'payment', 'refund', 'auto_reload'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").default("completed").notNull(), // 'pending', 'completed', 'failed', 'cancelled'
  // Payment processing info
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  // Related entities
  bookingId: varchar("booking_id").references(() => bookings.id),
  serviceId: varchar("service_id").references(() => services.id),
  metadata: jsonb("metadata"), // Additional transaction data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports for wallet tables
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

// Shopping Cart System Tables
export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // null for guest users
  sessionToken: text("session_token"), // For guest cart tracking
  status: text("status").default("active").notNull(), // active, checked_out, abandoned, expired
  expiresAt: timestamp("expires_at"), // Auto-expire stale carts after 7 days
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cartId: varchar("cart_id").references(() => carts.id, { onDelete: "cascade" }).notNull(),
  serviceId: varchar("service_id"), // Make nullable - we use serviceType/serviceName for flexibility
  providerId: varchar("provider_id").references(() => serviceProviders.id),
  serviceType: text("service_type").notNull(),
  serviceName: text("service_name").notNull(),
  // Booking details
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  duration: integer("duration"), // Estimated hours
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  addOnsPrice: decimal("add_ons_price", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  // Service configuration stored as JSON
  serviceDetails: jsonb("service_details"), // property type, size, urgency, etc.
  selectedAddOns: jsonb("selected_addons").default('[]'), // Array of add-on IDs
  comments: text("comments"),
  // Metadata
  addedAt: timestamp("added_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Nullable to support guest checkout
  cartId: varchar("cart_id").references(() => carts.id),
  orderNumber: text("order_number").notNull().unique(), // BE-2025-001234
  // Payment details
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default("0"),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0"),
  // Payment processing
  paymentStatus: text("payment_status").default("pending").notNull(), // pending, processing, paid, failed, refunded
  paymentMethod: text("payment_method"), // card, bank, wallet
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  stripeChargeId: text("stripe_charge_id"),
  // Payment metadata (masked data only - NEVER store full card/account numbers)
  cardLast4: text("card_last4"), // Last 4 digits of card
  cardBrand: text("card_brand"), // visa, mastercard, amex, discover
  cardholderName: text("cardholder_name"),
  accountLast4: text("account_last4"), // Last 4 digits of bank account
  bankName: text("bank_name"),
  accountHolder: text("account_holder"),
  // Order status
  status: text("status").default("pending").notNull(), // pending, confirmed, processing, completed, cancelled
  confirmationSentAt: timestamp("confirmation_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id), // Links to actual booking after creation
  serviceId: varchar("service_id").references(() => services.id), // Nullable to match cart items flexibility
  providerId: varchar("provider_id").references(() => serviceProviders.id),
  // Service details snapshot (preserved even if service changes)
  serviceName: text("service_name").notNull(),
  serviceType: text("service_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  duration: integer("duration"),
  // Pricing snapshot
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  addOnsPrice: decimal("add_ons_price", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  // Configuration
  serviceDetails: jsonb("service_details"),
  selectedAddOns: jsonb("selected_addons").default('[]'),
  comments: text("comments"),
  // Status tracking
  status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports for cart system
export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
}).extend({
  scheduledDate: z.coerce.date(), // Accept ISO date strings and coerce to Date
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true, // Added by storage layer during order creation
  createdAt: true,
  updatedAt: true,
});

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
