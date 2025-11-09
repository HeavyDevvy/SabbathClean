// Payment Aggregation Utility for Multi-Service Bookings
// Handles pricing calculation and summary generation for multiple services

export interface ServiceDraft {
  serviceId: string;
  serviceName: string;
  pricing: {
    basePrice: number;
    addOnsPrice: number;
    materialsDiscount: number;
    recurringDiscount: number;
    timeDiscount: number;
    totalPrice: number;
  };
  selectedProvider?: any;
  preferredDate?: string;
  timePreference?: string;
  selectedAddOns?: any[];
}

export interface AggregatedPayment {
  services: ServiceDraft[];
  subtotal: number;
  totalAddOns: number;
  totalDiscounts: number;
  grandTotal: number;
  commission: number; // 15% platform fee
  lineItems: {
    serviceId: string;
    serviceName: string;
    basePrice: number;
    addOns: number;
    discounts: number;
    total: number;
  }[];
}

export function aggregatePayments(drafts: ServiceDraft[], currentService?: ServiceDraft): AggregatedPayment {
  const allServices = currentService ? [...drafts, currentService] : drafts;
  
  const lineItems = allServices.map(service => ({
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    basePrice: service.pricing.basePrice,
    addOns: service.pricing.addOnsPrice,
    discounts: service.pricing.materialsDiscount + service.pricing.recurringDiscount + service.pricing.timeDiscount,
    total: service.pricing.totalPrice
  }));
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.basePrice, 0);
  const totalAddOns = lineItems.reduce((sum, item) => sum + item.addOns, 0);
  const totalDiscounts = lineItems.reduce((sum, item) => sum + item.discounts, 0);
  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const commission = Math.round(grandTotal * 0.15); // 15% platform fee
  
  return {
    services: allServices,
    subtotal,
    totalAddOns,
    totalDiscounts,
    grandTotal,
    commission,
    lineItems
  };
}
