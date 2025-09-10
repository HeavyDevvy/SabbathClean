import { 
  type User, 
  type InsertUser,
  type ServiceProvider,
  type InsertServiceProvider,
  type Service,
  type InsertService,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type PaymentMethod,
  type InsertPaymentMethod,
  type ProviderLocation,
  type InsertProviderLocation,
  type JobQueue,
  type InsertJobQueue,
  type TrainingModule,
  type InsertTrainingModule,
  type ProviderTrainingProgress,
  type InsertProviderTrainingProgress,
  type Certification,
  type InsertCertification,
  type ProviderCertification,
  type InsertProviderCertification,
  type SkillAssessment,
  type InsertSkillAssessment,
  type ProviderAssessmentResult,
  type InsertProviderAssessmentResult,
  users,
  serviceProviders,
  services,
  bookings,
  reviews,
  paymentMethods,
  providerLocations,
  jobQueue,
  trainingModules,
  providerTrainingProgress,
  certifications,
  providerCertifications,
  skillAssessments,
  providerAssessmentResults
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  updateRememberToken(id: string, token: string, expiresAt: Date): Promise<void>;
  clearRememberToken(id: string): Promise<void>;
  // Email verification methods
  getUserByEmailVerificationToken(token: string): Promise<User | undefined>;
  verifyUserEmail(userId: string): Promise<void>;
  // Password reset methods
  setPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  resetUserPassword(userId: string, hashedPassword: string): Promise<void>;
  // Admin methods
  getAdminStats(): Promise<any>;
  getAllUsers(): Promise<User[]>;
  getAllProviders(): Promise<ServiceProvider[]>;
  updateProviderVerificationStatus(providerId: string, status: string): Promise<void>;
  
  // Service Provider operations
  getServiceProvider(id: string): Promise<ServiceProvider | undefined>;
  getServiceProvidersByService(serviceCategory: string): Promise<ServiceProvider[]>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProviderRating(id: string, rating: number, totalReviews: number): Promise<ServiceProvider>;
  
  // Service operations
  getAllServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Booking operations
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByCustomer(customerId: string): Promise<Booking[]>;
  getBookingsByProvider(providerId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
  
  // Review operations
  getReviewsByProvider(providerId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Payment method operations
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod>;
  removePaymentMethod(id: string): Promise<void>;
  unsetDefaultPaymentMethods(userId: string): Promise<void>;
  
  // Location operations (for future DB implementation)
  getProviderLocation(providerId: string): Promise<ProviderLocation | undefined>;
  updateProviderLocation(location: InsertProviderLocation): Promise<ProviderLocation>;
  
  // Job queue operations (for future DB implementation)
  getJobQueueItem(id: string): Promise<JobQueue | undefined>;
  createJobQueueItem(job: InsertJobQueue): Promise<JobQueue>;
  
  // Training system operations
  getAllTrainingModules(): Promise<TrainingModule[]>;
  getTrainingModulesByService(serviceType: string): Promise<TrainingModule[]>;
  getProviderTrainingProgress(providerId: string): Promise<ProviderTrainingProgress[]>;
  updateTrainingProgress(progressId: string, progress: Partial<ProviderTrainingProgress>): Promise<ProviderTrainingProgress>;
  createTrainingProgress(progress: InsertProviderTrainingProgress): Promise<ProviderTrainingProgress>;
  
  // Certification operations
  getAllCertifications(): Promise<Certification[]>;
  getCertificationsByService(serviceType: string): Promise<Certification[]>;
  getProviderCertifications(providerId: string): Promise<ProviderCertification[]>;
  createProviderCertification(certification: InsertProviderCertification): Promise<ProviderCertification>;
  
  // Assessment operations
  getSkillAssessments(serviceType: string): Promise<SkillAssessment[]>;
  getProviderAssessmentResults(providerId: string): Promise<ProviderAssessmentResult[]>;
  createAssessmentResult(result: InsertProviderAssessmentResult): Promise<ProviderAssessmentResult>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateRememberToken(id: string, token: string, expiresAt: Date): Promise<void> {
    await db.update(users)
      .set({ 
        rememberToken: token, 
        rememberTokenExpiresAt: expiresAt 
      })
      .where(eq(users.id, id));
  }

  async clearRememberToken(id: string): Promise<void> {
    await db.update(users)
      .set({ 
        rememberToken: null, 
        rememberTokenExpiresAt: null 
      })
      .where(eq(users.id, id));
  }

  // Email verification methods
  async getUserByEmailVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user || undefined;
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await db.update(users)
      .set({ 
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Password reset methods
  async setPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user || undefined;
  }

  async resetUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ 
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Admin methods implementation
  async getAdminStats(): Promise<any> {
    try {
      const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalProvidersResult = await db.select({ count: sql<number>`count(*)` }).from(serviceProviders);
      const activeBookingsResult = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, 'confirmed'));
      const pendingApplicationsResult = await db.select({ count: sql<number>`count(*)` }).from(serviceProviders).where(eq(serviceProviders.verificationStatus, 'pending'));
      
      // Calculate total revenue (sum of completed bookings)
      const revenueResult = await db.select({ 
        total: sql<number>`COALESCE(SUM(CAST(total_price AS DECIMAL)), 0)` 
      }).from(bookings).where(eq(bookings.status, 'completed'));

      return {
        totalUsers: totalUsersResult[0]?.count || 0,
        totalProviders: totalProvidersResult[0]?.count || 0,
        activeBookings: activeBookingsResult[0]?.count || 0,
        pendingApplications: pendingApplicationsResult[0]?.count || 0,
        totalRevenue: parseFloat(revenueResult[0]?.total?.toString() || '0')
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalUsers: 0,
        totalProviders: 0,
        activeBookings: 0,
        pendingApplications: 0,
        totalRevenue: 0
      };
    }
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users).orderBy(desc(users.createdAt));
    return result;
  }

  async getAllProviders(): Promise<ServiceProvider[]> {
    const result = await db.select().from(serviceProviders).orderBy(desc(serviceProviders.createdAt));
    return result;
  }

  async updateProviderVerificationStatus(providerId: string, status: string): Promise<void> {
    await db.update(serviceProviders)
      .set({ 
        verificationStatus: status,
        isVerified: status === 'approved',
        updatedAt: new Date()
      })
      .where(eq(serviceProviders.id, providerId));
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider || undefined;
  }

  async getServiceProvidersByService(serviceCategory: string): Promise<ServiceProvider[]> {
    const providers = await db.select().from(serviceProviders)
      .where(eq(serviceProviders.servicesOffered, [serviceCategory]));
    return providers;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [newProvider] = await db.insert(serviceProviders).values(provider).returning();
    return newProvider;
  }

  async updateServiceProviderRating(id: string, rating: number, totalReviews: number): Promise<ServiceProvider> {
    const [provider] = await db.update(serviceProviders)
      .set({ rating: rating.toString(), totalReviews })
      .where(eq(serviceProviders.id, id))
      .returning();
    return provider;
  }

  async getAllServices(): Promise<Service[]> {
    const result = await db.select().from(services).where(eq(services.isActive, true));
    
    // If no services exist, seed with default services
    if (result.length === 0) {
      await this.seedDefaultServices();
      return await db.select().from(services).where(eq(services.isActive, true));
    }
    
    return result;
  }

  private async seedDefaultServices() {
    const defaultServices = [
      {
        id: "chef-catering",
        name: "Chef & Catering",
        description: "Professional chef services for any occasion with authentic cuisine experiences",
        category: "chef-catering",
        basePrice: "550.00",
        isActive: true,
      },
      {
        id: "house-cleaning",
        name: "House Cleaning",
        description: "Professional eco-friendly cleaning solutions for your home",
        category: "house-cleaning",
        basePrice: "280.00",
        isActive: true,
      },
      {
        id: "plumbing",
        name: "Plumbing Services",
        description: "Certified plumbers available for repairs and installations",
        category: "plumbing",
        basePrice: "400.00",
        isActive: true,
      },
      {
        id: "electrical",
        name: "Electrical Services",
        description: "Safety-certified electrical repairs and installations",
        category: "electrical",
        basePrice: "450.00",
        isActive: true,
      },
      {
        id: "gardening",
        name: "Garden Care",
        description: "Sustainable garden maintenance and landscaping services",
        category: "gardening",
        basePrice: "320.00",
        isActive: true,
      },
      {
        id: "home-moving",
        name: "Home Moving",
        description: "Professional moving services with packing and transportation",
        category: "home-moving",
        basePrice: "800.00",
        isActive: true,
      },
    ];

    await db.insert(services).values(defaultServices).onConflictDoNothing();
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return await db.select().from(services)
      .where(and(eq(services.category, category), eq(services.isActive, true)));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.scheduledDate));
  }

  async getBookingsByProvider(providerId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.providerId, providerId))
      .orderBy(desc(bookings.scheduledDate));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const [booking] = await db.update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getReviewsByProvider(providerId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.providerId, providerId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const result = await db.select().from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))
      .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
    return result;
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const [result] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return result || undefined;
  }

  async addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [result] = await db.insert(paymentMethods).values(paymentMethod).returning();
    return result;
  }

  async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const [result] = await db.update(paymentMethods)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();
    return result;
  }

  async removePaymentMethod(id: string): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  async unsetDefaultPaymentMethods(userId: string): Promise<void> {
    await db.update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));
  }

  async getProviderLocation(providerId: string): Promise<ProviderLocation | undefined> {
    const [location] = await db.select().from(providerLocations).where(eq(providerLocations.providerId, providerId));
    return location || undefined;
  }

  async updateProviderLocation(location: InsertProviderLocation): Promise<ProviderLocation> {
    const [newLocation] = await db.insert(providerLocations)
      .values(location)
      .onConflictDoUpdate({
        target: providerLocations.providerId,
        set: { latitude: location.latitude, longitude: location.longitude, updatedAt: new Date() }
      })
      .returning();
    return newLocation;
  }

  async getJobQueueItem(id: string): Promise<JobQueue | undefined> {
    const [job] = await db.select().from(jobQueue).where(eq(jobQueue.id, id));
    return job || undefined;
  }

  async createJobQueueItem(job: InsertJobQueue): Promise<JobQueue> {
    const [newJob] = await db.insert(jobQueue).values(job).returning();
    return newJob;
  }

  // Training system methods
  async getAllTrainingModules(): Promise<TrainingModule[]> {
    return await db.select().from(trainingModules)
      .where(eq(trainingModules.isActive, true))
      .orderBy(trainingModules.category, trainingModules.difficulty);
  }

  async getTrainingModulesByService(serviceType: string): Promise<TrainingModule[]> {
    return await db.select().from(trainingModules)
      .where(and(
        eq(trainingModules.serviceType, serviceType),
        eq(trainingModules.isActive, true)
      ))
      .orderBy(trainingModules.difficulty);
  }

  async getProviderTrainingProgress(providerId: string): Promise<ProviderTrainingProgress[]> {
    return await db.select().from(providerTrainingProgress)
      .where(eq(providerTrainingProgress.providerId, providerId))
      .orderBy(desc(providerTrainingProgress.lastAccessedAt));
  }

  async updateTrainingProgress(progressId: string, progress: Partial<ProviderTrainingProgress>): Promise<ProviderTrainingProgress> {
    const [updatedProgress] = await db.update(providerTrainingProgress)
      .set({ ...progress, updatedAt: new Date() })
      .where(eq(providerTrainingProgress.id, progressId))
      .returning();
    return updatedProgress;
  }

  async createTrainingProgress(progress: InsertProviderTrainingProgress): Promise<ProviderTrainingProgress> {
    const [newProgress] = await db.insert(providerTrainingProgress).values(progress).returning();
    return newProgress;
  }

  async getAllCertifications(): Promise<Certification[]> {
    return await db.select().from(certifications)
      .where(eq(certifications.isActive, true))
      .orderBy(certifications.serviceType, certifications.level);
  }

  async getCertificationsByService(serviceType: string): Promise<Certification[]> {
    return await db.select().from(certifications)
      .where(and(
        eq(certifications.serviceType, serviceType),
        eq(certifications.isActive, true)
      ))
      .orderBy(certifications.level);
  }

  async getProviderCertifications(providerId: string): Promise<ProviderCertification[]> {
    return await db.select().from(providerCertifications)
      .where(eq(providerCertifications.providerId, providerId))
      .orderBy(desc(providerCertifications.earnedAt));
  }

  async createProviderCertification(certification: InsertProviderCertification): Promise<ProviderCertification> {
    const [newCertification] = await db.insert(providerCertifications).values(certification).returning();
    return newCertification;
  }

  async getSkillAssessments(serviceType: string): Promise<SkillAssessment[]> {
    return await db.select().from(skillAssessments)
      .where(and(
        eq(skillAssessments.serviceType, serviceType),
        eq(skillAssessments.isActive, true)
      ))
      .orderBy(skillAssessments.title);
  }

  async getProviderAssessmentResults(providerId: string): Promise<ProviderAssessmentResult[]> {
    return await db.select().from(providerAssessmentResults)
      .where(eq(providerAssessmentResults.providerId, providerId))
      .orderBy(desc(providerAssessmentResults.completedAt));
  }

  async createAssessmentResult(result: InsertProviderAssessmentResult): Promise<ProviderAssessmentResult> {
    const [newResult] = await db.insert(providerAssessmentResults).values(result).returning();
    return newResult;
  }

  // Additional methods for comprehensive training system
  async getTrainingModule(id: string): Promise<TrainingModule | undefined> {
    const [module] = await db.select().from(trainingModules).where(eq(trainingModules.id, id));
    return module || undefined;
  }

  async createTrainingModule(module: InsertTrainingModule): Promise<TrainingModule> {
    const [newModule] = await db.insert(trainingModules).values(module).returning();
    return newModule;
  }

  async getProviderModuleProgress(providerId: string, moduleId: string): Promise<ProviderTrainingProgress | undefined> {
    const [progress] = await db.select().from(providerTrainingProgress)
      .where(and(
        eq(providerTrainingProgress.providerId, providerId),
        eq(providerTrainingProgress.moduleId, moduleId)
      ));
    return progress || undefined;
  }

  async getCertification(id: string): Promise<Certification | undefined> {
    const [certification] = await db.select().from(certifications).where(eq(certifications.id, id));
    return certification || undefined;
  }

  async createCertification(certification: InsertCertification): Promise<Certification> {
    const [newCertification] = await db.insert(certifications).values(certification).returning();
    return newCertification;
  }

  async updateProviderCertificationStatus(id: string, status: string, earnedAt?: Date, expiresAt?: Date): Promise<ProviderCertification> {
    const [certification] = await db.update(providerCertifications)
      .set({ status, earnedAt, expiresAt })
      .where(eq(providerCertifications.id, id))
      .returning();
    return certification;
  }

  async getSkillAssessment(id: string): Promise<SkillAssessment | undefined> {
    const [assessment] = await db.select().from(skillAssessments).where(eq(skillAssessments.id, id));
    return assessment || undefined;
  }

  async createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment> {
    const [newAssessment] = await db.insert(skillAssessments).values(assessment).returning();
    return newAssessment;
  }

  async getProviderAssessmentResult(providerId: string, assessmentId: string): Promise<ProviderAssessmentResult | undefined> {
    const [result] = await db.select().from(providerAssessmentResults)
      .where(and(
        eq(providerAssessmentResults.providerId, providerId),
        eq(providerAssessmentResults.assessmentId, assessmentId)
      ))
      .orderBy(desc(providerAssessmentResults.completedAt))
      .limit(1);
    return result || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private serviceProviders: Map<string, ServiceProvider> = new Map();
  private services: Map<string, Service> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private reviews: Map<string, Review> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private providerLocations: Map<string, ProviderLocation> = new Map();
  private jobQueue: Map<string, JobQueue> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed services
    const services = [
      {
        id: "service-1",
        name: "House Cleaning",
        description: "Complete home cleaning including dusting, vacuuming, mopping, kitchen & bathroom sanitization, organizing",
        category: "house-cleaning",
        basePrice: "280.00",
        isActive: true,
      },
      {
        id: "service-2", 
        name: "Deep Cleaning",
        description: "Thorough cleaning for move-ins, move-outs including carpet cleaning, window washing, appliance cleaning",
        category: "deep-cleaning",
        basePrice: "450.00",
        isActive: true,
      },
      {
        id: "service-3",
        name: "Plumbing Services",
        description: "Pipe repairs, leak fixing, faucet installation, drain cleaning, toilet repairs, water heater maintenance",
        category: "plumbing",
        basePrice: "380.00",
        isActive: true,
      },
      {
        id: "service-4",
        name: "Electrical Services",
        description: "Wiring repairs, outlet installation, lighting setup, circuit breaker fixes, electrical safety inspections",
        category: "electrical",
        basePrice: "420.00",
        isActive: true,
      },
      {
        id: "service-5",
        name: "Chef & Catering",
        description: "Personal chef services, meal preparation, event catering, menu planning, dietary accommodations",
        category: "chef-catering",
        basePrice: "550.00",
        isActive: true,
      },
      {
        id: "service-6",
        name: "Waitering Services",
        description: "Professional waitstaff for events, table service, bar service, event coordination, cleanup assistance",
        category: "waitering",
        basePrice: "220.00",
        isActive: true,
      },
      {
        id: "service-7",
        name: "Garden Care",
        description: "Lawn maintenance, pruning, weeding, planting, irrigation setup, landscape design consultation",
        category: "gardening",
        basePrice: "320.00",
        isActive: true,
      },
      {
        id: "service-8",
        name: "Home Moving",
        description: "Packing services, furniture disassembly/assembly, loading/unloading, transportation, unpacking, storage solutions",
        category: "home-moving",
        basePrice: "450.00",
        isActive: true,
      },
    ];

    services.forEach(service => this.services.set(service.id, service as Service));

    // Seed users and service providers
    const providers = [
      {
        user: {
          id: "user-1",
          email: "maria@example.com",
          username: "maria_santos",
          password: "hashed_password",
          firstName: "Maria",
          lastName: "Santos",
          phone: "+27123456789",
          address: "Cape Town, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-1",
          userId: "user-1",
          firstName: "Maria",
          lastName: "Santos",
          email: "maria@example.com",
          phone: "+27123456789",
          bio: "500+ happy customers. Specializing in eco-friendly cleaning solutions.",
          profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          hourlyRate: "280.00",
          servicesOffered: ["house-cleaning", "deep-cleaning"],
          experience: "experienced",
          availability: { monday: ["9:00", "17:00"], tuesday: ["9:00", "17:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "4.9",
          totalReviews: 127,
          location: "Cape Town",
          idDocument: "/uploads/id/maria-id.jpg",
          qualificationCertificate: "/uploads/certs/maria-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-2",
          email: "james@example.com",
          username: "james_mitchell",
          password: "hashed_password",
          firstName: "James",
          lastName: "Mitchell",
          phone: "+27123456790",
          address: "Johannesburg, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-2",
          userId: "user-2",
          firstName: "James",
          lastName: "Mitchell",
          email: "james@example.com",
          phone: "+27123456790",
          bio: "Certified electrician and plumber with 8 years experience.",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
          hourlyRate: "400.00",
          servicesOffered: ["plumbing", "electrical"],
          experience: "expert",
          availability: { monday: ["8:00", "18:00"], tuesday: ["8:00", "18:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "4.8",
          totalReviews: 89,
          location: "Johannesburg",
          idDocument: "/uploads/id/james-id.jpg",
          qualificationCertificate: "/uploads/certs/james-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-3",
          email: "sarah@example.com",
          username: "sarah_johnson",
          password: "hashed_password",
          firstName: "Sarah",
          lastName: "Johnson",
          phone: "+27123456791",
          address: "Durban, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-3",
          userId: "user-3",
          firstName: "Sarah",
          lastName: "Johnson", 
          email: "sarah@example.com",
          phone: "+27123456791",
          bio: "Professional Italian chef and catering specialist with fine dining experience. Specializes in authentic Italian cuisine and Mediterranean flavors.",
          profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
          hourlyRate: "385.00",
          servicesOffered: ["chef-catering", "waitering"],
          experience: "experienced",
          availability: { monday: ["9:00", "16:00"], tuesday: ["9:00", "16:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "5.0",
          totalReviews: 45,
          location: "Durban",
          idDocument: "/uploads/id/sarah-id.jpg",
          qualificationCertificate: "/uploads/certs/sarah-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-4",
          email: "david@example.com",
          username: "david_chen",
          password: "hashed_password",
          firstName: "David",
          lastName: "Chen",
          phone: "+27123456792",
          address: "Cape Town, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-4",
          userId: "user-4",
          firstName: "David",
          lastName: "Chen",
          email: "david@example.com",
          phone: "+27123456792",
          bio: "Landscape designer with sustainable gardening practices.",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
          hourlyRate: "540.00",
          servicesOffered: ["gardening"],
          experience: "expert",
          availability: { monday: ["8:00", "17:00"], tuesday: ["8:00", "17:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "4.9",
          totalReviews: 67,
          location: "Cape Town",
          idDocument: "/uploads/id/david-id.jpg",
          qualificationCertificate: "/uploads/certs/david-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-5",
          email: "mike@example.com",
          username: "mike_movers",
          password: "hashed_password",
          firstName: "Mike",
          lastName: "Thompson",
          phone: "+27123456793",
          address: "Pretoria, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-5",
          userId: "user-5",
          firstName: "Mike",
          lastName: "Thompson",
          email: "mike@example.com",
          phone: "+27123456793",
          bio: "Professional moving services with 10+ years experience. Specialized in residential and office relocations.",
          profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300",
          hourlyRate: "450.00",
          servicesOffered: ["home-moving"],
          experience: "expert",
          availability: { monday: ["7:00", "19:00"], tuesday: ["7:00", "19:00"], wednesday: ["7:00", "19:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "4.7",
          totalReviews: 152,
          location: "Pretoria",
          idDocument: "/uploads/id/mike-id.jpg",
          qualificationCertificate: "/uploads/certs/mike-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-6",
          email: "chef.raj@example.com",
          username: "chef_raj",
          password: "hashed_password",
          firstName: "Raj",
          lastName: "Patel",
          phone: "+27123456794",
          address: "Cape Town, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-6",
          userId: "user-6",
          firstName: "Raj",
          lastName: "Patel",
          email: "chef.raj@example.com",
          phone: "+27123456794",
          bio: "Authentic Indian cuisine specialist with traditional spices and cooking techniques. Expert in curries, biryanis, and vegetarian Indian dishes.",
          profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300",
          hourlyRate: "420.00",
          servicesOffered: ["chef-catering"],
          experience: "expert",
          availability: { monday: ["10:00", "18:00"], tuesday: ["10:00", "18:00"], wednesday: ["10:00", "18:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "4.8",
          totalReviews: 73,
          location: "Cape Town",
          idDocument: "/uploads/id/raj-id.jpg",
          qualificationCertificate: "/uploads/certs/raj-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-7",
          email: "chef.lila@example.com",
          username: "chef_lila",
          password: "hashed_password",
          firstName: "Lila",
          lastName: "Mbeki",
          phone: "+27123456795",
          address: "Johannesburg, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-7",
          userId: "user-7",
          firstName: "Lila",
          lastName: "Mbeki",
          email: "chef.lila@example.com",
          phone: "+27123456795",
          bio: "Traditional African cuisine chef specializing in South African heritage dishes, modern African fusion, and indigenous ingredients.",
          profileImage: "https://images.unsplash.com/photo-1594736797933-d0401ba4fcc9?w=300",
          hourlyRate: "380.00",
          servicesOffered: ["chef-catering"],
          experience: "experienced",
          availability: { monday: ["9:00", "17:00"], tuesday: ["9:00", "17:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "4.9",
          totalReviews: 56,
          location: "Johannesburg",
          idDocument: "/uploads/id/lila-id.jpg",
          qualificationCertificate: "/uploads/certs/lila-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-8",
          email: "chef.akiko@example.com",
          username: "chef_akiko",
          password: "hashed_password",
          firstName: "Akiko",
          lastName: "Tanaka",
          phone: "+27123456796",
          address: "Durban, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-8",
          userId: "user-8",
          firstName: "Akiko",
          lastName: "Tanaka",
          email: "chef.akiko@example.com",
          phone: "+27123456796",
          bio: "Asian fusion chef specializing in Japanese, Thai, and contemporary Asian cuisine. Expert in sushi, ramen, and Thai curries.",
          profileImage: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=300",
          hourlyRate: "450.00",
          servicesOffered: ["chef-catering"],
          experience: "expert",
          availability: { monday: ["11:00", "19:00"], tuesday: ["11:00", "19:00"], wednesday: ["11:00", "19:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "5.0",
          totalReviews: 42,
          location: "Durban",
          idDocument: "/uploads/id/akiko-id.jpg",
          qualificationCertificate: "/uploads/certs/akiko-cert.pdf",
          createdAt: new Date(),
        }
      },
      {
        user: {
          id: "user-9",
          email: "chef.maria@example.com",
          username: "chef_maria_med",
          password: "hashed_password",
          firstName: "Maria",
          lastName: "Konstantinou",
          phone: "+27123456797",
          address: "Cape Town, South Africa",
          isProvider: true,
          createdAt: new Date(),
        },
        provider: {
          id: "provider-9",
          userId: "user-9",
          firstName: "Maria",
          lastName: "Konstantinou",
          email: "chef.maria@example.com",
          phone: "+27123456797",
          bio: "Mediterranean cuisine specialist with expertise in Greek, Turkish, and Middle Eastern flavors. Fresh ingredients and healthy cooking methods.",
          profileImage: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300",
          hourlyRate: "400.00",
          servicesOffered: ["chef-catering"],
          experience: "experienced",
          availability: { monday: ["10:00", "18:00"], tuesday: ["10:00", "18:00"] },
          isVerified: true,
          insuranceVerified: true,
          backgroundCheckVerified: true,
          hasInsurance: true,
          backgroundCheckConsent: true,
          rating: "4.7",
          totalReviews: 61,
          location: "Cape Town",
          idDocument: "/uploads/id/maria-k-id.jpg",
          qualificationCertificate: "/uploads/certs/maria-k-cert.pdf",
          createdAt: new Date(),
        }
      }
    ];

    providers.forEach(({ user, provider }) => {
      this.users.set(user.id, user as User);
      this.serviceProviders.set(provider.id, provider as ServiceProvider);
    });

    // Seed provider locations
    const providerLocations = [
      {
        id: randomUUID(),
        providerId: "provider-1",
        latitude: -33.9249,
        longitude: 18.4241,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-2", 
        latitude: -26.2041,
        longitude: 28.0473,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-3",
        latitude: -29.8587,
        longitude: 31.0218,
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-4",
        latitude: -33.9289,
        longitude: 18.4194,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-5", // New moving provider
        latitude: -25.7479,
        longitude: 28.2293,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-6", // Indian chef Raj
        latitude: -33.9249,
        longitude: 18.4241,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-7", // African chef Lila
        latitude: -26.2041,
        longitude: 28.0473,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-8", // Asian chef Akiko
        latitude: -29.8587,
        longitude: 31.0218,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        providerId: "provider-9", // Mediterranean chef Maria
        latitude: -33.9289,
        longitude: 18.4194,
        isOnline: true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
    ];

    providerLocations.forEach(location => {
      this.providerLocations.set(location.id, location as ProviderLocation);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      address: insertUser.address || null,
      phone: insertUser.phone || null,
      isProvider: insertUser.isProvider || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    return this.serviceProviders.get(id);
  }

  async getServiceProvidersByService(serviceCategory: string): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values()).filter(
      provider => provider.servicesOffered.includes(serviceCategory)
    );
  }

  async createServiceProvider(insertProvider: InsertServiceProvider): Promise<ServiceProvider> {
    const id = randomUUID();
    const provider: ServiceProvider = {
      ...insertProvider,
      id,
      firstName: insertProvider.firstName || null,
      lastName: insertProvider.lastName || null,
      email: insertProvider.email || null,
      phone: insertProvider.phone || null,
      bio: insertProvider.bio || null,
      profileImage: insertProvider.profileImage || null,
      experience: insertProvider.experience || null,
      availability: insertProvider.availability || {},
      isVerified: insertProvider.isVerified || false,
      insuranceVerified: insertProvider.insuranceVerified || false,
      backgroundCheckVerified: insertProvider.backgroundCheckVerified || false,
      hasInsurance: insertProvider.hasInsurance || false,
      backgroundCheckConsent: insertProvider.backgroundCheckConsent || false,
      rating: "0",
      totalReviews: 0,
      idDocument: insertProvider.idDocument || null,
      qualificationCertificate: insertProvider.qualificationCertificate || null,
      createdAt: new Date()
    };
    this.serviceProviders.set(id, provider);
    return provider;
  }

  async updateServiceProviderRating(id: string, rating: number, totalReviews: number): Promise<ServiceProvider> {
    const provider = this.serviceProviders.get(id);
    if (!provider) throw new Error("Provider not found");
    
    const updatedProvider = {
      ...provider,
      rating: rating.toFixed(2),
      totalReviews
    };
    this.serviceProviders.set(id, updatedProvider);
    return updatedProvider;
  }

  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.isActive);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.category === category && service.isActive
    );
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { 
      ...insertService, 
      id,
      isActive: insertService.isActive !== undefined ? insertService.isActive : true
    };
    this.services.set(id, service);
    return service;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.customerId === customerId
    );
  }

  async getBookingsByProvider(providerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.providerId === providerId
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      status: insertBooking.status || "pending",
      specialInstructions: insertBooking.specialInstructions || null,
      isRecurring: insertBooking.isRecurring || false,
      recurringFrequency: insertBooking.recurringFrequency || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = {
      ...booking,
      status,
      updatedAt: new Date()
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getReviewsByProvider(providerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.providerId === providerId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      serviceQuality: insertReview.serviceQuality || null,
      punctuality: insertReview.punctuality || null,
      professionalism: insertReview.professionalism || null,
      comment: insertReview.comment || null,
      wouldRecommend: insertReview.wouldRecommend || true,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  // Payment method operations
  async getPaymentMethodsByUser(userId: string): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(pm => pm.userId === userId && pm.isActive);
  }

  async createPaymentMethod(paymentMethodData: InsertPaymentMethod): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: randomUUID(),
      type: paymentMethodData.type,
      userId: paymentMethodData.userId,
      cardNumber: paymentMethodData.cardNumber || null,
      cardHolderName: paymentMethodData.cardHolderName || null,
      expiryMonth: paymentMethodData.expiryMonth || null,
      expiryYear: paymentMethodData.expiryYear || null,
      bankName: paymentMethodData.bankName || null,
      cardType: paymentMethodData.cardType || null,
      isActive: paymentMethodData.isActive ?? true,
      isDefault: paymentMethodData.isDefault ?? false,
      createdAt: new Date(),
    };
    this.paymentMethods.set(paymentMethod.id, paymentMethod);
    return paymentMethod;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const paymentMethod = this.paymentMethods.get(id);
    if (paymentMethod) {
      paymentMethod.isActive = false;
      this.paymentMethods.set(id, paymentMethod);
    }
  }

  // Location operations (placeholder for now)
  async getProviderLocation(providerId: string): Promise<ProviderLocation | undefined> {
    return Array.from(this.providerLocations.values()).find(loc => loc.providerId === providerId);
  }

  async updateProviderLocation(locationData: InsertProviderLocation): Promise<ProviderLocation> {
    const existingLocation = Array.from(this.providerLocations.values()).find(loc => loc.providerId === locationData.providerId);
    
    if (existingLocation) {
      const updatedLocation = { ...existingLocation, ...locationData, updatedAt: new Date() };
      this.providerLocations.set(existingLocation.id, updatedLocation);
      return updatedLocation;
    } else {
      const location: ProviderLocation = {
        id: randomUUID(),
        ...locationData,
        isOnline: locationData.isOnline ?? false,
        lastSeen: new Date(),
        updatedAt: new Date(),
      };
      this.providerLocations.set(location.id, location);
      return location;
    }
  }

  // Job queue operations (placeholder for now)
  async getJobQueueItem(id: string): Promise<JobQueue | undefined> {
    return this.jobQueue.get(id);
  }

  async createJobQueueItem(jobData: InsertJobQueue): Promise<JobQueue> {
    const job: JobQueue = {
      id: randomUUID(),
      ...jobData,
      status: jobData.status ?? "pending",
      maxRadius: jobData.maxRadius ?? 20,
      priority: jobData.priority ?? 1,
      assignedProviderId: jobData.assignedProviderId ?? null,
      createdAt: new Date(),
    };
    this.jobQueue.set(job.id, job);
    return job;
  }

  // Training system methods (stub implementations for MemStorage)
  async getAllTrainingModules(): Promise<TrainingModule[]> {
    return [];
  }

  async getTrainingModulesByService(serviceType: string): Promise<TrainingModule[]> {
    return [];
  }

  async getProviderTrainingProgress(providerId: string): Promise<ProviderTrainingProgress[]> {
    return [];
  }

  async updateTrainingProgress(progressId: string, progress: Partial<ProviderTrainingProgress>): Promise<ProviderTrainingProgress> {
    throw new Error("Training progress update not implemented in MemStorage");
  }

  async createTrainingProgress(progress: InsertProviderTrainingProgress): Promise<ProviderTrainingProgress> {
    throw new Error("Training progress creation not implemented in MemStorage");
  }

  async getAllCertifications(): Promise<Certification[]> {
    return [];
  }

  async getCertificationsByService(serviceType: string): Promise<Certification[]> {
    return [];
  }

  async getProviderCertifications(providerId: string): Promise<ProviderCertification[]> {
    return [];
  }

  async createProviderCertification(certification: InsertProviderCertification): Promise<ProviderCertification> {
    throw new Error("Provider certification creation not implemented in MemStorage");
  }

  async getSkillAssessments(serviceType: string): Promise<SkillAssessment[]> {
    return [];
  }

  async getProviderAssessmentResults(providerId: string): Promise<ProviderAssessmentResult[]> {
    return [];
  }

  async createAssessmentResult(result: InsertProviderAssessmentResult): Promise<ProviderAssessmentResult> {
    throw new Error("Assessment result creation not implemented in MemStorage");
  }
}

// Switch to database storage for production
export const storage = new DatabaseStorage();
