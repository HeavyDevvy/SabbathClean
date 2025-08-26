import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  createUserSchema, createBookingSchema, createProviderSchema, createReviewSchema,
  BookingStatus, PaymentStatus, ServiceCategory 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============================================================================
  // USER MANAGEMENT ENDPOINTS
  // ============================================================================
  
  // Get all users (admin only in production)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = createUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ============================================================================
  // SERVICE PROVIDER ENDPOINTS
  // ============================================================================

  // Get all providers with optional filters
  app.get("/api/providers", async (req, res) => {
    try {
      const { serviceId, location, verified } = req.query;
      const filters: any = {};
      
      if (serviceId) filters.serviceId = serviceId as string;
      if (location) filters.location = location as string;
      if (verified !== undefined) filters.verified = verified === 'true';
      
      const providers = await storage.getProviders(filters);
      
      // Enrich with user data
      const enrichedProviders = await Promise.all(
        providers.map(async (provider) => {
          const user = await storage.getUserById(provider.userId);
          return {
            ...provider,
            user: user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              profileImage: user.profileImage
            } : null
          };
        })
      );
      
      res.json(enrichedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ error: "Failed to get providers" });
    }
  });

  // Get provider by ID
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getProviderById(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      
      // Enrich with user data and reviews
      const user = await storage.getUserById(provider.userId);
      const reviews = await storage.getReviews({ revieweeId: provider.id });
      
      res.json({
        ...provider,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage
        } : null,
        reviews
      });
    } catch (error) {
      console.error('Error fetching provider:', error);
      res.status(500).json({ error: "Failed to get provider" });
    }
  });

  // Create new provider profile
  app.post("/api/providers", async (req, res) => {
    try {
      const { userId, ...providerData } = req.body;
      const validatedData = createProviderSchema.parse(providerData);
      
      // Check if user exists and doesn't already have a provider profile
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const existingProvider = await storage.getProviderByUserId(userId);
      if (existingProvider) {
        return res.status(400).json({ error: "Provider profile already exists" });
      }
      
      const provider = await storage.createProvider(userId, validatedData);
      res.status(201).json(provider);
    } catch (error) {
      console.error('Error creating provider:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid provider data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create provider" });
    }
  });

  // Update provider
  app.put("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.updateProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error('Error updating provider:', error);
      res.status(500).json({ error: "Failed to update provider" });
    }
  });

  // Verify provider
  app.post("/api/providers/:id/verify", async (req, res) => {
    try {
      const provider = await storage.verifyProvider(req.params.id);
      res.json(provider);
    } catch (error) {
      console.error('Error verifying provider:', error);
      res.status(500).json({ error: "Failed to verify provider" });
    }
  });

  // ============================================================================
  // SERVICE MANAGEMENT ENDPOINTS
  // ============================================================================

  // Get all services with optional category filter
  app.get("/api/services", async (req, res) => {
    try {
      const { category } = req.query;
      const services = await storage.getServices(category as ServiceCategory);
      res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: "Failed to get services" });
    }
  });

  // Get service by ID
  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getServiceById(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({ error: "Failed to get service" });
    }
  });

  // Get services by category
  app.get("/api/services/category/:category", async (req, res) => {
    try {
      const category = req.params.category as ServiceCategory;
      const services = await storage.getServices(category);
      res.json(services);
    } catch (error) {
      console.error('Error fetching services by category:', error);
      res.status(500).json({ error: "Failed to get services" });
    }
  });

  // ============================================================================
  // BOOKING MANAGEMENT ENDPOINTS
  // ============================================================================

  // Get bookings with filters
  app.get("/api/bookings", async (req, res) => {
    try {
      const { customerId, providerId, status } = req.query;
      const filters: any = {};
      
      if (customerId) filters.customerId = customerId as string;
      if (providerId) filters.providerId = providerId as string;
      if (status) filters.status = status as BookingStatus;
      
      const bookings = await storage.getBookings(filters);
      
      // Enrich with service and user data
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const service = await storage.getServiceById(booking.serviceId);
          const customer = await storage.getUserById(booking.customerId);
          const provider = booking.providerId ? await storage.getProviderById(booking.providerId) : null;
          const providerUser = provider ? await storage.getUserById(provider.userId) : null;
          
          return {
            ...booking,
            service: service ? { name: service.name, category: service.category } : null,
            customer: customer ? { firstName: customer.firstName, lastName: customer.lastName } : null,
            provider: provider && providerUser ? {
              id: provider.id,
              businessName: provider.businessName,
              rating: provider.rating,
              user: {
                firstName: providerUser.firstName,
                lastName: providerUser.lastName
              }
            } : null
          };
        })
      );
      
      res.json(enrichedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: "Failed to get bookings" });
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Enrich with complete data
      const service = await storage.getServiceById(booking.serviceId);
      const customer = await storage.getUserById(booking.customerId);
      const provider = booking.providerId ? await storage.getProviderById(booking.providerId) : null;
      const providerUser = provider ? await storage.getUserById(provider.userId) : null;
      
      res.json({
        ...booking,
        service,
        customer,
        provider: provider && providerUser ? {
          ...provider,
          user: providerUser
        } : null
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ error: "Failed to get booking" });
    }
  });

  // Create new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const { customerId, ...bookingData } = req.body;
      const validatedData = createBookingSchema.parse(bookingData);
      
      // Verify customer exists
      const customer = await storage.getUserById(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const booking = await storage.createBooking(customerId, validatedData);
      
      // Create notification for new booking
      await storage.createNotification({
        userId: customerId,
        type: 'booking-confirmed',
        title: 'Booking Created',
        message: `Your booking for ${booking.title} has been created and is awaiting provider assignment.`,
        data: { bookingId: booking.id },
        read: false
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Update booking
  app.put("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      res.json(booking);
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Assign provider to booking
  app.post("/api/bookings/:id/assign", async (req, res) => {
    try {
      const { providerId } = req.body;
      
      if (!providerId) {
        return res.status(400).json({ error: "Provider ID is required" });
      }
      
      const booking = await storage.assignProvider(req.params.id, providerId);
      
      // Create notifications
      await storage.createNotification({
        userId: booking.customerId,
        type: 'provider-assigned',
        title: 'Provider Assigned',
        message: `A provider has been assigned to your booking for ${booking.title}.`,
        data: { bookingId: booking.id },
        read: false
      });
      
      const provider = await storage.getProviderById(providerId);
      if (provider) {
        await storage.createNotification({
          userId: provider.userId,
          type: 'booking-confirmed',
          title: 'New Booking Assignment',
          message: `You have been assigned a new booking for ${booking.title}.`,
          data: { bookingId: booking.id },
          read: false
        });
      }
      
      res.json(booking);
    } catch (error) {
      console.error('Error assigning provider:', error);
      res.status(500).json({ error: "Failed to assign provider" });
    }
  });

  // Complete booking
  app.post("/api/bookings/:id/complete", async (req, res) => {
    try {
      const { completionNotes, afterPhotos } = req.body;
      const booking = await storage.completeBooking(req.params.id, {
        completionNotes,
        afterPhotos: afterPhotos || []
      });
      
      // Create completion notification
      await storage.createNotification({
        userId: booking.customerId,
        type: 'service-completed',
        title: 'Service Completed',
        message: `Your ${booking.title} service has been completed. Please rate your experience.`,
        data: { bookingId: booking.id },
        read: false
      });
      
      res.json(booking);
    } catch (error) {
      console.error('Error completing booking:', error);
      res.status(500).json({ error: "Failed to complete booking" });
    }
  });

  // ============================================================================
  // PAYMENT ENDPOINTS
  // ============================================================================

  // Get payments
  app.get("/api/payments", async (req, res) => {
    try {
      const { bookingId } = req.query;
      const payments = await storage.getPayments(bookingId as string);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: "Failed to get payments" });
    }
  });

  // Create payment intent
  app.post("/api/payments", async (req, res) => {
    try {
      const { bookingId, amount, method } = req.body;
      
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      const payment = await storage.createPayment({
        bookingId,
        amount: amount || booking.totalAmount,
        tip: 0,
        totalAmount: amount || booking.totalAmount,
        method: method || { type: 'card', isDefault: true },
        status: 'pending'
      });
      
      // In a real implementation, integrate with Stripe here
      // For demo, we'll simulate immediate success
      setTimeout(async () => {
        await storage.updatePaymentStatus(payment.id, 'completed');
      }, 1000);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // ============================================================================
  // REVIEW ENDPOINTS
  // ============================================================================

  // Get reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const { revieweeId, bookingId } = req.query;
      const filters: any = {};
      
      if (revieweeId) filters.revieweeId = revieweeId as string;
      if (bookingId) filters.bookingId = bookingId as string;
      
      const reviews = await storage.getReviews(filters);
      
      // Enrich with reviewer data
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUserById(review.reviewerId);
          return {
            ...review,
            reviewer: reviewer ? {
              firstName: reviewer.firstName,
              lastName: reviewer.lastName,
              profileImage: reviewer.profileImage
            } : null
          };
        })
      );
      
      res.json(enrichedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  // Create review
  app.post("/api/reviews", async (req, res) => {
    try {
      const { bookingId, reviewerId, revieweeId, ...reviewData } = req.body;
      const validatedData = createReviewSchema.parse(reviewData);
      
      // Verify booking exists and reviewer is authorized
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      if (booking.customerId !== reviewerId && booking.providerId !== revieweeId) {
        return res.status(403).json({ error: "Not authorized to review this booking" });
      }
      
      const review = await storage.createReview(bookingId, reviewerId, revieweeId, validatedData);
      
      // Create notification for reviewee
      await storage.createNotification({
        userId: revieweeId,
        type: 'review-received',
        title: 'New Review Received',
        message: `You received a ${review.rating}-star review for your service.`,
        data: { reviewId: review.id, bookingId },
        read: false
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Respond to review
  app.post("/api/reviews/:id/respond", async (req, res) => {
    try {
      const { response } = req.body;
      
      if (!response || response.trim().length === 0) {
        return res.status(400).json({ error: "Response is required" });
      }
      
      const review = await storage.respondToReview(req.params.id, response);
      res.json(review);
    } catch (error) {
      console.error('Error responding to review:', error);
      res.status(500).json({ error: "Failed to respond to review" });
    }
  });

  // ============================================================================
  // NOTIFICATION ENDPOINTS
  // ============================================================================

  // Get notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { unreadOnly } = req.query;
      const notifications = await storage.getNotifications(
        req.params.userId,
        unreadOnly === 'true'
      );
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // ============================================================================
  // ANALYTICS & DASHBOARD ENDPOINTS
  // ============================================================================

  // Get platform statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      res.status(500).json({ error: "Failed to get platform statistics" });
    }
  });

  // Get provider earnings
  app.get("/api/providers/:id/earnings", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const earnings = await storage.getProviderEarnings(
        req.params.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json({ earnings });
    } catch (error) {
      console.error('Error fetching provider earnings:', error);
      res.status(500).json({ error: "Failed to get provider earnings" });
    }
  });

  // Get customer booking history
  app.get("/api/customers/:id/history", async (req, res) => {
    try {
      const bookings = await storage.getCustomerBookingHistory(req.params.id);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching customer history:', error);
      res.status(500).json({ error: "Failed to get customer booking history" });
    }
  });

  // ============================================================================
  // SEARCH & MATCHING ENDPOINTS
  // ============================================================================

  // Search providers for a booking
  app.post("/api/search/providers", async (req, res) => {
    try {
      const { serviceId, location, date, time, budget } = req.body;
      
      // Basic matching logic - in production, this would be more sophisticated
      let providers = await storage.getProviders({ 
        serviceId, 
        location, 
        verified: true 
      });
      
      // Filter by budget if provided
      if (budget) {
        providers = providers.filter(p => 
          p.hourlyRates[serviceId] && p.hourlyRates[serviceId] <= budget
        );
      }
      
      // Sort by rating and response time
      providers.sort((a, b) => {
        if (a.rating !== b.rating) return b.rating - a.rating;
        return a.responseTime - b.responseTime;
      });
      
      // Limit to top 10 matches
      providers = providers.slice(0, 10);
      
      // Enrich with user data
      const enrichedProviders = await Promise.all(
        providers.map(async (provider) => {
          const user = await storage.getUserById(provider.userId);
          const reviews = await storage.getReviews({ revieweeId: provider.id });
          
          return {
            ...provider,
            user: user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              profileImage: user.profileImage
            } : null,
            recentReviews: reviews.slice(0, 3)
          };
        })
      );
      
      res.json(enrichedProviders);
    } catch (error) {
      console.error('Error searching providers:', error);
      res.status(500).json({ error: "Failed to search providers" });
    }
  });

  // ============================================================================
  // MISC ENDPOINTS
  // ============================================================================

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}