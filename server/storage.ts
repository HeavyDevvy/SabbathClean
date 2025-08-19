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
  type InsertReview
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private serviceProviders: Map<string, ServiceProvider> = new Map();
  private services: Map<string, Service> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private reviews: Map<string, Review> = new Map();

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
        basePrice: "450.00",
        isActive: true,
      },
      {
        id: "service-2", 
        name: "Deep Cleaning",
        description: "Thorough cleaning for move-ins, move-outs including carpet cleaning, window washing, appliance cleaning",
        category: "deep-cleaning",
        basePrice: "810.00",
        isActive: true,
      },
      {
        id: "service-3",
        name: "Plumbing Services",
        description: "Pipe repairs, leak fixing, faucet installation, drain cleaning, toilet repairs, water heater maintenance",
        category: "plumbing",
        basePrice: "750.00",
        isActive: true,
      },
      {
        id: "service-4",
        name: "Electrical Services",
        description: "Wiring repairs, outlet installation, lighting setup, circuit breaker fixes, electrical safety inspections",
        category: "electrical",
        basePrice: "850.00",
        isActive: true,
      },
      {
        id: "service-5",
        name: "Chef & Catering",
        description: "Personal chef services, meal preparation, event catering, menu planning, dietary accommodations",
        category: "chef-catering",
        basePrice: "950.00",
        isActive: true,
      },
      {
        id: "service-6",
        name: "Waitering Services",
        description: "Professional waitstaff for events, table service, bar service, event coordination, cleanup assistance",
        category: "waitering",
        basePrice: "350.00",
        isActive: true,
      },
      {
        id: "service-7",
        name: "Garden Care",
        description: "Lawn maintenance, pruning, weeding, planting, irrigation setup, landscape design consultation",
        category: "gardening",
        basePrice: "540.00",
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
          profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b588?w=300",
          hourlyRate: "450.00",
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
          hourlyRate: "800.00",
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
          bio: "Professional chef and catering specialist with fine dining experience.",
          profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
          hourlyRate: "650.00",
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
      }
    ];

    providers.forEach(({ user, provider }) => {
      this.users.set(user.id, user as User);
      this.serviceProviders.set(provider.id, provider as ServiceProvider);
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
      comment: insertReview.comment || null,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
