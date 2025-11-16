/**
 * Garden Care Service Configuration
 * Centralized pricing multipliers and property type definitions
 */

export interface GardenSizeConfig {
  value: string;
  label: string;
  description: string;
  multiplier: number;
}

export const GARDEN_SIZES: GardenSizeConfig[] = [
  {
    value: "small",
    label: "Small Garden",
    description: "0-100 sqm",
    multiplier: 1.0
  },
  {
    value: "medium",
    label: "Medium Garden",
    description: "100-300 sqm",
    multiplier: 1.5
  },
  {
    value: "large",
    label: "Large Garden",
    description: "300-500 sqm",
    multiplier: 2.0
  },
  {
    value: "estate",
    label: "Estate",
    description: "500+ sqm",
    multiplier: 3.0
  }
];

export const GARDEN_PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
  { value: "estate", label: "Estate" }
  // Removed: "Apartment Balcony" as per requirements
];

export const GARDEN_SERVICE_TYPES = [
  { value: "lawn-mowing", label: "Lawn Mowing" },
  { value: "hedge-trimming", label: "Hedge Trimming" },
  { value: "garden-cleanup", label: "Garden Cleanup" },
  { value: "plant-care", label: "Plant Care & Maintenance" },
  { value: "landscaping", label: "Landscaping & Design" }
];

/**
 * Calculate garden service price based on size multiplier
 */
export function calculateGardenPrice(basePrice: number, sizeValue: string): number {
  const sizeConfig = GARDEN_SIZES.find(s => s.value === sizeValue);
  if (!sizeConfig) return basePrice;
  
  return basePrice * sizeConfig.multiplier;
}

/**
 * Get size multiplier for a given garden size
 */
export function getGardenSizeMultiplier(sizeValue: string): number {
  const sizeConfig = GARDEN_SIZES.find(s => s.value === sizeValue);
  return sizeConfig?.multiplier || 1.0;
}
