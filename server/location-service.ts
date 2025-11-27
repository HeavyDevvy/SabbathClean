import { db } from "./db";
import { storage } from "./storage";
import { serviceProviders, providerLocations, jobQueue, bookings } from "../shared/schema";
import { eq, and, sql, asc, desc } from "drizzle-orm";

interface LocationPoint {
  latitude: number;
  longitude: number;
}

export class LocationService {
  // Calculate distance between two points using Haversine formula
  static calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Find available providers within radius, sorted by distance and rating
  static async findNearbyProviders(
    customerLocation: LocationPoint,
    serviceType: string,
    maxRadius: number = 20
  ) {
    // Get all providers who offer the requested service
    const availableProviders = await db
      .select({
        id: serviceProviders.id,
        userId: serviceProviders.userId,
        firstName: serviceProviders.firstName,
        lastName: serviceProviders.lastName,
        hourlyRate: serviceProviders.hourlyRate,
        rating: serviceProviders.rating,
        totalReviews: serviceProviders.totalReviews,
        servicesOffered: serviceProviders.servicesOffered,
        latitude: providerLocations.latitude,
        longitude: providerLocations.longitude,
        isOnline: providerLocations.isOnline,
        lastSeen: providerLocations.lastSeen,
      })
      .from(serviceProviders)
      .leftJoin(providerLocations, eq(serviceProviders.id, providerLocations.providerId))
      .where(
        and(
          sql`${serviceProviders.servicesOffered} && ARRAY[${serviceType}]`,
          eq(serviceProviders.isVerified, true),
          eq(providerLocations.isOnline, true)
        )
      );

    // Calculate distances and filter by radius
    const providersWithDistance = availableProviders
      .map((provider: any) => {
        if (!provider.latitude || !provider.longitude) return null;
        
        const distance = this.calculateDistance(
          customerLocation,
          { latitude: provider.latitude, longitude: provider.longitude }
        );
        
        return {
          ...provider,
          distance,
        };
      })
      .filter((provider: any) => provider !== null && provider.distance <= maxRadius)
      .sort((a: any, b: any) => {
        // Sort by a combination of distance (30%) and rating (70%)
        const scoreA = (Number(a?.rating) || 0) * 0.7 - ((a?.distance || 0) * 0.3);
        const scoreB = (Number(b?.rating) || 0) * 0.7 - ((b?.distance || 0) * 0.3);
        return scoreB - scoreA;
      });

    return providersWithDistance;
  }

  // Add a booking to the job queue for automatic allocation
  static async addToJobQueue(
    bookingId: string,
    serviceType: string,
    customerLocation: LocationPoint,
    priority: number = 1,
    maxRadius: number = 20
  ) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Jobs expire after 30 minutes

    const [queueItem] = await db.insert(jobQueue).values({
      bookingId,
      serviceType,
      customerLatitude: Number(customerLocation.latitude),
      customerLongitude: Number(customerLocation.longitude),
      maxRadius,
      priority,
      expiresAt,
    }).returning();

    return queueItem;
  }

  // Process job queue and automatically assign providers
  static async processJobQueue() {
    // Get pending jobs ordered by priority and creation time
    const pendingJobs = await db
      .select()
      .from(jobQueue)
      .where(
        and(
          eq(jobQueue.status, 'pending'),
          sql`${jobQueue.expiresAt} > NOW()`
        )
      )
      .orderBy(desc(jobQueue.priority), asc(jobQueue.createdAt));

    for (const job of pendingJobs) {
      try {
        const customerLocation = {
          latitude: job.customerLatitude,
          longitude: job.customerLongitude,
        };

        const nearbyProviders = await this.findNearbyProviders(
          customerLocation,
          job.serviceType,
          job.maxRadius || 20
        );

        if (nearbyProviders.length > 0) {
          // Assign to the best-rated, closest provider
          const selectedProvider = nearbyProviders[0];
          
          if (selectedProvider) {
            // Update job queue with assigned provider
            await db
              .update(jobQueue)
              .set({
                status: 'assigned',
                assignedProviderId: selectedProvider.id,
              })
              .where(eq(jobQueue.id, job.id));

            // Update booking with assigned provider
            await db
              .update(bookings)
              .set({
                providerId: selectedProvider.id,
                status: 'confirmed',
              })
              .where(eq(bookings.id, job.bookingId));

            console.log(`Job ${job.id} assigned to provider ${selectedProvider.id}`);
          }
        } else {
          // No providers available, could expand radius or mark as unassigned
          console.log(`No providers available for job ${job.id}`);
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
      }
    }
  }

  // Update provider location
  static async updateProviderLocation(
    providerId: string,
    location: LocationPoint,
    isOnline: boolean = true
  ) {
    if (process.env.USE_MEM_STORAGE === '1') {
      return await storage.updateProviderLocation({
        providerId,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        isOnline,
      } as any);
    }
    const [existingLocation] = await db
      .select()
      .from(providerLocations)
      .where(eq(providerLocations.providerId, providerId));
    if (existingLocation) {
      return await db
        .update(providerLocations)
        .set({
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          isOnline,
          lastSeen: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(providerLocations.providerId, providerId))
        .returning();
    }
    return await db
      .insert(providerLocations)
      .values({
        providerId,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        isOnline,
      })
      .returning();
  }

  // Get provider's current location
  static async getProviderLocation(providerId: string) {
    if (process.env.USE_MEM_STORAGE === '1') {
      return await storage.getProviderLocation(providerId);
    }
    const [location] = await db
      .select()
      .from(providerLocations)
      .where(eq(providerLocations.providerId, providerId));
    return location;
  }

  // Set provider online/offline status
  static async setProviderOnlineStatus(providerId: string, isOnline: boolean) {
    if (process.env.USE_MEM_STORAGE === '1') {
      const existing = await storage.getProviderLocation(providerId);
      const latitude = Number(existing?.latitude || 0);
      const longitude = Number(existing?.longitude || 0);
      await storage.updateProviderLocation({
        providerId,
        latitude,
        longitude,
        isOnline,
      } as any);
      return;
    }
    await db
      .update(providerLocations)
      .set({
        isOnline,
        lastSeen: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(providerLocations.providerId, providerId));
  }
}
