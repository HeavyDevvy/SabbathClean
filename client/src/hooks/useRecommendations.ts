import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface UserPreferences {
  preferredServices: string[];
  budgetRange: { min: number; max: number };
  locationRadius: number;
  preferredTimes: string[];
  serviceFrequency: Record<string, 'once' | 'weekly' | 'monthly' | 'quarterly'>;
  providerPreferences: {
    minRating: number;
    experienceLevel: 'any' | 'beginner' | 'experienced' | 'expert';
    language: string[];
  };
  bookingHistory: {
    serviceType: string;
    providerId: string;
    rating: number;
    date: string;
  }[];
}

export interface ServiceRecommendation {
  id: string;
  serviceName: string;
  provider: {
    id: string;
    name: string;
    rating: number;
    specialties: string[];
    distance?: number;
  };
  matchScore: number;
  reasons: string[];
  estimatedPrice: number;
  availability: string[];
  isPromoted?: boolean;
}

export function useRecommendations(userId?: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Fetch user preferences
  const { data: userPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['/api/recommendations/preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/recommendations/preferences/${userId}`);
      return response.json();
    },
    enabled: !!userId
  });

  // Fetch personalized recommendations
  const { data: recommendations = [], isLoading: recsLoading, refetch: refetchRecommendations } = useQuery({
    queryKey: ['/api/recommendations', userId, preferences],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('POST', `/api/recommendations/generate`, {
        userId,
        preferences: preferences || userPrefs,
        includePromoted: true
      });
      return response.json();
    },
    enabled: !!userId && (!!preferences || !!userPrefs)
  });

  // Update preferences
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!userId) return;
    
    const updatedPrefs = { 
      ...preferences, 
      ...newPreferences 
    } as UserPreferences;
    setPreferences(updatedPrefs);
    
    try {
      await apiRequest('PUT', `/api/recommendations/preferences/${userId}`, updatedPrefs);
      refetchRecommendations();
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  // Track user interaction for learning
  const trackInteraction = async (interactionType: 'view' | 'book' | 'skip' | 'favorite', recommendationId: string, additionalData?: any) => {
    if (!userId) return;
    
    try {
      await apiRequest('POST', '/api/recommendations/track', {
        userId,
        interactionType,
        recommendationId,
        timestamp: new Date().toISOString(),
        ...additionalData
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  useEffect(() => {
    if (userPrefs) {
      setPreferences(userPrefs);
    }
  }, [userPrefs]);

  return {
    preferences,
    recommendations: recommendations as ServiceRecommendation[],
    isLoading: prefsLoading || recsLoading,
    updatePreferences,
    trackInteraction,
    refetchRecommendations
  };
}

// Hook for getting smart service suggestions based on context
export function useContextualSuggestions(context: {
  timeOfDay?: string;
  dayOfWeek?: string;
  weather?: string;
  location?: { lat: number; lng: number };
  previousSearches?: string[];
}) {
  return useQuery({
    queryKey: ['/api/recommendations/contextual', context],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/recommendations/contextual', context);
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}