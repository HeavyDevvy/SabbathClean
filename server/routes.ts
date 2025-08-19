import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertServiceProviderSchema, insertBookingSchema, insertReviewSchema, insertPaymentMethodSchema } from "@shared/schema";

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

  // Service Provider routes
  app.get("/api/providers", async (req, res) => {
    try {
      const serviceCategory = req.query.service as string;
      let providers;
      
      if (serviceCategory) {
        providers = await storage.getServiceProvidersByService(serviceCategory);
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
        // Remove duplicates
        providers = providers.filter((provider, index, self) => 
          index === self.findIndex(p => p.id === provider.id)
        );
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

  const httpServer = createServer(app);
  return httpServer;
}
