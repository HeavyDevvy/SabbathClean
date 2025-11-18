// Service time estimation logic
// Base: 5 hours for most services, 3 hours for plumbing/electrical
// +30 minutes per additional option
// House Cleaning: Special logic based on cleaning type and room count

export interface ServiceEstimate {
  baseHours: number;
  description: string;
}

export const serviceEstimates: Record<string, ServiceEstimate> = {
  "house-cleaning": {
    baseHours: 5,
    description: "Standard home cleaning with room-based calculation",
  },
  
  "plumbing": {
    baseHours: 3,
    description: "Plumbing service call",
  },
  
  "electrical": {
    baseHours: 3,
    description: "Electrical repair/installation",
  },
  
  "garden-care": {
    baseHours: 5,
    description: "Garden maintenance and care",
  },
  
  "chef-catering": {
    baseHours: 5,
    description: "Chef services including prep and cooking",
  },
  
  "pool-cleaning": {
    baseHours: 3,
    description: "Pool cleaning and maintenance",
  },
  
  "event-staff": {
    baseHours: 3,
    description: "Event staffing services",
  },
  
  "moving": {
    baseHours: 3,
    description: "Moving and relocation services",
  },
  
  "au-pair": {
    baseHours: 5,
    description: "Au pair and childcare services",
  },
  
  "waitering": {
    baseHours: 3,
    description: "Waitering and event staff services",
  },
};

// House Cleaning specific: Cleaning type base hours
// Keys match modal cleaningTypes values: basic, deep-clean, move-clean
export const cleaningTypeHours: Record<string, number> = {
  "basic": 3,
  "deep-clean": 5,
  "move-clean": 6,
};

// House Cleaning specific: Room count multipliers
// Keys match modal propertySizes values: small, medium, large
export const roomCountMultipliers: Record<string, number> = {
  "small": 1.0,    // Small (1-2 bedrooms): no multiplier
  "medium": 1.3,   // Medium (3-4 bedrooms): 30% increase
  "large": 1.6,    // Large (5+ bedrooms): 60% increase
};

interface HouseCleaningParams {
  cleaningType?: string;
  roomCount?: string;
  addOnCount?: number;
}

// Calculate time for House Cleaning specifically
export function calculateHouseCleaningHours(params: HouseCleaningParams): number {
  const { cleaningType = "basic", roomCount = "small", addOnCount = 0 } = params;
  
  // Start with cleaning type base hours
  let hours = cleaningTypeHours[cleaningType] || cleaningTypeHours["basic"];
  
  // Apply room count multiplier
  const multiplier = roomCountMultipliers[roomCount] || 1.0;
  hours *= multiplier;
  
  // Add 30 minutes (0.5 hours) per additional option
  hours += (addOnCount * 0.5);
  
  return Math.round(hours * 10) / 10; // Round to 1 decimal
}

// Calculate estimated hours for any service
export function calculateEstimatedHours(
  serviceCategory: string,
  options?: {
    cleaningType?: string;
    roomCount?: string;
    addOnCount?: number;
  }
): number {
  // Special handling for house cleaning
  if (serviceCategory === "house-cleaning" || serviceCategory === "cleaning") {
    return calculateHouseCleaningHours({
      cleaningType: options?.cleaningType,
      roomCount: options?.roomCount,
      addOnCount: options?.addOnCount || 0,
    });
  }
  
  // For all other services
  const estimate = serviceEstimates[serviceCategory];
  if (!estimate) return 5; // Default fallback
  
  let hours = estimate.baseHours;
  
  // Add 30 minutes per additional option
  if (options?.addOnCount) {
    hours += (options.addOnCount * 0.5);
  }
  
  return Math.round(hours * 10) / 10; // Round to 1 decimal
}
