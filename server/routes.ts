import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { registerTrainingRoutes } from "./training-routes";
import { registerAuthRoutes } from "./auth-routes";
import { registerPaymentRoutes } from "./payment-routes";
import { registerPushNotificationRoutes } from "./push-notification-routes";
import { registerCustomerReviewRoutes } from "./customer-review-routes";
import { storage } from "./storage";
import { LocationService } from "./location-service";
import { 
  insertUserSchema, 
  insertServiceProviderSchema, 
  insertBookingSchema, 
  insertReviewSchema, 
  insertPaymentMethodSchema,
  insertTrainingModuleSchema,
  insertProviderTrainingProgressSchema,
  insertCertificationSchema,
  insertProviderCertificationSchema,
  insertSkillAssessmentSchema,
  insertProviderAssessmentResultSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user profile
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { firstName, lastName, email, phone, province, city, address } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }
      
      // Check if user exists, if not create them first
      let user = await storage.getUser(userId);
      if (!user) {
        // Create new user with the provided ID
        user = await storage.createUser({
          id: userId,
          firstName,
          lastName,
          email,
          phone,
          province,
          city,
          address
        });
        
        res.json({ 
          message: "Profile created successfully", 
          user: user 
        });
      } else {
        // Update existing user
        const updatedUser = await storage.updateUser(userId, {
          firstName,
          lastName,
          email,
          phone,
          province,
          city,
          address,
          updatedAt: new Date()
        });
        
        res.json({ 
          message: "Profile updated successfully", 
          user: updatedUser 
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/category/:category", async (req, res) => {
    try {
      const services = await storage.getServicesByCategory(req.params.category);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service Provider routes with location-based matching
  app.get("/api/providers", async (req, res) => {
    try {
      const serviceCategory = req.query.service as string;
      const latitude = req.query.latitude ? parseFloat(req.query.latitude as string) : null;
      const longitude = req.query.longitude ? parseFloat(req.query.longitude as string) : null;
      const maxRadius = req.query.radius ? parseInt(req.query.radius as string) : 20;
      
      let providers;
      
      // If location is provided, use location-based matching
      if (latitude && longitude && serviceCategory) {
        try {
          const nearbyProviders = await LocationService.findNearbyProviders(
            { latitude, longitude },
            serviceCategory,
            maxRadius
          );
          
          // Return top 3 rated providers within radius
          providers = nearbyProviders
            .slice(0, 3)
            .map(provider => provider ? ({
              ...provider,
              distance: `${provider.distance?.toFixed(1)}km away`,
              isNearby: true
            }) : null)
            .filter(provider => provider !== null);
            
        } catch (locationError) {
          console.error("Location service error:", locationError);
          // Fallback to regular provider search
          providers = await storage.getServiceProvidersByService(serviceCategory);
          providers = providers.slice(0, 3); // Still limit to top 3
        }
      } else if (serviceCategory) {
        providers = await storage.getServiceProvidersByService(serviceCategory);
        providers = providers.slice(0, 3); // Limit to top 3 rated
      } else {
        // Get all providers by getting all service categories
        const allProviders = await Promise.all([
          storage.getServiceProvidersByService("house-cleaning"),
          storage.getServiceProvidersByService("deep-cleaning"),
          storage.getServiceProvidersByService("maintenance"),
          storage.getServiceProvidersByService("gardening"),
          storage.getServiceProvidersByService("home-moving")
        ]);
        providers = allProviders.flat();
        // Remove duplicates and limit to top providers
        providers = providers
          .filter((provider, index, self) => 
            index === self.findIndex(p => p.id === provider.id)
          )
          .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
          .slice(0, 3);
      }
      
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getServiceProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      res.json(provider);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/providers", async (req, res) => {
    try {
      const providerData = insertServiceProviderSchema.parse(req.body);
      const provider = await storage.createServiceProvider(providerData);
      res.json(provider);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Service-specific providers endpoint
  app.get("/api/providers/service/:category", async (req, res) => {
    try {
      const providers = await storage.getServiceProvidersByService(req.params.category);
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Location Tracking Routes
  
  // Update provider location (for providers to share their real-time location)
  app.post("/api/providers/:id/location", async (req, res) => {
    try {
      const { latitude, longitude, isOnline = true } = req.body;
      const providerId = req.params.id;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const location = await LocationService.updateProviderLocation(
        providerId,
        { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        isOnline
      );
      
      res.json({ message: "Location updated successfully", location });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get provider's current location (for customers to track provider)
  app.get("/api/providers/:id/location", async (req, res) => {
    try {
      const providerId = req.params.id;
      const location = await LocationService.getProviderLocation(providerId);
      
      if (!location) {
        return res.status(404).json({ message: "Provider location not found" });
      }
      
      res.json(location);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Set provider online/offline status
  app.put("/api/providers/:id/status", async (req, res) => {
    try {
      const { isOnline } = req.body;
      const providerId = req.params.id;
      
      await LocationService.setProviderOnlineStatus(providerId, isOnline);
      
      res.json({ message: `Provider status updated to ${isOnline ? 'online' : 'offline'}` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get live tracking information for a booking
  app.get("/api/bookings/:id/tracking", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (!booking.providerId) {
        return res.json({ message: "No provider assigned yet", tracking: null });
      }
      
      const providerLocation = await LocationService.getProviderLocation(booking.providerId);
      const provider = await storage.getServiceProvider(booking.providerId);
      
      if (!providerLocation) {
        return res.json({ message: "Provider location not available", tracking: null });
      }
      
      const trackingInfo = {
        booking: {
          id: booking.id,
          status: booking.status,
          customerAddress: booking.customerAddress
        },
        provider: {
          id: provider?.id,
          name: `${provider?.firstName} ${provider?.lastName}`,
          phone: provider?.phoneNumber,
          rating: provider?.rating
        },
        location: {
          latitude: providerLocation.latitude,
          longitude: providerLocation.longitude,
          isOnline: providerLocation.isOnline,
          lastSeen: providerLocation.lastSeen
        },
        estimatedArrival: providerLocation.isOnline ? "Calculating..." : "Provider offline"
      };
      
      res.json({ tracking: trackingInfo });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Set provider enroute status for a specific booking
  app.post("/api/bookings/:id/enroute", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const { providerId, latitude, longitude } = req.body;
      
      // Update provider location
      if (latitude && longitude) {
        await LocationService.updateProviderLocation(
          providerId,
          { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
          true
        );
      }
      
      // Update booking status to enroute
      await storage.updateBooking(bookingId, { status: 'enroute' });
      
      // TODO: Send push notification to customer
      // This will be implemented when we integrate with push notification system
      
      res.json({ message: "Provider enroute status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/bookings/customer/:customerId", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByCustomer(req.params.customerId);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/provider/:providerId", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByProvider(req.params.providerId);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      
      // Update provider rating
      const reviews = await storage.getReviewsByProvider(reviewData.providerId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await storage.updateServiceProviderRating(
        reviewData.providerId, 
        averageRating, 
        reviews.length
      );
      
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/provider/:providerId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProvider(req.params.providerId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment method routes
  app.get("/api/payment-methods", async (req, res) => {
    try {
      // In a real app, get userId from session/auth
      const userId = req.query.userId as string || "user-1"; 
      const paymentMethods = await storage.getPaymentMethodsByUser(userId);
      res.json(paymentMethods);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      // In a real app, get userId from session/auth
      const userId = req.body.userId || "user-1";
      const paymentMethodData = insertPaymentMethodSchema.parse({
        ...req.body,
        userId
      });
      const paymentMethod = await storage.createPaymentMethod(paymentMethodData);
      res.json(paymentMethod);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      await storage.deletePaymentMethod(req.params.id);
      res.json({ message: "Payment method deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Training system routes
  app.get("/api/training/modules", async (req, res) => {
    try {
      const serviceType = req.query.serviceType as string;
      let modules;
      
      if (serviceType) {
        modules = await storage.getTrainingModulesByService(serviceType);
      } else {
        modules = await storage.getAllTrainingModules();
      }
      
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/training/progress/:providerId", async (req, res) => {
    try {
      const progress = await storage.getProviderTrainingProgress(req.params.providerId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/training/progress", async (req, res) => {
    try {
      const progressData = insertProviderTrainingProgressSchema.parse(req.body);
      const progress = await storage.createTrainingProgress(progressData);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/training/progress/:id", async (req, res) => {
    try {
      const progress = await storage.updateTrainingProgress(req.params.id, req.body);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Certification routes
  app.get("/api/certifications", async (req, res) => {
    try {
      const serviceType = req.query.serviceType as string;
      let certifications;
      
      if (serviceType) {
        certifications = await storage.getCertificationsByService(serviceType);
      } else {
        certifications = await storage.getAllCertifications();
      }
      
      res.json(certifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/certifications/provider/:providerId", async (req, res) => {
    try {
      const certifications = await storage.getProviderCertifications(req.params.providerId);
      res.json(certifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/certifications/provider", async (req, res) => {
    try {
      const certificationData = insertProviderCertificationSchema.parse(req.body);
      const certification = await storage.createProviderCertification(certificationData);
      res.json(certification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Assessment routes
  app.get("/api/assessments", async (req, res) => {
    try {
      const serviceType = req.query.serviceType as string;
      if (!serviceType) {
        return res.status(400).json({ message: "serviceType is required" });
      }
      
      const assessments = await storage.getSkillAssessments(serviceType);
      res.json(assessments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assessments/results/:providerId", async (req, res) => {
    try {
      const results = await storage.getProviderAssessmentResults(req.params.providerId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments/results", async (req, res) => {
    try {
      const resultData = insertProviderAssessmentResultSchema.parse(req.body);
      const result = await storage.createAssessmentResult(resultData);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment method routes
  app.get("/api/payment-methods/:userId", async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethodsByUser(req.params.userId);
      res.json(paymentMethods);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      const paymentData = insertPaymentMethodSchema.parse(req.body);
      const paymentMethod = await storage.createPaymentMethod(paymentData);
      res.json(paymentMethod);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Location-based provider search endpoint
  app.post("/api/providers/nearby", async (req, res) => {
    try {
      const { latitude, longitude, serviceType, radius = 20 } = req.body;
      
      if (!latitude || !longitude || !serviceType) {
        return res.status(400).json({ 
          message: "Latitude, longitude, and serviceType are required" 
        });
      }
      
      const nearbyProviders = await LocationService.findNearbyProviders(
        { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        serviceType,
        parseInt(radius)
      );
      
      // Return top 3 providers with distance info
      const topProviders = nearbyProviders.slice(0, 3).map(provider => provider ? ({
        ...provider,
        distanceText: provider.distance ? `${provider.distance.toFixed(1)}km away` : 'Distance unknown',
        isNearby: true
      }) : null).filter(provider => provider !== null);
      
      res.json(topProviders);
    } catch (error: any) {
      console.error("Nearby providers error:", error);
      res.status(500).json({ message: "Error finding nearby providers" });
    }
  });

  // Payment processing endpoint
  app.post("/api/payments/process", async (req, res) => {
    try {
      const { 
        bookingId, 
        amount, 
        cardNumber, 
        expiryDate, 
        cvv, 
        cardholderName,
        paymentMethod = "card"
      } = req.body;
      
      // Basic validation
      if (!bookingId || !amount || (paymentMethod === "card" && (!cardNumber || !expiryDate || !cvv))) {
        return res.status(400).json({ message: "Missing required payment information" });
      }
      
      // Simulate payment processing
      const paymentResult = {
        success: true,
        transactionId: `txn_${Date.now()}`,
        amount: parseFloat(amount),
        bookingId,
        paymentMethod,
        timestamp: new Date().toISOString(),
        maskedCard: paymentMethod === "card" ? `****-****-****-${cardNumber.slice(-4)}` : null
      };
      
      res.json(paymentResult);
      
    } catch (error: any) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // Additional training system routes for comprehensive functionality
  app.get("/api/providers/:providerId/training/modules/:moduleId/progress", async (req, res) => {
    try {
      const progress = await storage.getProviderModuleProgress?.(req.params.providerId, req.params.moduleId);
      if (!progress) {
        return res.status(404).json({ error: "Progress not found" });
      }
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch module progress" });
    }
  });

  app.post("/api/certifications/:certificationId/validate", async (req, res) => {
    try {
      const { providerId, requiredModules } = req.body;
      
      // Check if provider has completed all required modules
      const progress = await storage.getProviderTrainingProgress(providerId);
      const completedModules = progress
        .filter(p => p.status === 'completed')
        .map(p => p.moduleId);
      
      const hasAllRequirements = requiredModules.every((moduleId: string) => 
        completedModules.includes(moduleId)
      );
      
      if (hasAllRequirements) {
        // Award the certification
        const certificationData = {
          providerId,
          certificationId: req.params.certificationId,
          status: 'earned' as const,
          earnedAt: new Date(),
          expiresAt: new Date(Date.now() + (12 * 30 * 24 * 60 * 60 * 1000)), // 12 months
          certificateNumber: `CERT_${Date.now()}`,
          verificationCode: `VER_${Date.now().toString().slice(-6)}`
        };
        
        const certification = await storage.createProviderCertification(certificationData);
        res.json({ awarded: true, certification });
      } else {
        const missingModules = requiredModules.filter((moduleId: string) => 
          !completedModules.includes(moduleId)
        );
        res.json({ awarded: false, missingModules });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to validate certification requirements" });
    }
  });

  // Push notification subscription routes
  app.post("/api/push-subscriptions", async (req, res) => {
    try {
      const subscription = req.body;
      
      // In production, store subscription in database
      // For now, just acknowledge the subscription
      console.log('Push subscription received:', subscription);
      
      res.status(201).json({ 
        message: "Push subscription registered successfully",
        subscriptionId: Date.now() // Mock ID
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to register push subscription" });
    }
  });

  app.delete("/api/push-subscriptions", async (req, res) => {
    try {
      const subscription = req.body;
      
      // In production, remove subscription from database
      console.log('Push subscription removed:', subscription);
      
      res.json({ message: "Push subscription removed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to remove push subscription" });
    }
  });

  // Test notification endpoint
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const { subscription } = req.body;
      
      // In production, you would use web-push library to send actual push notifications
      // For now, just simulate sending a notification
      console.log('Test notification requested for subscription:', subscription?.endpoint);
      
      res.json({ 
        message: "Test notification sent",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Recommendation Engine API routes
  app.get("/api/recommendations/preferences/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Mock user preferences - in production, get from database
      const mockPreferences = {
        preferredServices: ["house-cleaning", "chef-catering"],
        budgetRange: { min: 200, max: 1000 },
        locationRadius: 15,
        preferredTimes: ["morning", "afternoon"],
        serviceFrequency: {
          "house-cleaning": "weekly",
          "chef-catering": "monthly"
        },
        providerPreferences: {
          minRating: 4.5,
          experienceLevel: "experienced",
          language: ["english", "afrikaans"]
        },
        bookingHistory: [
          {
            serviceType: "house-cleaning",
            providerId: "provider-1",
            rating: 5,
            date: "2025-08-15"
          }
        ]
      };
      
      res.json(mockPreferences);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get user preferences" });
    }
  });

  app.put("/api/recommendations/preferences/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const preferences = req.body;
      
      // In production, save to database
      console.log(`Preferences updated for user ${userId}:`, preferences);
      
      res.json({ 
        message: "Preferences updated successfully",
        preferences 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const { userId, preferences, includePromoted } = req.body;
      
      // Smart recommendation algorithm
      const mockRecommendations = [
        {
          id: "rec-1",
          serviceName: "Deep House Cleaning",
          provider: {
            id: "provider-1",
            name: "Nomsa Mbeki",
            rating: 4.8,
            specialties: ["deep-cleaning", "eco-friendly"],
            distance: 2.3
          },
          matchScore: 94,
          reasons: ["High rating match", "Within budget", "Previous positive experience"],
          estimatedPrice: 420,
          availability: ["Tomorrow 9:00", "Thursday 14:00", "Friday 10:00"],
          isPromoted: false
        },
        {
          id: "rec-2",
          serviceName: "Traditional African Catering",
          provider: {
            id: "provider-2", 
            name: "Chef Thabo Mthembu",
            rating: 4.9,
            specialties: ["traditional-cuisine", "braai-specialist"],
            distance: 5.7
          },
          matchScore: 88,
          reasons: ["African cuisine preference", "High ratings", "Event specialist"],
          estimatedPrice: 1650,
          availability: ["Weekend available", "Next week slots"],
          isPromoted: true
        },
        {
          id: "rec-3",
          serviceName: "Garden Maintenance",
          provider: {
            id: "provider-3",
            name: "Green Thumb Services",
            rating: 4.6,
            specialties: ["landscaping", "indigenous-plants"],
            distance: 8.2
          },
          matchScore: 76,
          reasons: ["Seasonal demand", "Local expertise", "Eco-friendly approach"],
          estimatedPrice: 580,
          availability: ["This weekend", "Weekly slots"],
          isPromoted: false
        }
      ];

      // Filter based on user preferences
      let filteredRecommendations = mockRecommendations;
      
      if (preferences?.budgetRange) {
        filteredRecommendations = filteredRecommendations.filter(rec => 
          rec.estimatedPrice >= preferences.budgetRange.min && 
          rec.estimatedPrice <= preferences.budgetRange.max
        );
      }

      if (preferences?.providerPreferences?.minRating) {
        filteredRecommendations = filteredRecommendations.filter(rec => 
          rec.provider.rating >= preferences.providerPreferences.minRating
        );
      }

      // Sort by match score
      filteredRecommendations.sort((a, b) => b.matchScore - a.matchScore);
      
      res.json(filteredRecommendations);
    } catch (error: any) {
      console.error("Recommendation generation error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.post("/api/recommendations/contextual", async (req, res) => {
    try {
      const { timeOfDay, dayOfWeek, weather, location, previousSearches } = req.body;
      
      // Contextual suggestions based on time and context
      const contextualSuggestions = [];
      
      if (timeOfDay === 'morning' && (dayOfWeek === 'saturday' || dayOfWeek === 'sunday')) {
        contextualSuggestions.push({
          id: 'ctx-1',
          serviceName: 'Weekend House Cleaning',
          contextReason: 'Perfect time for deep cleaning',
          provider: { id: 'provider-1', name: 'Weekend Cleaning Pro' }
        });
      }
      
      if (dayOfWeek === 'friday' || dayOfWeek === 'saturday') {
        contextualSuggestions.push({
          id: 'ctx-2',
          serviceName: 'Weekend Braai Catering',
          contextReason: 'Weekend braai season',
          provider: { id: 'provider-2', name: 'Braai Master Chef' }
        });
      }

      if (timeOfDay === 'afternoon') {
        contextualSuggestions.push({
          id: 'ctx-3',
          serviceName: 'Garden Watering Service',
          contextReason: 'Best time for garden care',
          provider: { id: 'provider-3', name: 'Garden Care Experts' }
        });
      }
      
      res.json(contextualSuggestions);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get contextual suggestions" });
    }
  });

  app.post("/api/recommendations/track", async (req, res) => {
    try {
      const { userId, interactionType, recommendationId, timestamp, ...additionalData } = req.body;
      
      // In production, save interaction to database for ML learning
      console.log(`User ${userId} ${interactionType} recommendation ${recommendationId} at ${timestamp}`);
      
      res.json({ message: "Interaction tracked successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to track interaction" });
    }
  });

  // Notification preferences routes
  app.get("/api/users/:userId/notification-preferences", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // In production, get from database
      const defaultPreferences = {
        bookingConfirmations: true,
        providerUpdates: true,
        paymentAlerts: true,
        reviewReminders: true,
        promotions: false,
        maintenanceUpdates: false
      };
      
      res.json(defaultPreferences);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get notification preferences" });
    }
  });

  app.put("/api/users/:userId/notification-preferences", async (req, res) => {
    try {
      const userId = req.params.userId;
      const preferences = req.body;
      
      // In production, save to database
      console.log(`Notification preferences updated for user ${userId}:`, preferences);
      
      res.json({ 
        message: "Notification preferences updated successfully",
        preferences 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Register authentication routes
  registerAuthRoutes(app);

  // Register payment routes  
  registerPaymentRoutes(app);

  // Register training center routes
  registerTrainingRoutes(app);
  
  // Register push notification routes
  registerPushNotificationRoutes(app);
  
  // Register customer review routes
  registerCustomerReviewRoutes(app);

  const httpServer = createServer(app);

  // WebSocket server for real-time tracking updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections for tracking
  const trackingConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe_tracking' && data.bookingId) {
          // Subscribe to tracking updates for a specific booking
          if (!trackingConnections.has(data.bookingId)) {
            trackingConnections.set(data.bookingId, new Set());
          }
          trackingConnections.get(data.bookingId)?.add(ws);
          console.log(`Client subscribed to tracking for booking: ${data.bookingId}`);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    });

    ws.on('close', () => {
      // Remove this connection from all tracking subscriptions
      trackingConnections.forEach((connections) => {
        connections.delete(ws);
      });
      console.log('WebSocket connection closed');
    });
  });

  // Function to broadcast tracking updates
  const broadcastTrackingUpdate = (bookingId: string, trackingData: any) => {
    const connections = trackingConnections.get(bookingId);
    if (connections) {
      const message = JSON.stringify({
        type: 'tracking_update',
        bookingId,
        data: trackingData
      });
      
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  };

  // Enhance location update endpoint to broadcast WebSocket updates
  const originalUpdateLocation = app._router.stack.find((layer: any) => 
    layer.route && layer.route.path === '/api/providers/:id/location' && layer.route.methods.post
  );

  return httpServer;
}
