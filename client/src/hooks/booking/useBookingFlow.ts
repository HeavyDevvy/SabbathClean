import { useReducer, useCallback } from "react";

export interface BookingFlowState {
  step: number;
  formData: BookingFormData;
  showConfirmation: boolean;
  confirmedBookingData: any | null;
}

export interface BookingFormData {
  // Core fields
  propertyType: string;
  address: string;
  gateCode: string;
  preferredDate: string;
  timePreference: string;
  recurringSchedule: string;
  materials: string;
  insurance: boolean;
  
  // Service-specific fields
  cleaningType: string;
  propertySize: string;
  gardenSize: string;
  gardenCondition: string;
  poolSize: string;
  poolCondition: string;
  urgency: string;
  plumbingIssue: string;
  electricalIssue: string;
  
  // Chef & Catering specific
  cuisineType: string;
  menuSelection: string;
  selectedMenu: string;
  customMenuItems: string[];
  dietaryRequirements: string[];
  eventSize: string;
  
  // Selections
  selectedAddOns: string[];
  selectedProvider: any | null;
  specialRequests: string;
  
  // House cleaning: Tip amount
  tipAmount: number;
  
  // Payment information
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  selectedBank: string;
  bankAccount: string;
  bankBranch: string;
}

type BookingFlowAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<BookingFormData> }
  | { type: 'SET_FORM_DATA'; payload: BookingFormData }
  | { type: 'SHOW_CONFIRMATION'; payload: any }
  | { type: 'HIDE_CONFIRMATION' }
  | { type: 'RESET_FLOW'; payload: Partial<BookingFormData> };

function bookingFlowReducer(state: BookingFlowState, action: BookingFlowAction): BookingFlowState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    
    case 'PREV_STEP':
      return { ...state, step: Math.max(1, state.step - 1) };
    
    case 'SET_STEP':
      return { ...state, step: action.payload };
    
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload }
      };
    
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    
    case 'SHOW_CONFIRMATION':
      return {
        ...state,
        showConfirmation: true,
        confirmedBookingData: action.payload
      };
    
    case 'HIDE_CONFIRMATION':
      return {
        ...state,
        showConfirmation: false,
        confirmedBookingData: null
      };
    
    case 'RESET_FLOW':
      return {
        step: 1,
        showConfirmation: false,
        confirmedBookingData: null,
        formData: {
          ...createDefaultFormData(),
          ...action.payload
        }
      };
    
    default:
      return state;
  }
}

function createDefaultFormData(): BookingFormData {
  return {
    // Core fields
    propertyType: "",
    address: "",
    gateCode: "",
    preferredDate: "",
    timePreference: "",
    recurringSchedule: "one-time",
    materials: "supply",
    insurance: false,
    
    // Service-specific
    cleaningType: "",
    propertySize: "",
    gardenSize: "",
    gardenCondition: "",
    poolSize: "",
    poolCondition: "",
    urgency: "standard",
    plumbingIssue: "",
    electricalIssue: "",
    
    // Chef & Catering specific
    cuisineType: "",
    menuSelection: "popular",
    selectedMenu: "",
    customMenuItems: [],
    dietaryRequirements: [],
    eventSize: "",
    
    // Selections
    selectedAddOns: [],
    selectedProvider: null,
    specialRequests: "",
    
    // House cleaning: Tip amount
    tipAmount: 0,
    
    // Payment information
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    selectedBank: "",
    bankAccount: "",
    bankBranch: ""
  };
}

export interface BookingFlowOptions {
  editBookingData?: any;
  preSelectedProviderId?: string;
  preSelectedProviderName?: string;
  prefillFromRecent?: any;
}

/**
 * Hook for managing booking flow state and navigation
 * Uses useReducer pattern for complex state management
 */
