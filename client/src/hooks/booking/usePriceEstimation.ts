import { useMemo } from "react";
import { serviceAddOns, type AddOn } from "../../../../config/addons";
import { calculateEstimatedHours } from "../../../../config/estimates";

export interface PricingBreakdown {
  basePrice: number;
  addOnsPrice: number;
  materialsDiscount: number;
  recurringDiscount: number;
  timeDiscount: number;
  totalPrice: number;
  estimatedHours: number;
}

export interface BookingFormData {
  propertyType?: string;
  cleaningType?: string;
  propertySize?: string;
  gardenSize?: string;
  gardenCondition?: string;
  poolSize?: string;
  poolCondition?: string;
  plumbingIssue?: string;
  electricalIssue?: string;
  urgency?: string;
  cuisineType?: string;
  menuSelection?: string;
  selectedMenu?: string;
  customMenuItems?: string[];
  eventSize?: string;
  selectedAddOns: string[];
  materials?: string;
  recurringSchedule?: string;
  timePreference?: string;
  
  // Beauty & Wellness
  eventType?: string;
  beautyServices?: string[];
  serviceQuantities?: Record<string, number>;

  // Locksmith
  serviceCategory?: string;
  locksmithCategory?: string;
  locksmithServiceType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  keyType?: string;
  lockType?: string;
  numberOfLocks?: number;
  businessType?: string;
  numberOfDoors?: number;
}

/**
 * Hook for calculating service pricing with dynamic discounts and add-ons
 * Extracted from modern-service-modal.tsx pricing logic
 */
