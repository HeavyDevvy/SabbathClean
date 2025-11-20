/**
 * Booking Hooks - Business logic extracted from modern-service-modal.tsx
 * 
 * These hooks encapsulate the core booking flow logic:
 * - useBookingFlow: State management with useReducer
 * - usePriceEstimation: Dynamic pricing calculations
 * - useServiceValidation: Payment validation
 */

export { useBookingFlow } from './useBookingFlow';
export type { BookingFlowState, BookingFormData as BookingFlowFormData, BookingFlowOptions } from './useBookingFlow';

export { usePriceEstimation } from './usePriceEstimation';
export type { PricingBreakdown, BookingFormData as PriceEstimationFormData } from './usePriceEstimation';

export { useServiceValidation, formatCardNumber, formatExpiryDate, detectCardBrand } from './useServiceValidation';
export type { ValidationErrors, PaymentFormData } from './useServiceValidation';
