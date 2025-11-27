import type { Express } from "express";
import { customerReviews, bookings, users, serviceProviders, insertCustomerReviewSchema } from "@shared/schema";
import { authenticateToken } from "./auth-routes";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export function registerCustomerReviewRoutes(app: Express) {
  // Submit customer review (provider rating customer)
  app.post('/api/customer-reviews', authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertCustomerReviewSchema.parse(req.body);
      
      // Verify the provider is the one who worked on this booking
      const booking = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.id, validatedData.bookingId),
            eq(bookings.providerId, validatedData.providerId)
          )
        )
        .limit(1);

      if (!booking.length) {
        return res.status(404).json({ message: "Booking not found or you're not authorized to review this customer" });
      }

      // Check if review already exists
      const existingReview = await db
        .select()
        .from(customerReviews)
        .where(
          and(
            eq(customerReviews.bookingId, validatedData.bookingId),
            eq(customerReviews.providerId, validatedData.providerId)
          )
        )
        .limit(1);

      if (existingReview.length > 0) {
        return res.status(409).json({ message: "Review already submitted for this booking" });
      }

      // Create the review
      const newReview = await db
        .insert(customerReviews)
        .values(validatedData)
        .returning();

      res.status(201).json({
        message: "Customer review submitted successfully",
        review: newReview[0]
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid review data", 
          errors: error.errors 
        });
      }
      console.error('Customer review submission error:', error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Get customer reviews for a specific customer
  app.get('/api/customers/:customerId/reviews', authenticateToken, async (req: any, res) => {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 10, includePrivate = false } = req.query;
      
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get reviews with provider and booking details
      const reviews = await db
        .select({
          id: customerReviews.id,
          rating: customerReviews.rating,
          communication: customerReviews.communication,
          courtesy: customerReviews.courtesy,
          cleanliness: customerReviews.cleanliness,
          accessibility: customerReviews.accessibility,
          instructions: customerReviews.instructions,
          comment: customerReviews.comment,
          wouldWorkAgain: customerReviews.wouldWorkAgain,
          isPrivate: customerReviews.isPrivate,
          createdAt: customerReviews.createdAt,
          booking: {
            id: bookings.id,
            bookingNumber: bookings.bookingNumber,
            serviceType: bookings.serviceType,
            scheduledDate: bookings.scheduledDate,
          },
          provider: {
            id: serviceProviders.id,
            firstName: serviceProviders.firstName,
            lastName: serviceProviders.lastName,
            profileImage: serviceProviders.profileImage,
          }
        })
        .from(customerReviews)
        .leftJoin(bookings, eq(customerReviews.bookingId, bookings.id))
        .leftJoin(serviceProviders, eq(customerReviews.providerId, serviceProviders.id))
        .where(
          and(
            eq(customerReviews.customerId, customerId),
            includePrivate === 'true' ? undefined : eq(customerReviews.isPrivate, false)
          )
        )
        .orderBy(desc(customerReviews.createdAt))
        .limit(parseInt(limit))
        .offset(offset);

      // Get total count for pagination
      const totalCountResult = await db
        .select({ count: customerReviews.id })
        .from(customerReviews)
        .where(
          and(
            eq(customerReviews.customerId, customerId),
            includePrivate === 'true' ? undefined : eq(customerReviews.isPrivate, false)
          )
        );

      // Calculate average ratings
      const avgRatings = (reviews as any[]).reduce((acc: { overall: number; communication: number; courtesy: number; cleanliness: number; accessibility: number; instructions: number }, review: any) => {
        return {
          overall: acc.overall + review.rating,
          communication: acc.communication + (review.communication || 0),
          courtesy: acc.courtesy + (review.courtesy || 0),
          cleanliness: acc.cleanliness + (review.cleanliness || 0),
          accessibility: acc.accessibility + (review.accessibility || 0),
          instructions: acc.instructions + (review.instructions || 0),
        };
      }, {
        overall: 0,
        communication: 0,
        courtesy: 0,
        cleanliness: 0,
        accessibility: 0,
        instructions: 0,
      });

      const reviewCount = reviews.length;
      if (reviewCount > 0) {
        Object.keys(avgRatings).forEach(key => {
          avgRatings[key as keyof typeof avgRatings] = 
            Math.round((avgRatings[key as keyof typeof avgRatings] / reviewCount) * 10) / 10;
        });
      }

      res.json({
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCountResult.length,
          pages: Math.ceil(totalCountResult.length / parseInt(limit))
        },
        averageRatings: avgRatings,
        totalReviews: reviewCount
      });
    } catch (error) {
      console.error('Get customer reviews error:', error);
      res.status(500).json({ message: "Failed to fetch customer reviews" });
    }
  });

  // Get reviews made by a specific provider
  app.get('/api/providers/:providerId/customer-reviews', authenticateToken, async (req: any, res) => {
    try {
      const { providerId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const reviews = await db
        .select({
          id: customerReviews.id,
          rating: customerReviews.rating,
          communication: customerReviews.communication,
          courtesy: customerReviews.courtesy,
          cleanliness: customerReviews.cleanliness,
          accessibility: customerReviews.accessibility,
          instructions: customerReviews.instructions,
          comment: customerReviews.comment,
          wouldWorkAgain: customerReviews.wouldWorkAgain,
          isPrivate: customerReviews.isPrivate,
          createdAt: customerReviews.createdAt,
          booking: {
            id: bookings.id,
            bookingNumber: bookings.bookingNumber,
            serviceType: bookings.serviceType,
            scheduledDate: bookings.scheduledDate,
          },
          customer: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImage: users.profileImage,
          }
        })
        .from(customerReviews)
        .leftJoin(bookings, eq(customerReviews.bookingId, bookings.id))
        .leftJoin(users, eq(customerReviews.customerId, users.id))
        .where(eq(customerReviews.providerId, providerId))
        .orderBy(desc(customerReviews.createdAt))
        .limit(parseInt(limit))
        .offset(offset);

      const totalCountResult = await db
        .select({ count: customerReviews.id })
        .from(customerReviews)
        .where(eq(customerReviews.providerId, providerId));

      res.json({
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCountResult.length,
          pages: Math.ceil(totalCountResult.length / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get provider customer reviews error:', error);
      res.status(500).json({ message: "Failed to fetch provider customer reviews" });
    }
  });

  // Update customer review (only by the provider who created it)
  app.put('/api/customer-reviews/:reviewId', authenticateToken, async (req: any, res) => {
    try {
      const { reviewId } = req.params;
      const updateData = req.body;

      // Verify the review exists and belongs to the authenticated provider
      const existingReview = await db
        .select()
        .from(customerReviews)
        .where(eq(customerReviews.id, reviewId))
        .limit(1);

      if (!existingReview.length) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Update the review
      const updatedReview = await db
        .update(customerReviews)
        .set({
          ...updateData,
          // Prevent changing core identifiers
          id: existingReview[0].id,
          bookingId: existingReview[0].bookingId,
          customerId: existingReview[0].customerId,
          providerId: existingReview[0].providerId,
        })
        .where(eq(customerReviews.id, reviewId))
        .returning();

      res.json({
        message: "Review updated successfully",
        review: updatedReview[0]
      });
    } catch (error) {
      console.error('Update customer review error:', error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Delete customer review (only by the provider who created it)
  app.delete('/api/customer-reviews/:reviewId', authenticateToken, async (req: any, res) => {
    try {
      const { reviewId } = req.params;

      // Verify the review exists
      const existingReview = await db
        .select()
        .from(customerReviews)
        .where(eq(customerReviews.id, reviewId))
        .limit(1);

      if (!existingReview.length) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Delete the review
      await db
        .delete(customerReviews)
        .where(eq(customerReviews.id, reviewId));

      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error('Delete customer review error:', error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });
}