export function useBookingFlow(options: BookingFlowOptions = {}) {
  const {
    editBookingData,
    preSelectedProviderId,
    preSelectedProviderName,
    prefillFromRecent
  } = options;

  // Determine initial form data from options
  const initialFormData = (): BookingFormData => {
    const defaults = createDefaultFormData();
    
    // Check prefill sources in priority order
    const dataSource = editBookingData || prefillFromRecent || {};
    const isEditing = !!editBookingData;
    const isPrefilling = !!prefillFromRecent;
    
    return {
      ...defaults,
      // Core fields
      propertyType: (isEditing || isPrefilling) ? (dataSource.propertyType || "") : "",
      address: (isEditing || isPrefilling) ? (dataSource.address || "") : "",
      gateCode: (isEditing || isPrefilling) ? (dataSource.gateCode || "") : "",
      preferredDate: (isEditing || isPrefilling) ? (dataSource.preferredDate || "") : "",
      timePreference: (isEditing || isPrefilling) ? (dataSource.timePreference || "") : "",
      recurringSchedule: (isEditing || isPrefilling) ? (dataSource.recurringSchedule || "one-time") : "one-time",
      materials: (isEditing || isPrefilling) ? (dataSource.materials || "supply") : "supply",
      insurance: (isEditing || isPrefilling) ? (dataSource.insurance || false) : false,
      
      // Service-specific
      cleaningType: (isEditing || isPrefilling) ? (dataSource.cleaningType || "") : "",
      propertySize: (isEditing || isPrefilling) ? (dataSource.propertySize || "") : "",
      gardenSize: (isEditing || isPrefilling) ? (dataSource.gardenSize || "") : "",
      gardenCondition: (isEditing || isPrefilling) ? (dataSource.gardenCondition || "") : "",
      poolSize: (isEditing || isPrefilling) ? (dataSource.poolSize || "") : "",
      poolCondition: (isEditing || isPrefilling) ? (dataSource.poolCondition || "") : "",
      urgency: (isEditing || isPrefilling) ? (dataSource.urgency || "standard") : "standard",
      plumbingIssue: (isEditing || isPrefilling) ? (dataSource.plumbingIssue || "") : "",
      electricalIssue: (isEditing || isPrefilling) ? (dataSource.electricalIssue || "") : "",
      
      // Chef & Catering specific
      cuisineType: (isEditing || isPrefilling) ? (dataSource.cuisineType || "") : "",
      menuSelection: (isEditing || isPrefilling) ? (dataSource.menuSelection || "popular") : "popular",
      selectedMenu: (isEditing || isPrefilling) ? (dataSource.selectedMenu || "") : "",
      customMenuItems: (isEditing || isPrefilling) ? (dataSource.customMenuItems || []) : [],
      dietaryRequirements: (isEditing || isPrefilling) ? (dataSource.dietaryRequirements || []) : [],
      eventSize: (isEditing || isPrefilling) ? (dataSource.eventSize || "") : "",
      
      // Selections
      selectedAddOns: (isEditing || isPrefilling) ? (dataSource.selectedAddOns || []) : [],
      selectedProvider: (isEditing || isPrefilling) ? (dataSource.selectedProvider || (preSelectedProviderId ? {
        id: preSelectedProviderId,
        name: preSelectedProviderName || "Berry Star Provider",
        rating: 4.9,
        totalReviews: 150,
        reviews: 150,
        hourlyRate: 350,
        distance: "2.5 km",
        specializations: ["Berry Star", "Top Rated"],
        verified: true,
        verifiedBadges: ["Berry Star", "Verified", "Top Rated"],
        responseTime: "< 1 hour"
      } : null)) : (preSelectedProviderId ? {
        id: preSelectedProviderId,
        name: preSelectedProviderName || "Berry Star Provider",
        rating: 4.9,
        totalReviews: 150,
        reviews: 150,
        hourlyRate: 350,
        distance: "2.5 km",
        specializations: ["Berry Star", "Top Rated"],
        verified: true,
        verifiedBadges: ["Berry Star", "Verified", "Top Rated"],
        responseTime: "< 1 hour"
      } : null),
      specialRequests: (isEditing || isPrefilling) ? (dataSource.specialRequests || "") : "",
      
      // House cleaning: Tip amount
      tipAmount: (isEditing || isPrefilling) ? (dataSource.tipAmount || 0) : 0,
      
      // Payment - never prefill payment details
      paymentMethod: "card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      selectedBank: "",
      bankAccount: "",
      bankBranch: ""
    };
  };

  const [state, dispatch] = useReducer(bookingFlowReducer, {
    step: 1,
    showConfirmation: false,
    confirmedBookingData: null,
    formData: initialFormData()
  });

  // Action dispatchers with useCallback for stable references
  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const updateFormData = useCallback((updates: Partial<BookingFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: updates });
  }, []);

  const setFormData = useCallback((formData: BookingFormData) => {
    dispatch({ type: 'SET_FORM_DATA', payload: formData });
  }, []);

  const showConfirmation = useCallback((bookingData: any) => {
    dispatch({ type: 'SHOW_CONFIRMATION', payload: bookingData });
  }, []);

  const hideConfirmation = useCallback(() => {
    dispatch({ type: 'HIDE_CONFIRMATION' });
  }, []);

  const resetFlow = useCallback((initialData: Partial<BookingFormData> = {}) => {
    dispatch({ type: 'RESET_FLOW', payload: initialData });
  }, []);

  return {
    // State
    step: state.step,
    formData: state.formData,
    showConfirmation: state.showConfirmation,
    confirmedBookingData: state.confirmedBookingData,
    
    // Actions
    nextStep,
    prevStep,
    setStep,
    updateFormData,
    setFormData,
    showConfirmationDialog: showConfirmation,
    hideConfirmation,
    resetFlow
  };
}