export function usePriceEstimation(
  mappedServiceId: string | null,
  serviceConfigs: any,
  formData: BookingFormData
): PricingBreakdown {
  
  // Calculate base price and total
  const pricing = useMemo(() => {
    // Default pricing structure
    const defaultPricing: PricingBreakdown = {
      basePrice: 0,
      addOnsPrice: 0,
      materialsDiscount: 0,
      recurringDiscount: 0,
      timeDiscount: 0,
      totalPrice: 0,
      estimatedHours: 0
    };

    // Return defaults if no service selected
    if (!mappedServiceId || !serviceConfigs[mappedServiceId]) {
      return defaultPricing;
    }
    
    const config = serviceConfigs[mappedServiceId];
    let basePrice = config.basePrice;
    
    // Property type multiplier (common across services)
    const propertyType = config.propertyTypes?.find((p: any) => p.value === formData.propertyType);
    if (propertyType) {
      basePrice *= propertyType.multiplier;
    }

    // Service-specific pricing calculations
    if (mappedServiceId === "cleaning") {
      const cleaningType = config.cleaningTypes?.find((t: any) => t.value === formData.cleaningType);
      if (cleaningType) basePrice = cleaningType.price;
      
      const propertySize = config.propertySizes?.find((s: any) => s.value === formData.propertySize);
      if (propertySize) basePrice *= propertySize.multiplier;
    }

    if (mappedServiceId === "garden-care" || mappedServiceId === "garden-maintenance") {
      const gardenSize = config.gardenSizes?.find((s: any) => s.value === formData.gardenSize);
      if (gardenSize) basePrice *= gardenSize.multiplier;
      
      const condition = config.gardenConditions?.find((c: any) => c.value === formData.gardenCondition);
      if (condition) basePrice *= condition.multiplier;
    }

    if (mappedServiceId === "pool-cleaning") {
      const poolSize = config.poolSizes?.find((s: any) => s.value === formData.poolSize);
      if (poolSize) basePrice *= poolSize.multiplier;
      
      const condition = config.poolConditions?.find((c: any) => c.value === formData.poolCondition);
      if (condition) basePrice *= condition.multiplier;
    }

    if (mappedServiceId === "locksmith") {
      const category = formData.locksmithCategory || formData.serviceCategory || "residential";
      const serviceType = formData.locksmithServiceType || "";
      
      // Base prices by service type
      basePrice = 450;
      
      if (category === 'automotive') {
        if (serviceType === 'lockout' || serviceType?.includes('Locked keys')) basePrice = 650;
        else if (serviceType === 'lost-keys' || serviceType?.includes('Lost keys')) basePrice = 850;
        else if (serviceType === 'duplication' || serviceType?.includes('duplication')) basePrice = 150;
        else if (serviceType === 'transponder' || serviceType?.includes('Transponder')) basePrice = 1200;
        // Fallback to config price if no match
        else if (config.serviceTypes?.automotive) {
           const type = config.serviceTypes.automotive.find((t: any) => t.value === serviceType);
           if (type) basePrice = type.price;
        }
      }
      
      if (category === 'residential') {
        const numLocks = formData.numberOfLocks || 1;
        if (serviceType === 'lockout') basePrice = 450;
        else if (serviceType === 'install' || serviceType === 'replace' || serviceType?.includes('Installation')) basePrice = 350 * numLocks;
        else if (serviceType === 'repair' || serviceType?.includes('Repair')) basePrice = 280 * numLocks;
        else if (serviceType === 'rekey' || serviceType?.includes('Rekey')) basePrice = 250 * numLocks;
        else if (serviceType === 'smart-lock' || serviceType?.includes('Smart lock')) basePrice = 800;
        // Fallback
        else if (config.serviceTypes?.residential) {
           const type = config.serviceTypes.residential.find((t: any) => t.value === serviceType);
           if (type) basePrice = type.price;
        }
      }
      
      if (category === 'commercial') {
        if (serviceType === 'lockout') basePrice = 550;
        else if (serviceType === 'master-key' || serviceType?.includes('Master key')) basePrice = 2500;
        else if (serviceType === 'access-control' || serviceType?.includes('Access control')) basePrice = 3500;
        // Fallback
        else if (config.serviceTypes?.commercial) {
           const type = config.serviceTypes.commercial.find((t: any) => t.value === serviceType);
           if (type) basePrice = type.price;
        }
      }
      
      // Emergency multiplier
      if (category === 'emergency') {
        // If specific service selected, use its price, otherwise apply multiplier to base
        if (config.serviceTypes?.emergency) {
            const type = config.serviceTypes.emergency.find((t: any) => t.value === serviceType);
            if (type) basePrice = type.price;
            else basePrice *= 1.5;
        } else {
            basePrice *= 1.5;
        }
      }
      
      // Urgency multipliers
      if (formData.urgency === 'immediate' || formData.urgency === 'emergency') basePrice *= 2.0;
      else if (formData.urgency === '1_hour' || formData.urgency === 'urgent') basePrice *= 1.5;
      else if (formData.urgency === '2_hours') basePrice *= 1.2;
    }

    if (mappedServiceId === "plumbing") {
      // Use the specific plumbing issue price as base price
      const plumbingIssue = config.plumbingIssues?.find((i: any) => i.value === formData.plumbingIssue);
      if (plumbingIssue) basePrice = plumbingIssue.price;
      
      // Apply urgency fee if applicable (emergency/urgent/same-day)
      if (formData.urgency === "emergency") {
        basePrice += 150; // R150 emergency callout fee
      } else if (formData.urgency === "urgent") {
        basePrice += 100; // R100 priority fee
      } else if (formData.urgency === "same-day") {
        basePrice += 50; // R50 same-day fee
      }
    }

    if (mappedServiceId === "electrical") {
      // Use the specific electrical issue price as base price
      const electricalIssue = config.electricalIssues?.find((i: any) => i.value === formData.electricalIssue);
      if (electricalIssue) basePrice = electricalIssue.price;
      
      // Apply urgency multiplier
      const urgency = config.urgencyLevels?.find((u: any) => u.value === formData.urgency);
      if (urgency) basePrice *= urgency.multiplier;
    }

    if (mappedServiceId === "chef-catering") {
      // Handle menu selection pricing
      if (formData.menuSelection === "popular" && formData.selectedMenu && formData.cuisineType) {
        const selectedCuisine = config.cuisineTypes?.find((c: any) => c.value === formData.cuisineType);
        const selectedMenuData = selectedCuisine?.popularMenus?.find((m: any) => m.name === formData.selectedMenu);
        if (selectedMenuData) {
          basePrice = selectedMenuData.price;
        }
      } else {
        // Apply cuisine type multiplier for custom menu or when no popular menu selected
        const cuisineType = config.cuisineTypes?.find((c: any) => c.value === formData.cuisineType);
        if (cuisineType) basePrice *= cuisineType.multiplier;
      }
      
      // Apply event size multiplier
      const eventSize = config.eventSizes?.find((s: any) => s.value === formData.eventSize);
      if (eventSize) basePrice *= eventSize.multiplier;
      
      // Additional pricing for custom menu items (base price per item for custom menus)
      if (formData.menuSelection === "custom" && formData.customMenuItems && formData.customMenuItems.length > 0) {
        basePrice += formData.customMenuItems.length * 45; // R45 per custom menu item
      }
    }

    if (mappedServiceId === "event-staff") {
      const staffType = config.staffTypes?.find((s: any) => s.value === formData.cleaningType);
      if (staffType) basePrice = staffType.price;
      
      const eventSize = config.eventSizes?.find((s: any) => s.value === formData.propertySize);
      if (eventSize) basePrice *= eventSize.multiplier;
    }

    if (mappedServiceId === "beauty-wellness") {
      // 1. Calculate base sum from selected services and their quantities
      let servicesTotal = 0;
      if (formData.beautyServices && Array.isArray(formData.beautyServices)) {
        formData.beautyServices.forEach(serviceVal => {
          const serviceConfig = config.serviceTypes?.find((s: any) => s.value === serviceVal);
          if (serviceConfig) {
            const qty = formData.serviceQuantities?.[serviceVal] || 1;
            servicesTotal += serviceConfig.price * qty;
          }
        });
      }
      // If no services selected yet, use basePrice from config as fallback or 0
      basePrice = servicesTotal > 0 ? servicesTotal : config.basePrice;

      // 2. Apply Event Type Multiplier
      const eventType = config.eventTypes?.find((e: any) => e.value === formData.eventType);
      if (eventType) {
        basePrice *= eventType.multiplier;
      }
      
      // 3. Property/Location Type Multiplier is already applied above (lines 69-72)
      // but we might want to ensure it's not double-counted if basePrice was reset.
      // The code above (lines 69-72) applies it to `config.basePrice`.
      // Since we overwrote basePrice with `servicesTotal`, we should re-apply property multiplier if needed.
      // However, usually property multiplier applies to the whole service.
      // Let's re-apply it here to be safe if we replaced basePrice.
      if (propertyType && servicesTotal > 0) {
        // The previous application was `basePrice *= propertyType.multiplier` where basePrice was `config.basePrice`.
        // Now basePrice is `servicesTotal`. We need to apply the multiplier to this new base.
        // But wait, line 71 already multiplied `basePrice` (initially config.basePrice).
        // If we overwrite basePrice, we lose that.
        // So yes, we should apply it.
        basePrice *= propertyType.multiplier;
      }
    }

    if (mappedServiceId === "moving") {
      const movingType = config.movingTypes?.find((t: any) => t.value === formData.cleaningType);
      if (movingType) basePrice = movingType.price;
      
      const distance = config.movingDistance?.find((d: any) => d.value === formData.propertySize);
      if (distance) basePrice *= distance.multiplier;
    }

    if (mappedServiceId === "au-pair") {
      const careType = config.careTypes?.find((t: any) => t.value === formData.cleaningType);
      if (careType) basePrice = careType.price;
      
      const childrenCount = config.childrenCount?.find((c: any) => c.value === formData.propertySize);
      if (childrenCount) basePrice *= childrenCount.multiplier;
      
      const childrenAge = config.childrenAges?.find((a: any) => a.value === formData.gardenSize);
      if (childrenAge) basePrice *= childrenAge.multiplier;
    }

    // Add-ons pricing - Use serviceAddOns from config/addons.ts
    const availableAddOns = serviceAddOns[mappedServiceId] || [];
    const addOnsPrice = availableAddOns
      .filter((addon: AddOn) => formData.selectedAddOns.includes(addon.id))
      .reduce((sum: number, addon: AddOn) => sum + addon.price, 0) || 0;

    // Enhanced discount calculations
    let materialsDiscount = 0;
    let recurringDiscount = 0;
    let timeDiscount = 0;

    // Materials discount (15% if customer provides materials)
    if (formData.materials === "bring") {
      materialsDiscount = Math.round((basePrice + addOnsPrice) * 0.15);
    }

    // Recurring service discounts
    if (formData.recurringSchedule === "weekly") {
      recurringDiscount = Math.round((basePrice + addOnsPrice) * 0.15);
    } else if (formData.recurringSchedule === "bi-weekly") {
      recurringDiscount = Math.round((basePrice + addOnsPrice) * 0.10);
    } else if (formData.recurringSchedule === "monthly") {
      recurringDiscount = Math.round((basePrice + addOnsPrice) * 0.08);
    }

    // Early bird discount (6 AM slots get 10% off)
    if (formData.timePreference === "06:00") {
      timeDiscount = Math.round((basePrice + addOnsPrice) * 0.10);
    }

    const totalPrice = Math.max(0, basePrice + addOnsPrice - materialsDiscount - recurringDiscount - timeDiscount);

    // Calculate estimated hours
    let roomCount: string | undefined;
    if (mappedServiceId === "cleaning" && formData.propertySize) {
      roomCount = formData.propertySize;
    }
    
    const estimatedHours = calculateEstimatedHours(
      mappedServiceId,
      {
        cleaningType: formData.cleaningType,
        roomCount: roomCount,
        addOnCount: formData.selectedAddOns?.length || 0
      }
    );

    return {
      basePrice,
      addOnsPrice,
      materialsDiscount,
      recurringDiscount,
      timeDiscount,
      totalPrice,
      estimatedHours
    };
  }, [mappedServiceId, serviceConfigs, formData]);

  return pricing;
}
