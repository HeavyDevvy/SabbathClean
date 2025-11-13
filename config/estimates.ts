// Industry standard hours estimation for services
// TODO: Update these with actual market research data

export interface ServiceEstimate {
  baseHours: number;
  propertyMultiplier?: Record<string, number>; // Property size multipliers
  description: string;
}

export const serviceEstimates: Record<string, ServiceEstimate> = {
  "house-cleaning": {
    baseHours: 3,
    propertyMultiplier: {
      "1-2-bedrooms": 1,
      "3-4-bedrooms": 1.5,
      "5+-bedrooms": 2,
    },
    description: "Standard home cleaning",
  },
  
  "plumbing": {
    baseHours: 2,
    description: "Standard plumbing service call",
  },
  
  "electrical": {
    baseHours: 1.5,
    description: "Electrical repair/installation",
  },
  
  "garden-maintenance": {
    baseHours: 2,
    propertyMultiplier: {
      "small": 1,
      "medium": 1.5,
      "large": 2.5,
    },
    description: "Garden maintenance and care",
  },
  
  "chef-catering": {
    baseHours: 4,
    description: "Chef services including prep and cooking",
  },
  
  "event-staff": {
    baseHours: 6,
    description: "Event staffing services",
  },
  
  "handyman": {
    baseHours: 2,
    description: "General handyman services",
  },
  
  "beauty-wellness": {
    baseHours: 1.5,
    description: "Beauty and wellness treatment",
  },
};

// Calculate total hours based on service, property size, and add-ons
export function calculateEstimatedHours(
  serviceCategory: string,
  propertySize?: string,
  addOnIds?: string[]
): number {
  const estimate = serviceEstimates[serviceCategory];
  if (!estimate) return 2; // Default fallback
  
  let hours = estimate.baseHours;
  
  // Apply property size multiplier if applicable
  if (propertySize && estimate.propertyMultiplier) {
    const multiplier = estimate.propertyMultiplier[propertySize] || 1;
    hours *= multiplier;
  }
  
  // HOUSE CLEANING ONLY: Special logic for estimated hours
  const isHouseCleaning = serviceCategory === "house-cleaning" || serviceCategory === "cleaning";
  
  if (isHouseCleaning) {
    // Minimum 6 hours for House Cleaning
    hours = Math.max(hours, 6);
    
    // Add 0.5 hours for each add-on
    if (addOnIds && addOnIds.length > 0) {
      hours += (addOnIds.length * 0.5);
    }
  } else {
    // Add hours from add-ons for other services (if needed in future)
    if (addOnIds && addOnIds.length > 0) {
      // Import add-ons config to get hours per add-on
      // This would need to be implemented when add-ons are selected
    }
  }
  
  return Math.round(hours * 10) / 10; // Round to 1 decimal
}
