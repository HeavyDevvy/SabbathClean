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
  
  "event-staff": {
    baseHours: 5,
    description: "Event staffing services",
  },
  
  "moving": {
    baseHours: 5,
    description: "Moving and relocation services",
  },
  
  "au-pair": {
    baseHours: 5,
    description: "Au pair and childcare services",
  },
  
  "waitering": {
    baseHours: 5,
    description: "Waitering and event staff services",
  },
};

// House Cleaning specific: Cleaning type base hours
export const cleaningTypeHours: Record<string, number> = {
  "standard": 3,
  "deep-clean": 5,
  "move-in-out": 6,
  "spring-clean": 7,
  "office": 4,
};

// House Cleaning specific: Room count multipliers
export const roomCountMultipliers: Record<string, number> = {
  "1-2": 1.0,      // 1-2 rooms: no multiplier
  "3-4": 1.3,      // 3-4 rooms: 30% increase
  "5-6": 1.6,      // 5-6 rooms: 60% increase
  "7+": 2.0,       // 7+ rooms: 100% increase
};

interface HouseCleaningParams {
  cleaningType?: string;
  roomCount?: string;
  addOnCount?: number;
}

// Calculate time for House Cleaning specifically
export function calculateHouseCleaningHours(params: HouseCleaningParams): number {
  const { cleaningType = "standard", roomCount = "1-2", addOnCount = 0 } = params;
  
  // Start with cleaning type base hours
  let hours = cleaningTypeHours[cleaningType] || cleaningTypeHours["standard"];
  
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
