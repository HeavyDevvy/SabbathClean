
import { addDays, isWeekend, isSameDay } from "date-fns";

export interface MovingFormData {
  moveType: string;
  moveCategory: string;
  moveDate: string;
  preferredTime: string;
  isCompleteMove: boolean;
  
  originAddress: string;
  originPropertyType: string;
  originFloor: string | number;
  originElevator: boolean;
  originStairs: boolean;
  originParking: boolean;
  
  destAddress: string;
  destPropertyType: string;
  destFloor: string | number;
  destElevator: boolean;
  destStairs: boolean;
  destParking: boolean;
  
  distance: string | number; // km
  
  boxCounts: {
    small: number;
    medium: number;
    large: number;
    wardrobe: number;
  };
  
  appliances: string[];
  specialItems: string[]; // Piano, Pool Table, etc.
  
  packingService: boolean;
  unpackingService: boolean;
  assembly: boolean;
  storageNeeded: boolean;
  storageDuration: string;
  insuranceLevel: string;
}

export interface PricingBreakdown {
  baseRate: number;
  distanceFee: number;
  floorSurcharges: number;
  specialItemsFee: number;
  packingFee: number;
  storageFee: number;
  insuranceFee: number;
  timeMultiplier: number;
  total: number;
}

// Base rates for move categories
const BASE_RATES: Record<string, number> = {
  studio: 1800,
  "1bed": 2500,
  "2bed": 3800,
  "3bed": 5500,
  "4plus": 7500,
  office_small: 4500,
  office_large: 8500,
};

// Cost per km
const RATE_PER_KM = 15; // R15 per km

// Floor surcharges (per flight of stairs if no elevator)
const STAIR_SURCHARGE = 250; 

// Special items costs
const SPECIAL_ITEM_COSTS: Record<string, number> = {
  "Piano": 1500,
  "Pool Table": 2000,
  "Safe": 800,
  "Gym Equipment": 600,
  "Large Artwork": 400
};

// Box packing costs (labor + materials)
const PACKING_COSTS = {
  small: 25,
  medium: 35,
  large: 45,
  wardrobe: 65
};

// Storage costs (monthly estimation)
const STORAGE_COSTS: Record<string, number> = {
  short_term: 1200, // < 1 month
  medium_term: 1000, // per month
  long_term: 850 // per month
};

// Insurance rates (percentage of total value or flat fee)
const INSURANCE_RATES: Record<string, number> = {
  basic: 0,
  standard: 450,
  premium: 1200
};

export const calculateMovingPrice = (data: MovingFormData): PricingBreakdown => {
  let baseRate = BASE_RATES[data.moveCategory] || 2000;
  
  // 1. Distance Calculation
  const distance = typeof data.distance === 'string' ? parseFloat(data.distance) : data.distance;
  const distanceFee = (distance > 20) ? (distance - 20) * RATE_PER_KM : 0; // First 20km free? Or just charge. Let's charge all for simplicity or follow standard. Usually base includes local (20km).
  
  // 2. Floor/Access Surcharges
  let floorSurcharges = 0;
  const originFloor = Number(data.originFloor) || 0;
  const destFloor = Number(data.destFloor) || 0;
  
  if (originFloor > 0 && !data.originElevator && data.originStairs) {
    floorSurcharges += originFloor * STAIR_SURCHARGE;
  }
  if (destFloor > 0 && !data.destElevator && data.destStairs) {
    floorSurcharges += destFloor * STAIR_SURCHARGE;
  }
  
  // 3. Special Items
  let specialItemsFee = 0;
  // Check appliances for heavy items
  // Assuming appliances are standard included in base for size, but maybe extra?
  // Let's assume standard appliances are included in "Move Category" sizing, but "Special Items" (Piano) are extra.
  // If data.specialItems is not present, we might need to parse instructions or use appliances if heavy.
  // For now, let's use a placeholder logic if specialItems array exists.
  if (data.specialItems && data.specialItems.length > 0) {
    // If it's strings, map them.
    // Logic depends on how specialItems is populated.
  }
  // Check appliances for specific heavy ones if needed, e.g. "American Fridge"
  
  // 4. Packing/Unpacking
  let packingFee = 0;
  if (data.packingService) {
    // Estimate based on box counts or move size
    // If box counts are 0, estimate based on home size
    const estimatedBoxes = data.boxCounts.small + data.boxCounts.medium + data.boxCounts.large + data.boxCounts.wardrobe;
    if (estimatedBoxes > 0) {
      packingFee += (data.boxCounts.small * PACKING_COSTS.small) +
                    (data.boxCounts.medium * PACKING_COSTS.medium) +
                    (data.boxCounts.large * PACKING_COSTS.large) +
                    (data.boxCounts.wardrobe * PACKING_COSTS.wardrobe);
    } else {
      // Fallback estimation
      packingFee += baseRate * 0.4; // 40% of move cost for full packing
    }
  }
  
  if (data.unpackingService) {
    packingFee += baseRate * 0.25; // 25% for unpacking
  }
  
  if (data.assembly) {
    packingFee += 450; // Flat fee or per item
  }
  
  // 5. Storage
  let storageFee = 0;
  if (data.storageNeeded && data.storageDuration) {
    storageFee = STORAGE_COSTS[data.storageDuration] || 1000;
  }
  
  // 6. Insurance
  const insuranceFee = INSURANCE_RATES[data.insuranceLevel] || 0;
  
  // 7. Time Multipliers
  let timeMultiplier = 1;
  if (data.moveDate) {
    const date = new Date(data.moveDate);
    if (isWeekend(date)) {
      timeMultiplier = 1.2; // 20% weekend surcharge
    }
    // End of month surcharge? (25th to 5th)
    const day = date.getDate();
    if (day >= 25 || day <= 5) {
      timeMultiplier += 0.1; // Additional 10% for peak period
    }
  }
  
  const subTotal = baseRate + distanceFee + floorSurcharges + specialItemsFee + packingFee + storageFee + insuranceFee;
  const total = Math.round(subTotal * timeMultiplier);
  
  return {
    baseRate,
    distanceFee,
    floorSurcharges,
    specialItemsFee,
    packingFee,
    storageFee,
    insuranceFee,
    timeMultiplier,
    total
  };
};

export const getSmartRecommendations = (data: MovingFormData) => {
  // Recommend truck size
  let truckSize = "3 Ton Truck";
  let movers = 2;
  let duration = "4-6 hours";
  
  switch (data.moveCategory) {
    case "studio":
      truckSize = "1.5 Ton Bakkie";
      movers = 2;
      duration = "2-4 hours";
      break;
    case "1bed":
      truckSize = "3 Ton Truck";
      movers = 2;
      duration = "3-5 hours";
      break;
    case "2bed":
      truckSize = "4 Ton Truck";
      movers = 3;
      duration = "5-7 hours";
      break;
    case "3bed":
      truckSize = "8 Ton Truck";
      movers = 4;
      duration = "6-8 hours";
      break;
    case "4plus":
      truckSize = "8 Ton Truck + Trailer";
      movers = 6;
      duration = "8+ hours";
      break;
    case "office_small":
      truckSize = "4 Ton Truck";
      movers = 3;
      duration = "4-6 hours";
      break;
    case "office_large":
      truckSize = "8 Ton Truck";
      movers = 5;
      duration = "8+ hours";
      break;
  }
  
  return {
    truckSize,
    movers,
    duration
  };
};
