import { useMemo } from "react";
import { serviceAddOns, type AddOn } from "../../../../config/addons";
import { calculateEstimatedHours } from "../../../../config/estimates";
import type { BookingFormData } from "./useBookingFlow";

export interface PricingBreakdown {
  basePrice: number;
  addOnsPrice: number;
  materialsDiscount: number;
  recurringDiscount: number;
  timeDiscount: number;
  totalPrice: number;
  estimatedHours: number;
  oneTimeFees: number;
  // Detailed breakdown fields
  staffCosts?: number;
  eventMultiplier?: number;
  serviceStyleMultiplier?: number;
  additionalFees?: number;
  breakdown?: {
    staffCosts: {
      waiters: number;
      bartenders: number;
      assistants: number;
      coordinators: number;
    };
    durationSubtotal: number;
    fees: {
      afterHours: number;
      weekend: number;
      travel: number;
      uniforms: number;
      equipment: number;
      barSetup: number;
    };
  };
  // Moving breakdown
  movingBreakdown?: {
    baseMoveCost: number;
    distanceFee: number;
    accessFees: number;
    specialItemsTotal: number;
    servicesTotal: number;
    storageTotal: number;
    insuranceTotal: number;
    timeSurcharges: number;
    subtotal: number;
    total: number;
  };
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
      estimatedHours: 0,
      oneTimeFees: 0
    };

    // Return defaults if no service selected
    if (!mappedServiceId || !serviceConfigs[mappedServiceId]) {
      return defaultPricing;
    }
    
    const config = serviceConfigs[mappedServiceId];
    let basePrice = config.basePrice;
    let oneTimeFees = 0;
    let breakdownDetails: any = {};
    
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
      // 1. Parse Guest Count and Enforce Minimums
      const guestsRaw = formData.numberOfGuests || "";
      let guestCount = parseInt(guestsRaw, 10);
      if (Number.isNaN(guestCount)) {
        if (guestsRaw === "small") guestCount = 20;
        else if (guestsRaw === "medium") guestCount = 50;
        else if (guestsRaw === "large") guestCount = 100;
        else if (guestsRaw === "corporate") guestCount = 200;
        else guestCount = 0;
      }

      let minWaiters = 0;
      if (guestCount >= 10 && guestCount <= 20) minWaiters = 1;
      else if (guestCount >= 21 && guestCount <= 50) minWaiters = 2;
      else if (guestCount >= 51 && guestCount <= 100) minWaiters = 4;
      else if (guestCount >= 101 && guestCount <= 200) minWaiters = 8;
      else if (guestCount >= 201 && guestCount <= 500) minWaiters = 15;

      const requestedWaiters = formData.waitersCount || 0;
      const effectiveWaiters = Math.max(requestedWaiters, minWaiters);

      const bartenders = formData.bartendersCount || 0;
      const assistants = formData.cateringAssistantsCount || 0;
      const coordinatorCount = formData.coordinatorRequired ? 1 : 0;
      const totalStaffCount = effectiveWaiters + bartenders + assistants + coordinatorCount;

      // 2. Determine Duration (Min 4 hours)
      let durationHours = parseFloat(formData.eventDuration || "");
      if (!durationHours || durationHours < 4) durationHours = 4;

      // 3. Determine Hourly Rates
      const experienceLevel = formData.experienceLevelRequired || "entry";
      let waiterRate = 85;
      let bartenderRate = 100;

      switch (experienceLevel) {
        case "intermediate":
          waiterRate = 110;
          bartenderRate = 125; // Interpolated as midpoint
          break;
        case "experienced":
          waiterRate = 140;
          bartenderRate = 150;
          break;
        case "expert":
        case "premium":
          waiterRate = 180;
          bartenderRate = 220;
          break;
        case "entry":
        case "standard":
        default:
          waiterRate = 85;
          bartenderRate = 100;
          break;
      }

      const assistantRate = 75;
      const coordinatorRate = 200;

      // 4. Calculate Staff Costs (Duration Subtotal)
      const waiterCost = effectiveWaiters * waiterRate * durationHours;
      const bartenderCost = bartenders * bartenderRate * durationHours;
      const assistantCost = assistants * assistantRate * durationHours;
      const coordinatorCost = coordinatorCount * coordinatorRate * durationHours;

      let staffCost = waiterCost + bartenderCost + assistantCost + coordinatorCost;

      // 5. Apply Multipliers
      // Event Type
      let eventMultiplier = 1.0;
      const eType = formData.eventType || "";
      if (eType.includes("wedding")) eventMultiplier = 1.3;
      else if (eType.includes("corporate") || eType.includes("gala")) eventMultiplier = 1.2;
      else if (eType.includes("themed")) eventMultiplier = 1.1;
      else if (eType.includes("casual") || eType.includes("party")) eventMultiplier = 1.0;
      else {
        // Fallback to config if available
        const eventTypeConfig = config.eventTypes?.find((e: any) => e.value === eType);
        eventMultiplier = eventTypeConfig?.multiplier || 1.0;
      }

      // Service Style
      let styleMultiplier = 1.0;
      const style = formData.serviceStyle || "";
      if (style === "silver" || style === "fine-dining") styleMultiplier = 1.4;
      else if (style === "plated") styleMultiplier = 1.2;
      else if (style === "cocktail") styleMultiplier = 1.1;
      else if (style === "buffet") styleMultiplier = 1.0;

      // Apply multipliers to staff cost
      const baseStaffCost = staffCost;
      staffCost *= eventMultiplier;
      staffCost *= styleMultiplier;

      // 6. Calculate Additional Fees
      let afterHoursFee = 0;
      if (formData.serviceStartTime) {
        const parts = formData.serviceStartTime.split(":");
        const startHour = parseInt(parts[0] || "0", 10) + (parseInt(parts[1] || "0", 10) / 60);
        const endHour = startHour + durationHours;
        const hoursAfter11 = Math.max(0, endHour - 23);
        if (hoursAfter11 > 0) {
          afterHoursFee = hoursAfter11 * totalStaffCount * 50;
        }
      }

      let weekendFee = 0;
      let sundayHolidayFee = 0;
      if (formData.eventDate) {
        const date = new Date(formData.eventDate);
        const day = date.getDay();
        if (day === 6) { // Saturday
          weekendFee = durationHours * totalStaffCount * 30;
        } else if (day === 0) { // Sunday
          sundayHolidayFee = durationHours * totalStaffCount * 50;
        }
      }

      const distance = formData.travelDistanceKm || 0;
      let travelFee = 0;
      if (distance > 30) {
        travelFee = totalStaffCount * 150;
      }

      let uniformRentalFee = 0;
      if (formData.uniformPreference && formData.uniformPreference !== "branded" && formData.uniformPreference !== "standard") {
        // Assuming 'standard' doesn't incur fee, or maybe it does? 
        // Prompt says: "Uniform rental (if client doesn't provide): R80 per staff"
        // 'branded' implies client provides. 'standard' might be provided by staff?
        // Let's assume if it's NOT "client provides" (branded) and maybe explicit rental requested?
        // Actually, if client doesn't provide, it's rental.
        // Let's assume 'branded' = client provides. All others = rental?
        // Or maybe 'standard' is free (own clothes)?
        // "Uniform rental (if client doesn't provide): R80".
        // I'll assume if uniformPreference is NOT 'branded' (Client Branded), we charge, EXCEPT maybe 'standard'?
        // Let's charge for everything except 'branded' to be safe, or maybe check if 'standard' is free.
        // Usually 'Standard' (black pants/white shirt) is staff's own.
        // 'Formal', 'All Black', etc might be rented.
        // I'll charge if it's NOT 'branded' AND NOT 'standard'.
         if (formData.uniformPreference !== "branded" && formData.uniformPreference !== "standard") {
             uniformRentalFee = totalStaffCount * 80;
         }
      }

      const needsEquipmentRental =
        !formData.venueEquipment || !formData.glasswareProvided || !formData.cutleryProvided;
      const equipmentRentalFee = needsEquipmentRental ? 500 : 0;

      const barSetupFee = formData.barSetupRequired ? 800 : 0;

      const additionalFees =
        afterHoursFee +
        weekendFee +
        sundayHolidayFee +
        travelFee +
        uniformRentalFee +
        equipmentRentalFee +
        barSetupFee;

      let totalServicePrice = staffCost + additionalFees;

      // 7. Property Multiplier (if applicable)
      if (propertyType && (propertyType as any).multiplier) {
        totalServicePrice *= (propertyType as any).multiplier;
      }

      // 8. Minimum Booking Charge
      if (totalServicePrice < 1200) {
        totalServicePrice = 1200;
      }

      basePrice = totalServicePrice;
      oneTimeFees = additionalFees;
      
      // Populate breakdown
      breakdownDetails.staffCosts = staffCost;
      breakdownDetails.eventMultiplier = eventMultiplier;
      breakdownDetails.serviceStyleMultiplier = styleMultiplier;
      breakdownDetails.additionalFees = additionalFees;
      breakdownDetails.breakdown = {
        staffCosts: {
          waiters: waiterCost,
          bartenders: bartenderCost,
          assistants: assistantCost,
          coordinators: coordinatorCost
        },
        durationSubtotal: baseStaffCost, // This is staff cost before multipliers
        fees: {
          afterHours: afterHoursFee,
          weekend: weekendFee,
          travel: travelFee,
          uniforms: uniformRentalFee,
          equipment: equipmentRentalFee,
          barSetup: barSetupFee
        }
      };
    }

    if (mappedServiceId === "beauty-wellness") {
      // 1. Calculate base sum from selected services and their quantities
      let servicesTotal = 0;
      if (formData.beautyServices && Array.isArray(formData.beautyServices)) {
        formData.beautyServices.forEach((serviceVal: string) => {
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

    if (mappedServiceId === "moving" || mappedServiceId === "removals") {
      // 1. Base Rate by Move Size
      const sizeKey = formData.moveSize?.toLowerCase().replace('bedroom', 'bed').replace('bachelor', 'studio').trim() || "1-bed";
      let baseRate = 3500;
      
      if (sizeKey.includes('studio') || sizeKey.includes('bachelor')) baseRate = 3500;
      else if (sizeKey.includes('1')) baseRate = 5500;
      else if (sizeKey.includes('2')) baseRate = 8000;
      else if (sizeKey.includes('3')) baseRate = 11000;
      else if (sizeKey.includes('4')) baseRate = 15000;
      else if (sizeKey.includes('5') || sizeKey.includes('plus')) baseRate = 20000;

      // 11. Complexity Multiplier (Applied to Base Rate)
      let complexityMultiplier = 1.0;
      const mType = formData.moveType?.toLowerCase() || 'basic';
      if (mType.includes('standard')) complexityMultiplier = 1.15;
      else if (mType.includes('complex')) complexityMultiplier = 1.3;
      else if (mType.includes('premium') || mType.includes('white glove')) complexityMultiplier = 1.5;
      
      baseRate *= complexityMultiplier;

      // 2. Distance Charges
      const dist = Number(formData.distance) || 0;
      let distanceFee = 0;
      if (dist <= 20) distanceFee = 0;
      else if (dist <= 50) distanceFee = 800;
      else if (dist <= 100) distanceFee = 2500;
      else if (dist <= 200) distanceFee = 5000;
      else if (dist <= 500) distanceFee = 12000;
      else distanceFee = dist * 25; // Custom quote calculation for 500+

      // 3. Floor Level Surcharges
      const calculateFloorFee = (floor: string | undefined, hasElevator: boolean | undefined) => {
        if (!floor || floor === 'ground') return 0;
        const isElevator = !!hasElevator;
        if (floor.includes('1')) return isElevator ? 300 : 600;
        if (floor.includes('2')) return isElevator ? 500 : 1200;
        if (floor.includes('3') || floor.includes('plus') || parseInt(floor) >= 3) return isElevator ? 800 : 2000;
        return 0;
      };

      const originFloorFee = calculateFloorFee(formData.originFloor, formData.originElevator);
      const destFloorFee = calculateFloorFee(formData.destFloor, formData.destElevator);
      
      // 4. Stairs Surcharge
      const calculateStairsFee = (stairs: string | undefined) => {
        if (!stairs || stairs === 'none' || stairs === '0') return 0;
        if (stairs.includes('1-10')) return 200;
        if (stairs.includes('11-20')) return 400;
        if (stairs.includes('21') || stairs.includes('plus')) return 800;
        return 0;
      };
      
      const originStairsFee = calculateStairsFee(formData.originStairs);
      const destStairsFee = calculateStairsFee(formData.destStairs);
      
      const accessFees = originFloorFee + destFloorFee + originStairsFee + destStairsFee;

      // 5. Special Items
      let specialItemsTotal = 0;
      if (formData.specialItems && Array.isArray(formData.specialItems)) {
        formData.specialItems.forEach(item => {
          const lower = item.toLowerCase();
          if (lower.includes('piano') && lower.includes('grand')) specialItemsTotal += 3500;
          else if (lower.includes('piano')) specialItemsTotal += 1500;
          else if (lower.includes('pool table')) specialItemsTotal += 2000;
          else if (lower.includes('safe') && lower.includes('150')) specialItemsTotal += 3000;
          else if (lower.includes('safe') && lower.includes('50')) specialItemsTotal += 1500;
          else if (lower.includes('safe')) specialItemsTotal += 800;
          else if (lower.includes('artwork') || lower.includes('mirror')) specialItemsTotal += 400;
          else if (lower.includes('chandelier')) specialItemsTotal += 600;
        });
      }

      // 6. Packing Services
      let packingTotal = 0;
      // Estimate volume scale based on baseRate relative to studio (3500)
      // This scales costs for larger homes
      const sizeScale = Math.max(1, baseRate / (3500 * complexityMultiplier)); 
      
      if (formData.packingService === 'full') {
        packingTotal += Math.min(8000, 3000 * sizeScale);
      } else if (formData.packingService === 'partial') {
        packingTotal += Math.min(4000, 1500 * sizeScale);
      } else if (formData.packingService === 'materials-only') {
         packingTotal += Math.min(1500, 500 * sizeScale);
      }
      
      if (formData.needPackingMaterials) {
         packingTotal += Math.min(1500, 500 * sizeScale);
      }
      
      if (formData.unpackingService === 'yes' || formData.unpackingService === 'full') {
        packingTotal += Math.min(3000, 1000 * sizeScale);
      }

      // 7. Additional Services
      let additionalServicesTotal = 0;
      
      // Furniture assembly/disassembly - Estimate items based on sizeScale
      const estItems = Math.ceil(sizeScale * 3); 
      if (formData.disassembly) additionalServicesTotal += estItems * 150;
      if (formData.assembly) additionalServicesTotal += estItems * 200;
      
      // Appliances
      const applianceCount = formData.appliances?.length || 2; // Default to 2 if checked but no list
      if (formData.applianceDisconnect) additionalServicesTotal += applianceCount * 300;
      if (formData.applianceConnect) additionalServicesTotal += applianceCount * 350;
      
      if (formData.longCarry) additionalServicesTotal += 500;
      if (formData.shuttleService) additionalServicesTotal += 1500;
      if (formData.specialEquipment) additionalServicesTotal += 3000;

      const servicesTotal = packingTotal + additionalServicesTotal;

      // 8. Storage
      let storageTotal = 0;
      if (formData.storageNeeded) {
        let monthlyRate = 800; // Small
        if (formData.storageUnitSize === 'medium') monthlyRate = 1400;
        if (formData.storageUnitSize === 'large') monthlyRate = 2500;
        
        // Climate control check (assuming it might be in unit size or separate)
        if (formData.storageUnitSize?.includes('climate') || formData.specialInstructions?.toLowerCase().includes('climate')) {
            monthlyRate *= 1.3;
        }
        
        const months = Number(formData.storageDuration) || 1;
        storageTotal = monthlyRate * months;
      }

      // 9. Insurance
      let insuranceTotal = 0;
      if (formData.insuranceLevel === 'basic') insuranceTotal = 300;
      else if (formData.insuranceLevel === 'comprehensive') insuranceTotal = 800;
      else if (formData.insuranceLevel === 'premium') insuranceTotal = 1500;

      // 10. Time Multipliers
      let timeMultiplier = 1.0;
      if (formData.moveDate) {
        const date = new Date(formData.moveDate);
        const day = date.getDay();
        const month = date.getMonth(); // 0-11
        
        // Peak Season (Dec-Jan)
        if (month === 11 || month === 0) {
           timeMultiplier = Math.max(timeMultiplier, 1.15);
        }
        
        // Weekend
        if (day === 6) timeMultiplier = Math.max(timeMultiplier, 1.2); // Sat
        if (day === 0) timeMultiplier = Math.max(timeMultiplier, 1.5); // Sun
      }
      
      // Calculate Totals
      const taxableBase = baseRate + distanceFee + accessFees + specialItemsTotal + servicesTotal;
      const totalWithTime = taxableBase * timeMultiplier;
      const timeSurcharges = totalWithTime - taxableBase;
      
      const subtotal = totalWithTime;
      const total = subtotal + storageTotal + insuranceTotal;
      
      basePrice = total; // Set the main hook return price
      
      breakdownDetails.movingBreakdown = {
        baseMoveCost: baseRate,
        distanceFee,
        accessFees,
        specialItemsTotal,
        servicesTotal,
        storageTotal,
        insuranceTotal,
        timeSurcharges,
        subtotal,
        total
      };
      
      // Update generic breakdown fields for compatibility
      breakdownDetails.additionalFees = accessFees + distanceFee + specialItemsTotal + servicesTotal + storageTotal + insuranceTotal + timeSurcharges;
    }

    if (mappedServiceId === "au-pair") {
      // 1. Calculate Weekly Hours
      let days = 5;
      if (formData.daysPerWeek === 'mon-sat') days = 6;
      if (formData.daysPerWeek === '7-days') days = 7;
      if (formData.daysPerWeek === 'custom') days = 5;

      let dailyHours = 8;
      if (formData.hoursPerDay === '2-4') dailyHours = 3;
      if (formData.hoursPerDay === '5-8') dailyHours = 6.5;
      if (formData.hoursPerDay === '9-12') dailyHours = 10.5;
      if (formData.hoursPerDay === 'full-day') dailyHours = 12;

      const weeklyHours = days * dailyHours;

      // 2. Base Monthly Rates
      basePrice = 0; 
      
      switch (formData.careType) {
        case 'full-time-live-in':
          basePrice = weeklyHours >= 36 ? 8500 : 6500;
          break;
        case 'part-time':
          basePrice = weeklyHours >= 16 ? 5000 : 3500;
          break;
        case 'after-school':
          basePrice = 2800;
          break;
        case 'emergency':
          // R250/day * days/week * 4.33 weeks/month (Estimated Monthly)
          basePrice = Math.round(250 * days * 4.33); 
          break;
        case 'specialized':
           // Specialized (Special needs): Base rate x 1.3
           // Using Full-Time logic as base for calculation
           const base = weeklyHours >= 36 ? 8500 : 6500;
           basePrice = base * 1.3;
           break;
        default:
           basePrice = 3500;
      }

      // 3. Additional Costs (Monthly)
      
      // Driving duties: +R800/month
      if (formData.selectedDuties?.includes('school-transport') || formData.specificSkills?.toLowerCase().includes('driving')) {
        basePrice += 800;
      }

      // Weekend care: +R1,200/month
      if (formData.weekendAvailability === 'regularly') {
         basePrice += 1200;
      }

      // Overnight care: +R1,500/month
      if (formData.overnightCare === 'regularly' || formData.overnightCare === 'always') {
        basePrice += 1500;
      }

      // Multiple children surcharge: +R500/month per additional child (after 2nd)
      const numChildren = parseInt(formData.childrenCount || "1", 10);
      if (numChildren > 2) {
        basePrice += (numChildren - 2) * 500;
      }

      // Newborn care (0-12 months): +R1,000/month
      const hasNewborn = formData.childAges?.some((age: string) => age === '0-3m' || age === '3-12m');
      if (hasNewborn) {
        basePrice += 1000;
      }

      // Special needs care: +R1,500/month
      // Apply if not already charged via "Specialized" rate
      if (formData.careType !== 'specialized' && formData.hasSpecialNeeds) {
        basePrice += 1500;
      }

      // 4. One-time Fees
      // Placement fee: R2,500
      // Background check: R350
      oneTimeFees = 2500 + 350;
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
      estimatedHours,
      oneTimeFees,
      ...breakdownDetails
    };
  }, [mappedServiceId, serviceConfigs, formData]);

  return pricing;
}
