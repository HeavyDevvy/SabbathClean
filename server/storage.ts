import type { 
  User, ServiceProvider, Service, Booking, Payment, Review, 
  Notification, PlatformStats, CreateUserInput, CreateBookingInput, 
  CreateProviderInput, CreateReviewInput, ServiceCategory, BookingStatus, PaymentStatus 
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User Management
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: CreateUserInput): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Service Provider Management
  getProviders(filters?: { serviceId?: string; location?: string; verified?: boolean }): Promise<ServiceProvider[]>;
  getProviderById(id: string): Promise<ServiceProvider | null>;
  getProviderByUserId(userId: string): Promise<ServiceProvider | null>;
  createProvider(userId: string, providerData: CreateProviderInput): Promise<ServiceProvider>;
  updateProvider(id: string, data: Partial<ServiceProvider>): Promise<ServiceProvider>;
  verifyProvider(id: string): Promise<ServiceProvider>;

  // Service Management
  getServices(category?: ServiceCategory): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | null>;
  createService(serviceData: Omit<Service, 'id'>): Promise<Service>;
  updateService(id: string, data: Partial<Service>): Promise<Service>;

  // Booking Management
  getBookings(filters?: { customerId?: string; providerId?: string; status?: BookingStatus }): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | null>;
  createBooking(customerId: string, bookingData: CreateBookingInput): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;
  assignProvider(bookingId: string, providerId: string): Promise<Booking>;
  completeBooking(bookingId: string, completionData: { completionNotes?: string; afterPhotos?: string[] }): Promise<Booking>;

  // Payment Management
  getPayments(bookingId?: string): Promise<Payment[]>;
  createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment>;

  // Review Management
  getReviews(filters?: { revieweeId?: string; bookingId?: string }): Promise<Review[]>;
  createReview(bookingId: string, reviewerId: string, revieweeId: string, reviewData: CreateReviewInput): Promise<Review>;
  respondToReview(reviewId: string, response: string): Promise<Review>;

  // Notification Management
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;

  // Analytics & Stats
  getPlatformStats(): Promise<PlatformStats>;
  getProviderEarnings(providerId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getCustomerBookingHistory(customerId: string): Promise<Booking[]>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private providers: ServiceProvider[] = [];
  private services: Service[] = [];
  private bookings: Booking[] = [];
  private payments: Payment[] = [];
  private reviews: Review[] = [];
  private notifications: Notification[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize services
    const defaultServices: Service[] = [
      {
        id: 'house-cleaning',
        name: 'House Cleaning',
        description: 'Professional house cleaning service',
        category: 'indoor',
        subcategory: 'general-cleaning',
        duration: 120,
        basePrice: 350,
        priceUnit: 'job',
        requirements: ['Access to property', 'Cleaning supplies available'],
        addons: [
          { id: 'deep-clean', name: 'Deep Clean', description: 'Extra thorough cleaning', price: 100 },
          { id: 'windows', name: 'Window Cleaning', description: 'Interior window cleaning', price: 50 }
        ],
        isActive: true,
        icon: 'home'
      },
      {
        id: 'garden-maintenance',
        name: 'Garden Maintenance',
        description: 'Complete garden care and maintenance',
        category: 'outdoor',
        subcategory: 'gardening',
        duration: 180,
        basePrice: 400,
        priceUnit: 'job',
        requirements: ['Garden tools provided', 'Water access'],
        addons: [
          { id: 'pruning', name: 'Tree Pruning', description: 'Professional tree pruning', price: 150 },
          { id: 'fertilizing', name: 'Fertilizing', description: 'Garden fertilization', price: 80 }
        ],
        isActive: true,
        icon: 'leaf'
      },
      {
        id: 'laundry-ironing',
        name: 'Laundry & Ironing',
        description: 'Professional laundry and ironing service',
        category: 'indoor',
        subcategory: 'laundry',
        duration: 150,
        basePrice: 200,
        priceUnit: 'job',
        requirements: ['Washing machine available', 'Iron and board provided'],
        addons: [
          { id: 'dry-cleaning', name: 'Dry Clean Items', description: 'Special care items', price: 120 },
          { id: 'folding', name: 'Professional Folding', description: 'Expert folding service', price: 30 }
        ],
        isActive: true,
        icon: 'shirt'
      },
      {
        id: 'plumbing-repairs',
        name: 'Plumbing Repairs',
        description: 'Professional plumbing services',
        category: 'maintenance',
        subcategory: 'plumbing',
        duration: 120,
        basePrice: 450,
        priceUnit: 'hour',
        requirements: ['Access to plumbing', 'Parts additional cost'],
        addons: [
          { id: 'emergency', name: 'Emergency Service', description: '24/7 emergency call-out', price: 200 },
          { id: 'parts', name: 'Parts & Materials', description: 'Additional parts cost', price: 0 }
        ],
        isActive: true,
        icon: 'wrench'
      },
      {
        id: 'elder-care',
        name: 'Elder Care',
        description: 'Compassionate elder care services',
        category: 'specialized',
        subcategory: 'care',
        duration: 240,
        basePrice: 300,
        priceUnit: 'hour',
        requirements: ['Background check completed', 'First aid certification'],
        addons: [
          { id: 'medication', name: 'Medication Management', description: 'Medication assistance', price: 50 },
          { id: 'transport', name: 'Transportation', description: 'Medical appointments transport', price: 100 }
        ],
        isActive: true,
        icon: 'heart'
      },
      {
        id: 'full-time-housekeeper',
        name: 'Full-time Housekeeper',
        description: 'Full-time residential housekeeping',
        category: 'fulltime',
        subcategory: 'housekeeper',
        duration: 480,
        basePrice: 15000,
        priceUnit: 'job',
        requirements: ['Live-in accommodation', 'Full background check'],
        addons: [
          { id: 'cooking', name: 'Cooking Services', description: 'Meal preparation included', price: 2000 },
          { id: 'childcare', name: 'Child Care', description: 'Basic childcare assistance', price: 3000 }
        ],
        isActive: true,
        icon: 'users'
      }
    ];

    this.services = defaultServices;

    // Create sample admin user
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@homeservices.com',
      firstName: 'System',
      lastName: 'Admin',
      phone: '+27123456789',
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      preferences: {
        notifications: true,
        defaultLocation: 'Cape Town',
        preferredProviders: [],
      }
    };

    this.users = [adminUser];

    // Create sample customers
    const customers: User[] = [
      {
        id: 'customer-1',
        email: 'sarah@email.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+27821234567',
        role: 'customer',
        isVerified: true,
        createdAt: new Date(),
        preferences: {
          notifications: true,
          defaultLocation: 'Cape Town CBD',
          preferredProviders: [],
        }
      },
      {
        id: 'customer-2',
        email: 'david@email.com',
        firstName: 'David',
        lastName: 'Smith',
        phone: '+27829876543',
        role: 'customer',
        isVerified: true,
        createdAt: new Date(),
        preferences: {
          notifications: true,
          defaultLocation: 'Johannesburg',
          preferredProviders: [],
        }
      }
    ];

    this.users.push(...customers);

    // Create sample provider users
    const providerUsers: User[] = [
      {
        id: 'provider-user-1',
        email: 'maria@email.com',
        firstName: 'Maria',
        lastName: 'Santos',
        phone: '+27834567890',
        role: 'provider',
        isVerified: true,
        createdAt: new Date(),
      },
      {
        id: 'provider-user-2',
        email: 'john@email.com',
        firstName: 'John',
        lastName: 'Williams',
        phone: '+27845678901',
        role: 'provider',
        isVerified: true,
        createdAt: new Date(),
      }
    ];

    this.users.push(...providerUsers);

    // Create sample providers
    const sampleProviders: ServiceProvider[] = [
      {
        id: 'provider-1',
        userId: 'provider-user-1',
        businessName: 'Maria\'s Cleaning Services',
        bio: 'Professional cleaning specialist with 5 years experience. I take pride in delivering exceptional cleaning services for homes and offices across Cape Town.',
        services: ['house-cleaning', 'laundry-ironing'],
        serviceAreas: ['Cape Town CBD', 'Green Point', 'Sea Point', 'Camps Bay'],
        hourlyRates: {
          'house-cleaning': 280,
          'laundry-ironing': 180
        },
        availability: {
          schedule: {
            monday: { available: true, start: '08:00', end: '17:00', breaks: [] },
            tuesday: { available: true, start: '08:00', end: '17:00', breaks: [] },
            wednesday: { available: true, start: '08:00', end: '17:00', breaks: [] },
            thursday: { available: true, start: '08:00', end: '17:00', breaks: [] },
            friday: { available: true, start: '08:00', end: '17:00', breaks: [] },
            saturday: { available: true, start: '09:00', end: '15:00', breaks: [] },
            sunday: { available: false, start: '', end: '', breaks: [] }
          },
          timeoff: [],
          sameDay: true,
          advance: 1
        },
        isVerified: true,
        backgroundChecked: true,
        insuranceVerified: true,
        yearsExperience: 5,
        rating: 4.8,
        totalReviews: 127,
        completedJobs: 245,
        responseTime: 15,
        profileImages: ['/api/placeholder/400/400'],
        documents: [],
        createdAt: new Date()
      },
      {
        id: 'provider-2',
        userId: 'provider-user-2',
        businessName: 'JW Garden Solutions',
        bio: 'Expert gardener and landscaper with over 8 years of experience. Specialized in garden maintenance, landscaping, and plant care for residential and commercial properties.',
        services: ['garden-maintenance'],
        serviceAreas: ['Johannesburg North', 'Sandton', 'Randburg', 'Roodepoort'],
        hourlyRates: {
          'garden-maintenance': 320
        },
        availability: {
          schedule: {
            monday: { available: true, start: '07:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { available: true, start: '07:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            wednesday: { available: true, start: '07:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            thursday: { available: true, start: '07:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { available: true, start: '07:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            saturday: { available: true, start: '08:00', end: '14:00', breaks: [] },
            sunday: { available: false, start: '', end: '', breaks: [] }
          },
          timeoff: [],
          sameDay: false,
          advance: 2
        },
        isVerified: true,
        backgroundChecked: true,
        insuranceVerified: true,
        yearsExperience: 8,
        rating: 4.9,
        totalReviews: 89,
        completedJobs: 156,
        responseTime: 8,
        profileImages: ['/api/placeholder/400/400'],
        documents: [],
        createdAt: new Date()
      }
    ];

    this.providers = sampleProviders;

    // Create sample bookings
    const sampleBookings: Booking[] = [
      {
        id: 'booking-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        serviceId: 'house-cleaning',
        status: 'confirmed',
        type: 'recurring',
        title: 'Weekly House Cleaning',
        description: 'Regular house cleaning service',
        duration: 120,
        address: {
          street: '123 Long Street',
          city: 'Cape Town',
          state: 'Western Cape',
          zipCode: '8001',
          country: 'South Africa',
          propertyType: 'apartment',
          propertySize: 85,
          accessNotes: 'Apartment 4B, security code 1234'
        },
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        scheduledTime: '10:00',
        basePrice: 350,
        addons: [
          { addonId: 'windows', name: 'Window Cleaning', price: 50, quantity: 1 }
        ],
        totalAmount: 400,
        recurringSettings: {
          frequency: 'weekly',
          preferredProviderId: 'provider-1'
        },
        specialInstructions: 'Please focus on the kitchen and bathrooms',
        messages: [],
        beforePhotos: [],
        afterPhotos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.bookings = sampleBookings;

    // Create sample reviews
    const sampleReviews: Review[] = [
      {
        id: 'review-1',
        bookingId: 'booking-1',
        reviewerId: 'customer-1',
        revieweeId: 'provider-1',
        reviewerRole: 'customer',
        rating: 5,
        comment: 'Maria did an excellent job! Very thorough and professional. Will definitely book again.',
        categories: [
          { category: 'Quality', rating: 5 },
          { category: 'Punctuality', rating: 5 },
          { category: 'Communication', rating: 4 }
        ],
        isPublic: true,
        isHidden: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    this.reviews = sampleReviews;
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async createUser(userData: CreateUserInput): Promise<User> {
    const user: User = {
      id: nanoid(),
      ...userData,
      isVerified: false,
      createdAt: new Date(),
      preferences: {
        notifications: true,
        preferredProviders: [],
      }
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users.splice(index, 1);
  }

  // Service Provider Management
  async getProviders(filters?: { serviceId?: string; location?: string; verified?: boolean }): Promise<ServiceProvider[]> {
    let providers = this.providers;

    if (filters?.serviceId) {
      providers = providers.filter(p => p.services.includes(filters.serviceId!));
    }

    if (filters?.location) {
      providers = providers.filter(p => 
        p.serviceAreas.some(area => 
          area.toLowerCase().includes(filters.location!.toLowerCase())
        )
      );
    }

    if (filters?.verified !== undefined) {
      providers = providers.filter(p => p.isVerified === filters.verified);
    }

    return providers;
  }

  async getProviderById(id: string): Promise<ServiceProvider | null> {
    return this.providers.find(p => p.id === id) || null;
  }

  async getProviderByUserId(userId: string): Promise<ServiceProvider | null> {
    return this.providers.find(p => p.userId === userId) || null;
  }

  async createProvider(userId: string, providerData: CreateProviderInput): Promise<ServiceProvider> {
    const provider: ServiceProvider = {
      id: nanoid(),
      userId,
      ...providerData,
      availability: {
        ...providerData.availability,
        timeoff: []
      },
      isVerified: false,
      backgroundChecked: false,
      insuranceVerified: false,
      rating: 0,
      totalReviews: 0,
      completedJobs: 0,
      responseTime: 60,
      profileImages: [],
      documents: [],
      createdAt: new Date()
    };

    this.providers.push(provider);
    return provider;
  }

  async updateProvider(id: string, data: Partial<ServiceProvider>): Promise<ServiceProvider> {
    const index = this.providers.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Provider not found');
    
    this.providers[index] = { ...this.providers[index], ...data };
    return this.providers[index];
  }

  async verifyProvider(id: string): Promise<ServiceProvider> {
    return this.updateProvider(id, { 
      isVerified: true, 
      backgroundChecked: true, 
      insuranceVerified: true 
    });
  }

  // Service Management
  async getServices(category?: ServiceCategory): Promise<Service[]> {
    if (category) {
      return this.services.filter(s => s.category === category && s.isActive);
    }
    return this.services.filter(s => s.isActive);
  }

  async getServiceById(id: string): Promise<Service | null> {
    return this.services.find(s => s.id === id) || null;
  }

  async createService(serviceData: Omit<Service, 'id'>): Promise<Service> {
    const service: Service = {
      id: nanoid(),
      ...serviceData
    };
    this.services.push(service);
    return service;
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    
    this.services[index] = { ...this.services[index], ...data };
    return this.services[index];
  }

  // Booking Management
  async getBookings(filters?: { customerId?: string; providerId?: string; status?: BookingStatus }): Promise<Booking[]> {
    let bookings = this.bookings;

    if (filters?.customerId) {
      bookings = bookings.filter(b => b.customerId === filters.customerId);
    }

    if (filters?.providerId) {
      bookings = bookings.filter(b => b.providerId === filters.providerId);
    }

    if (filters?.status) {
      bookings = bookings.filter(b => b.status === filters.status);
    }

    return bookings.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.bookings.find(b => b.id === id) || null;
  }

  async createBooking(customerId: string, bookingData: CreateBookingInput): Promise<Booking> {
    const service = await this.getServiceById(bookingData.serviceId);
    if (!service) throw new Error('Service not found');

    const booking: Booking = {
      id: nanoid(),
      customerId,
      serviceId: bookingData.serviceId,
      status: 'pending',
      type: bookingData.recurringSettings ? 'recurring' : 'one-time',
      title: service.name,
      description: bookingData.description,
      duration: service.duration,
      address: bookingData.address,
      scheduledDate: new Date(bookingData.scheduledDate),
      scheduledTime: bookingData.scheduledTime,
      basePrice: service.basePrice,
      addons: bookingData.addons.map(addon => {
        const serviceAddon = service.addons.find(sa => sa.id === addon.addonId);
        return {
          addonId: addon.addonId,
          name: serviceAddon?.name || '',
          price: (serviceAddon?.price || 0) * addon.quantity,
          quantity: addon.quantity
        };
      }),
      totalAmount: service.basePrice + bookingData.addons.reduce((sum, addon) => {
        const serviceAddon = service.addons.find(sa => sa.id === addon.addonId);
        return sum + ((serviceAddon?.price || 0) * addon.quantity);
      }, 0),
      recurringSettings: bookingData.recurringSettings ? {
        ...bookingData.recurringSettings,
        endDate: bookingData.recurringSettings.endDate ? new Date(bookingData.recurringSettings.endDate) : undefined
      } : undefined,
      specialInstructions: bookingData.specialInstructions,
      messages: [],
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bookings.push(booking);
    return booking;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    
    this.bookings[index] = { 
      ...this.bookings[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.bookings[index];
  }

  async assignProvider(bookingId: string, providerId: string): Promise<Booking> {
    return this.updateBooking(bookingId, { 
      providerId, 
      status: 'provider-assigned' 
    });
  }

  async completeBooking(bookingId: string, completionData: { completionNotes?: string; afterPhotos?: string[] }): Promise<Booking> {
    return this.updateBooking(bookingId, {
      status: 'completed',
      actualEndTime: new Date(),
      completionNotes: completionData.completionNotes,
      afterPhotos: completionData.afterPhotos || []
    });
  }

  // Payment Management
  async getPayments(bookingId?: string): Promise<Payment[]> {
    if (bookingId) {
      return this.payments.filter(p => p.bookingId === bookingId);
    }
    return this.payments;
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payment: Payment = {
      id: nanoid(),
      ...paymentData,
      createdAt: new Date()
    };
    this.payments.push(payment);
    return payment;
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    
    this.payments[index].status = status;
    if (status === 'completed') {
      this.payments[index].processedAt = new Date();
    }
    
    return this.payments[index];
  }

  // Review Management
  async getReviews(filters?: { revieweeId?: string; bookingId?: string }): Promise<Review[]> {
    let reviews = this.reviews.filter(r => !r.isHidden);

    if (filters?.revieweeId) {
      reviews = reviews.filter(r => r.revieweeId === filters.revieweeId);
    }

    if (filters?.bookingId) {
      reviews = reviews.filter(r => r.bookingId === filters.bookingId);
    }

    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(bookingId: string, reviewerId: string, revieweeId: string, reviewData: CreateReviewInput): Promise<Review> {
    const review: Review = {
      id: nanoid(),
      bookingId,
      reviewerId,
      revieweeId,
      reviewerRole: 'customer', // Determine based on user role
      ...reviewData,
      isPublic: true,
      isHidden: false,
      createdAt: new Date()
    };

    this.reviews.push(review);

    // Update provider rating
    if (revieweeId.startsWith('provider-')) {
      const providerReviews = this.reviews.filter(r => r.revieweeId === revieweeId);
      const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
      
      const provider = this.providers.find(p => p.id === revieweeId);
      if (provider) {
        provider.rating = Math.round(avgRating * 10) / 10;
        provider.totalReviews = providerReviews.length;
      }
    }

    return review;
  }

  async respondToReview(reviewId: string, response: string): Promise<Review> {
    const index = this.reviews.findIndex(r => r.id === reviewId);
    if (index === -1) throw new Error('Review not found');
    
    this.reviews[index].response = {
      message: response,
      respondedAt: new Date()
    };
    
    return this.reviews[index];
  }

  // Notification Management
  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    let notifications = this.notifications.filter(n => n.userId === userId);
    
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      id: nanoid(),
      ...notification,
      createdAt: new Date()
    };
    
    this.notifications.push(newNotification);
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  // Analytics & Stats
  async getPlatformStats(): Promise<PlatformStats> {
    const totalUsers = this.users.filter(u => u.role === 'customer').length;
    const totalProviders = this.providers.length;
    const totalBookings = this.bookings.length;
    const completedBookings = this.bookings.filter(b => b.status === 'completed').length;
    const totalRevenue = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.totalAmount, 0);

    const allRatings = this.providers
      .filter(p => p.totalReviews > 0)
      .map(p => p.rating);
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
      : 0;

    const activeProviders = this.providers.filter(p => p.isVerified).length;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const bookingsToday = this.bookings.filter(b => 
      b.scheduledDate >= startOfDay &&
      b.scheduledDate < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    ).length;

    const revenueToday = this.payments
      .filter(p => 
        p.status === 'completed' &&
        p.processedAt &&
        p.processedAt >= startOfDay
      )
      .reduce((sum, p) => sum + p.totalAmount, 0);

    return {
      totalUsers,
      totalProviders,
      totalBookings,
      completedBookings,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      activeProviders,
      bookingsToday,
      revenueToday
    };
  }

  async getProviderEarnings(providerId: string, startDate?: Date, endDate?: Date): Promise<number> {
    let payments = this.payments.filter(p => {
      const booking = this.bookings.find(b => b.id === p.bookingId);
      return booking?.providerId === providerId && p.status === 'completed';
    });

    if (startDate) {
      payments = payments.filter(p => p.processedAt && p.processedAt >= startDate);
    }

    if (endDate) {
      payments = payments.filter(p => p.processedAt && p.processedAt <= endDate);
    }

    const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    return totalRevenue * 0.85; // 85% goes to provider, 15% platform fee
  }

  async getCustomerBookingHistory(customerId: string): Promise<Booking[]> {
    return this.bookings
      .filter(b => b.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();