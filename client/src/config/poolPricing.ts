/**
 * Pool Cleaning Service Configuration
 * Centralized pricing multipliers and pool type definitions
 */

export interface PoolSizeConfig {
  value: string;
  label: string;
  description: string;
  multiplier: number;
}

export const POOL_SIZES: PoolSizeConfig[] = [
  {
    value: "small",
    label: "Small Pool",
    description: "Up to 20,000L",
    multiplier: 1.0
  },
  {
    value: "medium",
    label: "Medium Pool",
    description: "20,000-40,000L",
    multiplier: 1.5
  },
  {
    value: "large",
    label: "Large Pool",
    description: "40,000-60,000L",
    multiplier: 2.0
  },
  {
    value: "olympic",
    label: "Olympic/Estate",
    description: "60,000L+",
    multiplier: 3.0
  }
];

export const POOL_PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
  { value: "estate", label: "Estate" }
];

export const POOL_CONDITIONS = [
  { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
  { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
  { value: "neglected", label: "Neglected/Green", multiplier: 1.5 }
];

export const POOL_SERVICE_TYPES = [
  { value: "basic-cleaning", label: "Basic Cleaning & Skimming" },
  { value: "chemical-balance", label: "Chemical Balancing" },
  { value: "filter-cleaning", label: "Filter Cleaning" },
  { value: "vacuum-brush", label: "Vacuum & Brush" },
  { value: "full-service", label: "Full Service Package" }
];

/**
 * Calculate pool service price based on size multiplier
 */
export function calculatePoolPrice(basePrice: number, sizeValue: string): number {
  const sizeConfig = POOL_SIZES.find(s => s.value === sizeValue);
  if (!sizeConfig) return basePrice;
  
  return basePrice * sizeConfig.multiplier;
}

/**
 * Get size multiplier for a given pool size
 */
export function getPoolSizeMultiplier(sizeValue: string): number {
  const sizeConfig = POOL_SIZES.find(s => s.value === sizeValue);
  return sizeConfig?.multiplier || 1.0;
}
