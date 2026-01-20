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
  serviceCategory?: string; // Generic category fallback
  cleaningType: string;
  propertySize: string;
  gardenSize: string;
  gardenCondition: string;
  poolSize: string;
  poolCondition: string;
  urgency: string;
  plumbingIssue: string;
  electricalIssue: string;
  
  // Locksmith specific
  locksmithCategory: string;
  locksmithServiceType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  keyType: string;
  isKeyInIgnition: boolean;
  lockType: string;
  numberOfLocks: number;
  rekeyAll: boolean;
  businessType: string;
  numberOfDoors: number;
  accessControl: boolean;
  masterKey: boolean;
  isDanger: boolean;
  
  // Chef & Catering specific
  cuisineType: string;
  menuSelection: string;
  selectedMenu: string;
  customMenuItems: string[];
  dietaryRequirements: string[];
  dietaryNotes?: string; // For Waitering/Au Pair free text
  eventSize: string;

  // Event Staff / Waitering specific
  eventType?: string;
  eventDate?: string;
  eventStartTime?: string;
  eventDuration?: string;
  numberOfGuests?: string;
  eventFormality?: string;
  venueType?: string;
  venueAddress?: string;
  travelDistanceKm?: number;
  waitersCount?: number;
  bartendersCount?: number;
  cateringAssistantsCount?: number;
  coordinatorRequired?: boolean;
  uniformPreference?: string;
  serviceTypes?: string[];
  mealType?: string;
  numberOfCourses?: string;
  serviceStyle?: string;
  barServiceType?: string;
  staffArrivalTime?: string;
  serviceStartTime?: string;
  serviceEndTime?: string;
  breakRequirements?: string;
  venueEquipment?: boolean;
  staffEquipmentRequired?: boolean;
  glasswareProvided?: boolean;
  cutleryProvided?: boolean;
  barSetupRequired?: boolean;
  servingInstructions?: string;
  culturalConsiderations?: string;
  vipHandling?: string;
  timingRequirements?: string;
  healthSafety?: string;
  accessParking?: string;
  experienceLevelRequired?: string;
  
  // Au Pair specific
  careType?: string;
  childrenCount?: string;
  childAges?: string[];
  hasSpecialNeeds?: boolean;
  specialNeedsDescription?: string;
  petType?: string;
  accommodationType?: string;
  startDate?: string;
  contractDuration?: string;
  daysPerWeek?: string;
  hoursPerDay?: string;
  overnightCare?: string;
  weekendAvailability?: string;
  selectedDuties?: string[];
  drivingRequired?: boolean;
  preferredLanguage?: string;
  educationLevel?: string;
  experienceLevel?: string;
  specificSkills?: string;
  dailyRoutine?: string;
  houseRules?: string;

  // Moving Service specific
  moveType?: string;
  moveCategory?: string;
  moveDate?: string;
  preferredTime?: string;
  moveSize?: string;
  estimatedVolume?: string;
  isCompleteMove?: boolean;
  originPropertyType?: string;
  originFloor?: string;
  originElevator?: boolean;
  originStairs?: string;
  originParking?: boolean;
  originAddress?: string;
  originRestrictions?: string;
  destPropertyType?: string;
  destFloor?: string;
  destElevator?: boolean;
  destStairs?: string;
  destParking?: boolean;
  destAddress?: string;
  destRestrictions?: string;
  distance?: string | number;
  furniture?: Record<string, number>;
  appliances?: string[];
  specialItems?: string[];
  boxCounts?: { small: number; medium: number; large: number; wardrobe: number };
  packingService?: string | boolean;
  unpackingService?: string | boolean;
  disassembly?: boolean;
  assembly?: boolean;
  applianceDisconnect?: boolean;
  applianceConnect?: boolean;
  needPackingMaterials?: boolean;
  customCrating?: boolean;
  storageNeeded?: boolean;
  storageDuration?: string | number;
  storageUnitSize?: string;
  insuranceLevel?: string;
  cleaningOld?: boolean;
  cleaningNew?: boolean;
  longCarry?: boolean;
  narrowDoorways?: boolean;
  shuttleService?: boolean;
  specialEquipment?: boolean;
  dateFlexible?: boolean;
  latestDate?: string;
  timeConstraints?: string;
  specialInstructions?: string;
  fragileDescription?: string;
  valuablesList?: string;
  accessDetails?: string;
  budgetRange?: string;
  priority?: string;

  // Beauty & Wellness specific
  beautyServices?: string[];
  serviceQuantities?: Record<string, number>;
  beautyCategory?: string;
  beautyTreatment?: string;
  hairLength?: string;
  hairTexture?: string;
  nailType?: string;
  skinType?: string;
  massageType?: string;
  makeupOccasion?: string;
  genderPreference?: string;
  
  // Selections
  selectedAddOns: string[];
  selectedProvider: any | null;
  specialRequests: string;
  
  // HOUSE CLEANING ONLY: Tip amount for provider
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
    serviceCategory: "",
    cleaningType: "",
    propertySize: "",
    gardenSize: "",
    gardenCondition: "",
    poolSize: "",
    poolCondition: "",
    urgency: "standard",
    plumbingIssue: "",
    electricalIssue: "",
    
    // Locksmith specific
    locksmithCategory: "",
    locksmithServiceType: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    keyType: "",
    isKeyInIgnition: false,
    lockType: "",
    numberOfLocks: 0,
    rekeyAll: false,
    businessType: "",
    numberOfDoors: 0,
    accessControl: false,
    masterKey: false,
    isDanger: false,
    
    // Chef & Catering specific
    cuisineType: "",
    menuSelection: "popular",
    selectedMenu: "",
    customMenuItems: [],
    dietaryRequirements: [],
    eventSize: "",

    // Event Staff / Waitering specific
    eventType: "",
    eventDate: "",
    eventStartTime: "",
    eventDuration: "",
    numberOfGuests: "",
    eventFormality: "",
    venueType: "",
    venueAddress: "",
    travelDistanceKm: 0,
    waitersCount: 0,
    bartendersCount: 0,
    cateringAssistantsCount: 0,
    coordinatorRequired: false,
    uniformPreference: "",
    serviceTypes: [],
    mealType: "",
    numberOfCourses: "",
    serviceStyle: "",
    barServiceType: "",
    staffArrivalTime: "",
    serviceStartTime: "",
    serviceEndTime: "",
    breakRequirements: "",
    venueEquipment: false,
    staffEquipmentRequired: false,
    glasswareProvided: false,
    cutleryProvided: false,
    barSetupRequired: false,
    servingInstructions: "",
    culturalConsiderations: "",
    vipHandling: "",
    timingRequirements: "",
    healthSafety: "",
    accessParking: "",
    experienceLevelRequired: "",
    
    // Au Pair specific
    careType: "",
    childrenCount: "",
    childAges: [],
    hasSpecialNeeds: false,
    specialNeedsDescription: "",
    petType: "",
    accommodationType: "",
    startDate: "",
    contractDuration: "",
    daysPerWeek: "",
    hoursPerDay: "",
    overnightCare: "",
    weekendAvailability: "",
    selectedDuties: [],
    drivingRequired: false,
    preferredLanguage: "",
    educationLevel: "",
    experienceLevel: "",
    specificSkills: "",
    dailyRoutine: "",
    houseRules: "",

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
      
      // Locksmith specific
      locksmithCategory: (isEditing || isPrefilling) ? (dataSource.locksmithCategory || "") : "",
      locksmithServiceType: (isEditing || isPrefilling) ? (dataSource.locksmithServiceType || "") : "",
      vehicleMake: (isEditing || isPrefilling) ? (dataSource.vehicleMake || "") : "",
      vehicleModel: (isEditing || isPrefilling) ? (dataSource.vehicleModel || "") : "",
      vehicleYear: (isEditing || isPrefilling) ? (dataSource.vehicleYear || "") : "",
      keyType: (isEditing || isPrefilling) ? (dataSource.keyType || "") : "",
      isKeyInIgnition: (isEditing || isPrefilling) ? (dataSource.isKeyInIgnition || false) : false,
      lockType: (isEditing || isPrefilling) ? (dataSource.lockType || "") : "",
      numberOfLocks: (isEditing || isPrefilling) ? (dataSource.numberOfLocks || 0) : 0,
      rekeyAll: (isEditing || isPrefilling) ? (dataSource.rekeyAll || false) : false,
      businessType: (isEditing || isPrefilling) ? (dataSource.businessType || "") : "",
      numberOfDoors: (isEditing || isPrefilling) ? (dataSource.numberOfDoors || 0) : 0,
      accessControl: (isEditing || isPrefilling) ? (dataSource.accessControl || false) : false,
      masterKey: (isEditing || isPrefilling) ? (dataSource.masterKey || false) : false,
      isDanger: (isEditing || isPrefilling) ? (dataSource.isDanger || false) : false,
      
      // Chef & Catering specific
      cuisineType: (isEditing || isPrefilling) ? (dataSource.cuisineType || "") : "",
      menuSelection: (isEditing || isPrefilling) ? (dataSource.menuSelection || "popular") : "popular",
      selectedMenu: (isEditing || isPrefilling) ? (dataSource.selectedMenu || "") : "",
      customMenuItems: (isEditing || isPrefilling) ? (dataSource.customMenuItems || []) : [],
      dietaryRequirements: (isEditing || isPrefilling) ? (dataSource.dietaryRequirements || []) : [],
      eventSize: (isEditing || isPrefilling) ? (dataSource.eventSize || "") : "",

      // Au Pair specific
      careType: (isEditing || isPrefilling) ? (dataSource.careType || "") : "",
      childrenCount: (isEditing || isPrefilling) ? (dataSource.childrenCount || "") : "",
      childAges: (isEditing || isPrefilling) ? (dataSource.childAges || []) : [],
      hasSpecialNeeds: (isEditing || isPrefilling) ? (dataSource.hasSpecialNeeds || false) : false,
      specialNeedsDescription: (isEditing || isPrefilling) ? (dataSource.specialNeedsDescription || "") : "",
      petType: (isEditing || isPrefilling) ? (dataSource.petType || "") : "",
      accommodationType: (isEditing || isPrefilling) ? (dataSource.accommodationType || "") : "",
      startDate: (isEditing || isPrefilling) ? (dataSource.startDate || "") : "",
      contractDuration: (isEditing || isPrefilling) ? (dataSource.contractDuration || "") : "",
      daysPerWeek: (isEditing || isPrefilling) ? (dataSource.daysPerWeek || "") : "",
      hoursPerDay: (isEditing || isPrefilling) ? (dataSource.hoursPerDay || "") : "",
      overnightCare: (isEditing || isPrefilling) ? (dataSource.overnightCare || "") : "",
      weekendAvailability: (isEditing || isPrefilling) ? (dataSource.weekendAvailability || "") : "",
      selectedDuties: (isEditing || isPrefilling) ? (dataSource.selectedDuties || []) : [],
      drivingRequired: (isEditing || isPrefilling) ? (dataSource.drivingRequired || false) : false,
      preferredLanguage: (isEditing || isPrefilling) ? (dataSource.preferredLanguage || "") : "",
      educationLevel: (isEditing || isPrefilling) ? (dataSource.educationLevel || "") : "",
      experienceLevel: (isEditing || isPrefilling) ? (dataSource.experienceLevel || "") : "",
      specificSkills: (isEditing || isPrefilling) ? (dataSource.specificSkills || "") : "",
      dailyRoutine: (isEditing || isPrefilling) ? (dataSource.dailyRoutine || "") : "",
      houseRules: (isEditing || isPrefilling) ? (dataSource.houseRules || "") : "",
      dietaryNotes: (isEditing || isPrefilling) ? (dataSource.dietaryNotes || "") : "",

      // Event Staff specific
      eventType: (isEditing || isPrefilling) ? (dataSource.eventType || "") : "",
      eventDate: (isEditing || isPrefilling) ? (dataSource.eventDate || "") : "",
      eventStartTime: (isEditing || isPrefilling) ? (dataSource.eventStartTime || "") : "",
      eventDuration: (isEditing || isPrefilling) ? (dataSource.eventDuration || "") : "",
      numberOfGuests: (isEditing || isPrefilling) ? (dataSource.numberOfGuests || "") : "",
      eventFormality: (isEditing || isPrefilling) ? (dataSource.eventFormality || "") : "",
      venueType: (isEditing || isPrefilling) ? (dataSource.venueType || "") : "",
      venueAddress: (isEditing || isPrefilling) ? (dataSource.venueAddress || "") : "",
      waitersCount: (isEditing || isPrefilling) ? (dataSource.waitersCount || 0) : 0,
      bartendersCount: (isEditing || isPrefilling) ? (dataSource.bartendersCount || 0) : 0,
      cateringAssistantsCount: (isEditing || isPrefilling) ? (dataSource.cateringAssistantsCount || 0) : 0,
      coordinatorRequired: (isEditing || isPrefilling) ? (dataSource.coordinatorRequired || false) : false,
      uniformPreference: (isEditing || isPrefilling) ? (dataSource.uniformPreference || "") : "",
      serviceTypes: (isEditing || isPrefilling) ? (dataSource.serviceTypes || []) : [],
      mealType: (isEditing || isPrefilling) ? (dataSource.mealType || "") : "",
      numberOfCourses: (isEditing || isPrefilling) ? (dataSource.numberOfCourses || "") : "",
      serviceStyle: (isEditing || isPrefilling) ? (dataSource.serviceStyle || "") : "",
      barServiceType: (isEditing || isPrefilling) ? (dataSource.barServiceType || "") : "",
      staffArrivalTime: (isEditing || isPrefilling) ? (dataSource.staffArrivalTime || "") : "",
      serviceStartTime: (isEditing || isPrefilling) ? (dataSource.serviceStartTime || "") : "",
      serviceEndTime: (isEditing || isPrefilling) ? (dataSource.serviceEndTime || "") : "",
      breakRequirements: (isEditing || isPrefilling) ? (dataSource.breakRequirements || "") : "",
      venueEquipment: (isEditing || isPrefilling) ? (dataSource.venueEquipment || false) : false,
      staffEquipmentRequired: (isEditing || isPrefilling) ? (dataSource.staffEquipmentRequired || false) : false,
      glasswareProvided: (isEditing || isPrefilling) ? (dataSource.glasswareProvided || false) : false,
      cutleryProvided: (isEditing || isPrefilling) ? (dataSource.cutleryProvided || false) : false,
      barSetupRequired: (isEditing || isPrefilling) ? (dataSource.barSetupRequired || false) : false,
      servingInstructions: (isEditing || isPrefilling) ? (dataSource.servingInstructions || "") : "",
      culturalConsiderations: (isEditing || isPrefilling) ? (dataSource.culturalConsiderations || "") : "",
      vipHandling: (isEditing || isPrefilling) ? (dataSource.vipHandling || "") : "",
      timingRequirements: (isEditing || isPrefilling) ? (dataSource.timingRequirements || "") : "",
      healthSafety: (isEditing || isPrefilling) ? (dataSource.healthSafety || "") : "",
      accessParking: (isEditing || isPrefilling) ? (dataSource.accessParking || "") : "",
      experienceLevelRequired: (isEditing || isPrefilling) ? (dataSource.experienceLevelRequired || "") : "",
      
      // Beauty & Wellness specific
      beautyServices: (isEditing || isPrefilling) ? (dataSource.beautyServices || []) : [],
      serviceQuantities: (isEditing || isPrefilling) ? (dataSource.serviceQuantities || {}) : {},
      beautyCategory: (isEditing || isPrefilling) ? (dataSource.beautyCategory || "") : "",
      
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
