import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Sparkles, 
  Scissors, 
  Droplets, 
  Droplet,
  Star,
  CheckCircle,
  CreditCard,
  Building,
  Zap,
  TreePine,
  ChefHat,
  Users,
  Wrench,
  Shield,
  AlertCircle,
  Lock as LockIcon,
  ShoppingCart,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useCart } from "@/contexts/CartContext";
import BookingConfirmationModal from "./booking-confirmation-modal";
import CustomServiceContact from "./custom-service-contact";
import CleaningServiceForm from "./booking-forms/CleaningServiceForm";
import GardenServiceForm from "./booking-forms/GardenServiceForm";
import PoolServiceForm from "./booking-forms/PoolServiceForm";
import PlumbingServiceForm from "./booking-forms/PlumbingServiceForm";
import ElectricalServiceForm from "./booking-forms/ElectricalServiceForm";
import EventStaffForm from "./booking-forms/EventStaffForm";
import ChefCateringForm from "./booking-forms/ChefCateringForm";
import { LocationStep } from "./booking-steps/LocationStep";
import ScheduleStep from "./booking-steps/ScheduleStep";
import AddOnsStep from "./booking-steps/AddOnsStep";
import { ReviewStep } from "./booking-steps/ReviewStep";
import { PaymentStep } from "./booking-steps/PaymentStep";
import { serviceAddOns, suggestAddOns, type AddOn } from "../../../config/addons";
import { serviceEstimates, calculateEstimatedHours } from "../../../config/estimates";
import { southAfricanBanks, validateAccountNumber } from "../../../config/banks";
import { aggregatePayments } from "@/lib/paymentAggregator";
import { serviceConfigs, serviceIdMapping } from "@/config/service-configs";
import {
  getCardBrand,
  formatCardNumber,
  formatExpiryDate,
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  validateCardholderName,
  validateSelectedBank,
  validateBankAccount,
  validateBankBranch
} from "@/utils/payment-validation";

interface ModernServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onServiceSelect?: (serviceId: string, prefillData?: any) => void;
  onBookingComplete: (bookingData: any) => void;
  editBookingData?: any; // For editing existing bookings
  bookedServices?: string[]; // Track services already booked in this session
  pendingDrafts?: any[]; // Store service drafts before payment (multi-service)
  onAddAnotherService?: (draftData: any) => void; // Callback when adding another service with full draft data
  preSelectedProviderId?: string; // Pre-selected provider (e.g., Berry Stars)
  preSelectedProviderName?: string; // Pre-selected provider name
  recentOrders?: any[]; // Recent order history to show last used services
  prefillFromRecent?: any; // Pre-fill data from recent booking
}

export default function ModernServiceModal({
  isOpen,
  onClose,
  serviceId,
  onServiceSelect,
  onBookingComplete,
  editBookingData,
  bookedServices = [],
  pendingDrafts = [],
  onAddAnotherService,
  preSelectedProviderId,
  preSelectedProviderName,
  recentOrders = [],
  prefillFromRecent
}: ModernServiceModalProps) {
  const { toast } = useToast();
  const { addToCart, itemCount } = useCart();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any>(null);
  const [addOnsComment, setAddOnsComment] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [suggestedAddOnsFromComment, setSuggestedAddOnsFromComment] = useState<AddOn[]>([]);
  const [providerDetailsModal, setProviderDetailsModal] = useState<any>(null);
  
  // ADDED: Debounce add-ons comment to prevent excessive keyword matching on every keystroke
  const debouncedComment = useDebounce(addOnsComment, 400);
  
  // Payment validation state
  const [paymentTouched, setPaymentTouched] = useState({
    cardNumber: false,
    expiryDate: false,
    cvv: false,
    cardholderName: false,
    selectedBank: false,
    bankAccount: false,
    bankBranch: false
  });
  
  const [paymentErrors, setPaymentErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    selectedBank: "",
    bankAccount: "",
    bankBranch: ""
  });
  
  const [formData, setFormData] = useState({
    // Core fields
    propertyType: editBookingData?.propertyType || "",
    address: editBookingData?.address || "",
    gateCode: editBookingData?.gateCode || "", // Phase 3.2: Secure with encryption
    preferredDate: editBookingData?.preferredDate || "",
    timePreference: editBookingData?.timePreference || "",
    recurringSchedule: editBookingData?.recurringSchedule || "one-time",
    materials: editBookingData?.materials || "supply",
    insurance: editBookingData?.insurance || false,
    
    // Service-specific
    cleaningType: editBookingData?.cleaningType || "",
    propertySize: editBookingData?.propertySize || "",
    gardenSize: editBookingData?.gardenSize || "",
    gardenCondition: editBookingData?.gardenCondition || "",
    poolSize: editBookingData?.poolSize || "",
    poolCondition: editBookingData?.poolCondition || "",
    urgency: editBookingData?.urgency || "standard",
    plumbingIssue: editBookingData?.plumbingIssue || "",
    electricalIssue: editBookingData?.electricalIssue || "",
    
    // Chef & Catering specific
    cuisineType: editBookingData?.cuisineType || "",
    menuSelection: editBookingData?.menuSelection || "popular", // "popular" or "custom"
    selectedMenu: editBookingData?.selectedMenu || "",
    customMenuItems: editBookingData?.customMenuItems || [] as string[],
    dietaryRequirements: editBookingData?.dietaryRequirements || [] as string[],
    eventSize: editBookingData?.eventSize || "",
    
    // Selections
    selectedAddOns: editBookingData?.selectedAddOns || [] as string[],
    selectedProvider: editBookingData?.selectedProvider || (preSelectedProviderId ? { 
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
    } : null) as any,
    specialRequests: editBookingData?.specialRequests || "",
    
    // HOUSE CLEANING ONLY: Tip amount for provider
    tipAmount: editBookingData?.tipAmount || 0,
    
    // Payment information
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    selectedBank: "",
    bankAccount: "",
    bankBranch: ""
  });

  // Phase 5.2: Berry Stars pre-selection flag
  const hasPreselectedProvider = useMemo(() => {
    return !!preSelectedProviderId && !!formData.selectedProvider;
  }, [preSelectedProviderId, formData.selectedProvider]);

  // Derive card brand from card number
  const cardBrand = useMemo(() => getCardBrand(formData.cardNumber), [formData.cardNumber]);

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "cardNumber":
        error = validateCardNumber(value);
        break;
      case "expiryDate":
        error = validateExpiryDate(value);
        break;
      case "cvv":
        error = validateCVV(value, cardBrand);
        break;
      case "cardholderName":
        error = validateCardholderName(value);
        break;
      case "selectedBank":
        error = validateSelectedBank(value);
        break;
      case "bankAccount":
        error = validateBankAccount(value, formData.selectedBank, validateAccountNumber, southAfricanBanks);
        break;
      case "bankBranch":
        error = validateBankBranch(value);
        break;
    }
    setPaymentErrors(prev => ({ ...prev, [field]: error }));
    return error === "";
  };

  const validateAll = (): boolean => {
    if (formData.paymentMethod === "card") {
      const cardNumberError = validateCardNumber(formData.cardNumber);
      const expiryError = validateExpiryDate(formData.expiryDate);
      const cvvError = validateCVV(formData.cvv, cardBrand);
      const nameError = validateCardholderName(formData.cardholderName);
      
      setPaymentErrors({
        cardNumber: cardNumberError,
        expiryDate: expiryError,
        cvv: cvvError,
        cardholderName: nameError,
        selectedBank: "",
        bankAccount: "",
        bankBranch: ""
      });
      
      setPaymentTouched({
        cardNumber: true,
        expiryDate: true,
        cvv: true,
        cardholderName: true,
        selectedBank: false,
        bankAccount: false,
        bankBranch: false
      });
      
      return !cardNumberError && !expiryError && !cvvError && !nameError;
    } else if (formData.paymentMethod === "bank") {
      const bankError = validateSelectedBank(formData.selectedBank);
      const accountError = validateBankAccount(formData.bankAccount, formData.selectedBank, validateAccountNumber, southAfricanBanks);
      const branchError = validateBankBranch(formData.bankBranch);
      
      setPaymentErrors({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
        selectedBank: bankError,
        bankAccount: accountError,
        bankBranch: branchError
      });
      
      setPaymentTouched({
        cardNumber: false,
        expiryDate: false,
        cvv: false,
        cardholderName: false,
        selectedBank: true,
        bankAccount: true,
        bankBranch: true
      });
      
      return !bankError && !accountError && !branchError;
    }
    return false;
  };

  const markTouched = (field: string) => {
    setPaymentTouched(prev => ({ ...prev, [field]: true }));
  };

  const [pricing, setPricing] = useState({
    basePrice: 0,
    addOnsPrice: 0,
    materialsDiscount: 0,
    recurringDiscount: 0,
    timeDiscount: 0,
    totalPrice: 0
  });

  const [providers] = useState([
    {
      id: 1,
      name: "Thabo Mthembu",
      rating: 4.9,
      reviews: 156,
      distance: 3.2,
      specializations: ["Deep Cleaning", "Move In/Out"],
      verified: true,
      responseTime: "< 2 hours",
      // Enhanced profile fields (conditionally displayed based on service type)
      bio: "Professional service provider with 7+ years experience in home services. Known for reliability, attention to detail, and customer satisfaction.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      jobsCompleted: 156,
      qualifications: ["Certified Professional", "Health & Safety Trained", "Background Checked"],
      experience: 7,
      availability: "Mon-Sat"
    },
    {
      id: 2,
      name: "Nomsa Dlamini", 
      rating: 4.8,
      reviews: 203,
      distance: 5.7,
      specializations: ["Garden Design", "Lawn Care"],
      verified: true,
      responseTime: "< 1 hour",
      // Enhanced profile fields (conditionally displayed based on service type)
      bio: "Experienced home service professional with expertise across multiple service areas. Known for attention to detail and reliability. Fully insured and background-checked.",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      jobsCompleted: 203,
      qualifications: ["Certified Professional", "First Aid Trained", "Insured"],
      experience: 10,
      availability: "Mon-Fri"
    },
    {
      id: 3,
      name: "Sipho Ndlovu",
      rating: 4.7,
      reviews: 98,
      distance: 8.1,
      specializations: ["Emergency Services", "Quick Response"],
      verified: true,
      responseTime: "< 30 min",
      // Enhanced profile fields (conditionally displayed based on service type)
      bio: "Multi-skilled home services provider with fast response time and excellent problem-solving skills. Committed to quality service delivery.",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      jobsCompleted: 98,
      qualifications: ["Multi-Service Certified", "Emergency Response", "Licensed Professional"],
      experience: 5,
      availability: "7 days/week"
    }
  ]);

  const mappedServiceId = serviceId ? (serviceIdMapping[serviceId] || serviceId) : "";
  const currentConfig = mappedServiceId ? (serviceConfigs[mappedServiceId] || null) : null;
  
  // HOUSE CLEANING ONLY: Service-specific feature flag
  const isHouseCleaning = useMemo(() => 
    serviceId === "house-cleaning" || mappedServiceId === "cleaning", 
    [serviceId, mappedServiceId]
  );
  
  // PLUMBING SERVICE: Service-specific feature flag
  const isPlumbing = useMemo(() => 
    serviceId === "plumbing" || mappedServiceId === "plumbing", 
    [serviceId, mappedServiceId]
  );
  
  // ELECTRICAL SERVICE: Service-specific feature flag
  const isElectrical = useMemo(() => 
    serviceId === "electrical" || mappedServiceId === "electrical", 
    [serviceId, mappedServiceId]
  );
  
  // GARDEN SERVICES: Service-specific feature flags
  const isGardenService = useMemo(() => 
    serviceId === "gardening" || serviceId === "garden-care" || serviceId === "garden-maintenance" || 
    mappedServiceId === "garden-care", 
    [serviceId, mappedServiceId]
  );
  
  // POOL CLEANING SERVICE: Service-specific feature flag
  const isPoolService = useMemo(() => 
    serviceId === "pool-cleaning" || mappedServiceId === "pool-cleaning", 
    [serviceId, mappedServiceId]
  );
  
  // CHEF & CATERING SERVICE: Service-specific feature flag
  const isChefCatering = useMemo(() => 
    serviceId === "chef-catering" || mappedServiceId === "chef-catering", 
    [serviceId, mappedServiceId]
  );
  
  // WAITERING/EVENT STAFF SERVICE: Service-specific feature flag
  const isEventStaff = useMemo(() => 
    serviceId === "waitering" || serviceId === "event-staff" || 
    mappedServiceId === "event-staff", 
    [serviceId, mappedServiceId]
  );
  
  // MOVING SERVICE: Service-specific feature flag
  const isMoving = useMemo(() => 
    serviceId === "moving" || mappedServiceId === "moving", 
    [serviceId, mappedServiceId]
  );
  
  // AU PAIR SERVICE: Service-specific feature flag
  const isAuPair = useMemo(() => 
    serviceId === "au-pair" || mappedServiceId === "au-pair", 
    [serviceId, mappedServiceId]
  );
  
  // Show enhanced provider details with tip section and 2-button layout
  const showEnhancedProviderDetails = useMemo(() => 
    isHouseCleaning || isPlumbing || isElectrical || isGardenService || isPoolService || 
    isChefCatering || isEventStaff || isMoving || isAuPair,
    [isHouseCleaning, isPlumbing, isElectrical, isGardenService, isPoolService,
     isChefCatering, isEventStaff, isMoving, isAuPair]
  );
  
  // Check if plumbing service has urgent priority requiring one-time booking
  const isUrgentPlumbing = useMemo(() => 
    isPlumbing && ['emergency', 'urgent', 'same-day'].includes(formData.urgency),
    [isPlumbing, formData.urgency]
  );
  
  // Check if electrical service has urgent priority requiring one-time booking
  const isUrgentElectrical = useMemo(() => 
    isElectrical && ['emergency', 'urgent', 'next-day'].includes(formData.urgency),
    [isElectrical, formData.urgency]
  );
  
  // Check if recurring schedule should be disabled
  const shouldDisableRecurring = isUrgentPlumbing || isUrgentElectrical;
  
  // Service-specific placeholder suggestions for Comments field
  const servicePlaceholders: Record<string, string> = {
    "cleaning": "Example: Please focus on the kitchen and bathrooms. Use eco-friendly products. Deep clean the oven.",
    "house-cleaning": "Example: Please focus on the kitchen and bathrooms. Use eco-friendly products. Deep clean the oven.",
    "garden-care": "Example: Trim overgrown hedges along the fence. Mow the lawn and edge the driveway. Remove weeds from flower beds.",
    "garden-maintenance": "Example: Trim overgrown hedges along the fence. Mow the lawn and edge the driveway. Remove weeds from flower beds.",
    "pool-cleaning": "Example: Pool water is slightly green. Need chemical balancing and filter cleaning. Vacuum bottom and brush walls.",
    "plumbing": "Example: Leaking faucet in the kitchen sink. Low water pressure in upstairs bathroom. Fix running toilet.",
    "plumbing-services": "Example: Leaking faucet in the kitchen sink. Low water pressure in upstairs bathroom. Fix running toilet.",
    "electrical": "Example: Install dimmer switch in living room. Replace faulty outlet in bedroom. Check circuit breaker for kitchen.",
    "electrical-services": "Example: Install dimmer switch in living room. Replace faulty outlet in bedroom. Check circuit breaker for kitchen.",
    "chef-catering": "Example: Prepare traditional South African braai for 20 guests. Include vegetarian options. Serve at 6 PM.",
    "waitering": "Example: Need 3 waiters for dinner party. Black-tie attire required. Event runs from 7 PM to 11 PM.",
    "event-staff": "Example: Need 3 waiters for dinner party. Black-tie attire required. Event runs from 7 PM to 11 PM.",
    "event-staffing": "Example: Need 3 waiters for dinner party. Black-tie attire required. Event runs from 7 PM to 11 PM.",
    "moving": "Example: Moving from 2-bedroom apartment to 3-bedroom house. Need help with furniture and boxes. No fragile items.",
    "beauty-wellness": "Example: Haircut and styling for wedding. Prefer natural makeup look. Available on Saturday afternoon.",
    "au-pair": "Example: Need help with 2 children aged 5 and 7. Pickup from school at 3 PM. Homework assistance needed."
  };

  // Get service-specific placeholder or use default
  const getCommentPlaceholder = () => {
    return servicePlaceholders[mappedServiceId] || servicePlaceholders[serviceId] || "Describe any specific requirements or special instructions for your service provider.";
  };
  
  // Track if we need to show service selection (Step 0)
  const needsServiceSelection = !serviceId || !currentConfig;

  // ADDED: Multi-service booking feature - Reset modal state when serviceId or prefillFromRecent changes
  // FIX: Properly reinitialize form on every service selection or prefill change
  useEffect(() => {
    // Don't reset if no serviceId
    if (!serviceId) {
      return;
    }
    
    // Reset to step 1 when a new service is selected
    setStep(1);
    setShowConfirmation(false);
    setConfirmedBookingData(null);
    
    // ADDED: Reset add-ons comment and suggestions to avoid stale recommendations
    setAddOnsComment("");
    setSuggestedAddOnsFromComment([]);
    
    // Determine data source: editBookingData takes precedence over prefillFromRecent
    const dataSource = editBookingData || prefillFromRecent || {};
    const isEditing = !!editBookingData;
    const isPrefilling = !isEditing && prefillFromRecent && Object.keys(prefillFromRecent).length > 0;
    
    // Format date for input field (convert from timestamp if needed)
    let formattedDate = "";
    if ((isEditing || isPrefilling) && dataSource.scheduledDate) {
      try {
        const date = new Date(dataSource.scheduledDate);
        formattedDate = date.toISOString().split('T')[0];
      } catch (e) {
        console.error('Failed to format date:', e);
      }
    }
    
    // Reset form data - ALWAYS reinitialize to prevent stale data
    // Priority: editBookingData > prefillFromRecent > defaults
    setFormData({
      propertyType: (isEditing || isPrefilling) ? (dataSource.propertyType || "") : "",
      address: (isEditing || isPrefilling) ? (dataSource.address || "") : "",
      gateCode: isEditing ? (dataSource.gateCode || "") : "", // Never prefill gate code except in edit mode
      preferredDate: formattedDate,
      timePreference: (isEditing || isPrefilling) ? (dataSource.scheduledTime || dataSource.timePreference || "") : "",
      recurringSchedule: (isEditing || isPrefilling) ? (dataSource.recurringSchedule || "one-time") : "one-time",
      materials: (isEditing || isPrefilling) ? (dataSource.materials || "supply") : "supply",
      insurance: (isEditing || isPrefilling) ? (dataSource.insurance || false) : false,
      cleaningType: (isEditing || isPrefilling) ? (dataSource.cleaningType || "") : "",
      propertySize: (isEditing || isPrefilling) ? (dataSource.propertySize || "") : "",
      gardenSize: (isEditing || isPrefilling) ? (dataSource.gardenSize || "") : "",
      gardenCondition: (isEditing || isPrefilling) ? (dataSource.gardenCondition || "") : "",
      poolSize: (isEditing || isPrefilling) ? (dataSource.poolSize || "") : "",
      poolCondition: (isEditing || isPrefilling) ? (dataSource.poolCondition || "") : "",
      urgency: (isEditing || isPrefilling) ? (dataSource.urgency || "standard") : "standard",
      plumbingIssue: (isEditing || isPrefilling) ? (dataSource.plumbingIssue || "") : "",
      electricalIssue: (isEditing || isPrefilling) ? (dataSource.electricalIssue || "") : "",
      cuisineType: (isEditing || isPrefilling) ? (dataSource.cuisineType || "") : "",
      menuSelection: (isEditing || isPrefilling) ? (dataSource.menuSelection || "popular") : "popular",
      selectedMenu: (isEditing || isPrefilling) ? (dataSource.selectedMenu || "") : "",
      customMenuItems: (isEditing || isPrefilling) && Array.isArray(dataSource.customMenuItems) ? [...dataSource.customMenuItems] : [],
      dietaryRequirements: (isEditing || isPrefilling) && Array.isArray(dataSource.dietaryRequirements) ? [...dataSource.dietaryRequirements] : [],
      eventSize: (isEditing || isPrefilling) ? (dataSource.eventSize || "") : "",
      selectedAddOns: (isEditing || isPrefilling) && Array.isArray(dataSource.selectedAddOns) ? [...dataSource.selectedAddOns] : [],
      selectedProvider: (isEditing || isPrefilling) && dataSource.provider ? {...dataSource.provider} : null,
      specialRequests: isEditing ? (dataSource.specialRequests || "") : "", // Only prefill comments in edit mode
      tipAmount: isEditing ? (dataSource.tipAmount || 0) : 0, // Only prefill tip in edit mode
      paymentMethod: "card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      selectedBank: "",
      bankAccount: "",
      bankBranch: ""
    });
    
    // Show toast if prefill data was used (but not for edit mode)
    if (isPrefilling) {
      toast({
        title: "Previous booking details loaded",
        description: "We've pre-filled the form with your last booking details. Feel free to make any changes.",
        duration: 3000
      });
    }
    
    // Reset payment validation state
    setPaymentTouched({
      cardNumber: false,
      expiryDate: false,
      cvv: false,
      cardholderName: false,
      selectedBank: false,
      bankAccount: false,
      bankBranch: false
    });
    
    setPaymentErrors({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      selectedBank: "",
      bankAccount: "",
      bankBranch: ""
    });
  }, [serviceId, prefillFromRecent, editBookingData, toast]);
  
  // Lock recurring schedule to one-time for urgent plumbing/electrical services
  useEffect(() => {
    if (shouldDisableRecurring && formData.recurringSchedule !== "one-time") {
      setFormData(prev => ({ ...prev, recurringSchedule: "one-time" }));
    }
  }, [shouldDisableRecurring, formData.recurringSchedule]);
  
  // Set default date to tomorrow and disable date picker for electrical next-day service
  useEffect(() => {
    if (isElectrical && formData.urgency === "next-day") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      if (formData.preferredDate !== tomorrowStr) {
        setFormData(prev => ({ ...prev, preferredDate: tomorrowStr }));
      }
    }
  }, [isElectrical, formData.urgency]);

  // Calculate pricing whenever form data changes
  // Auto-set date and time for Emergency/Urgent/Same Day services
  useEffect(() => {
    const isEmergency = formData.urgency === "emergency";
    const isUrgent = formData.urgency === "urgent";
    const isSameDay = formData.urgency === "same-day";
    
    if (isEmergency || isUrgent || isSameDay) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        preferredDate: today,
        timePreference: isEmergency ? "ASAP" : prev.timePreference
      }));
    }
  }, [formData.urgency]);

  // Auto-suggest add-ons based on comment keywords
  // ADDED: Debounced keyword auto-suggest for add-ons with minimum 3-character check
  useEffect(() => {
    const trimmedComment = debouncedComment.trim();
    
    // Require minimum 3 characters to avoid spurious matches on very short inputs
    if (trimmedComment.length >= 3 && mappedServiceId) {
      const suggestions = suggestAddOns(mappedServiceId, debouncedComment);
      setSuggestedAddOnsFromComment(suggestions);
    } else {
      setSuggestedAddOnsFromComment([]);
    }
  }, [debouncedComment, mappedServiceId]);

  // Auto-calculate estimated hours
  useEffect(() => {
    if (mappedServiceId) {
      // Map propertySize to room count for house cleaning
      let roomCount: string | undefined;
      if (mappedServiceId === "cleaning" && formData.propertySize) {
        roomCount = formData.propertySize;
      }
      
      const hours = calculateEstimatedHours(
        mappedServiceId,
        {
          cleaningType: formData.cleaningType,
          roomCount: roomCount,
          addOnCount: formData.selectedAddOns?.length || 0
        }
      );
      setEstimatedHours(hours);
    }
  }, [mappedServiceId, formData.cleaningType, formData.propertySize, formData.gardenSize, formData.poolSize, formData.selectedAddOns]);

  useEffect(() => {
    // FIX: Don't default to cleaning - wait for valid service selection
    if (!mappedServiceId || !serviceConfigs[mappedServiceId]) {
      setPricing({
        basePrice: 0,
        addOnsPrice: 0,
        materialsDiscount: 0,
        recurringDiscount: 0,
        timeDiscount: 0,
        totalPrice: 0
      });
      return;
    }
    
    const config = serviceConfigs[mappedServiceId];
    let basePrice = config.basePrice;
    
    // Property type multiplier
    const propertyType = config.propertyTypes?.find((p: any) => p.value === formData.propertyType);
    if (propertyType) {
      basePrice *= propertyType.multiplier;
    }

    // Service-specific multipliers
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
      if (formData.menuSelection === "custom" && formData.customMenuItems.length > 0) {
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
      const serviceType = config.serviceTypes?.find((s: any) => s.value === formData.cleaningType);
      if (serviceType) basePrice = serviceType.price;
      
      const duration = config.sessionDuration?.find((d: any) => d.value === formData.propertySize);
      if (duration) basePrice *= duration.multiplier;
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

    // Add-ons pricing - FIXED: Use serviceAddOns from config/addons.ts instead of hardcoded config.addOns
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

    setPricing({
      basePrice: Math.round(basePrice),
      addOnsPrice,
      materialsDiscount,
      recurringDiscount,
      timeDiscount,
      totalPrice: Math.round(totalPrice)
    });
  }, [formData, mappedServiceId]);

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
  };



  const handleNext = () => {
    if (currentConfig && step < currentConfig.steps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBookingConfirm = () => {
    // Validate payment information before proceeding
    if (!validateAll()) {
      toast({
        variant: "destructive",
        title: "Payment validation failed",
        description: "Please check your payment details and try again."
      });
      return; // Keep modal open for user to fix errors
    }

    // Create masked payment info (only store last 4 digits and brand, never full card details)
    const maskedPaymentInfo = formData.paymentMethod === "card" ? {
      paymentMethod: "card",
      cardBrand: cardBrand,
      cardLast4: formData.cardNumber.replace(/\s/g, '').slice(-4),
      cardholderName: formData.cardholderName
      // NEVER store: cardNumber, cvv, expiryDate
    } : {
      paymentMethod: "bank",
      bankAccountLast4: formData.bankAccount.slice(-4),
      bankBranch: formData.bankBranch
      // NEVER store: full bankAccount
    };

    // Create enhanced booking data WITHOUT sensitive payment fields
    const bookingData = {
      serviceId,
      serviceName: currentConfig?.title ?? '',
      // Include all form fields EXCEPT sensitive payment data
      propertyType: formData.propertyType,
      address: formData.address,
      preferredDate: formData.preferredDate,
      timePreference: formData.timePreference,
      recurringSchedule: formData.recurringSchedule,
      materials: formData.materials,
      insurance: formData.insurance,
      cleaningType: formData.cleaningType,
      propertySize: formData.propertySize,
      gardenSize: formData.gardenSize,
      gardenCondition: formData.gardenCondition,
      poolSize: formData.poolSize,
      poolCondition: formData.poolCondition,
      urgency: formData.urgency,
      electricalIssue: formData.electricalIssue,
      cuisineType: formData.cuisineType,
      menuSelection: formData.menuSelection,
      selectedMenu: formData.selectedMenu,
      customMenuItems: formData.customMenuItems,
      dietaryRequirements: formData.dietaryRequirements,
      eventSize: formData.eventSize,
      selectedAddOns: formData.selectedAddOns,
      specialRequests: formData.specialRequests,
      
      // Include masked payment info only
      payment: maskedPaymentInfo,
      
      pricing,
      totalCost: pricing.totalPrice,
      commission: Math.round(pricing.totalPrice * 0.15), // 15% platform commission
      timestamp: new Date().toISOString(),
      
      // Enhanced provider data with contact info and bio
      selectedProvider: formData.selectedProvider ? {
        ...formData.selectedProvider,
        phone: "+27 11 456 7890", // Will be shared closer to service date
        email: "contact@berryevents.com", // Contact through Berry Events
        bio: `Professional service provider with ${formData.selectedProvider.reviews || 100}+ successful bookings. Specializes in ${formData.selectedProvider.specializations?.join(', ') || 'quality service delivery'}.`,
        experience: `${Math.floor(formData.selectedProvider.reviews / 50)} years experience`,
        profileImage: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`
      } : null
    };

    // Safe to log - no sensitive payment data included
    console.log("Processing booking:", bookingData);
    
    // Store booking data and show confirmation modal
    setConfirmedBookingData(bookingData);
    setShowConfirmation(true);
    
    // Call the original completion handler for data persistence
    onBookingComplete(bookingData);
  };

  const handleAddToCartAndContinue = async () => {
    // Check cart limit (max 3 services)
    if (itemCount >= 3) {
      toast({
        variant: "destructive",
        title: "Cart limit reached",
        description: "You can add up to 3 services per booking. Please proceed to checkout."
      });
      return;
    }

    // Map frontend service IDs to database service IDs (needed for validation)
    const serviceIdMapping: Record<string, string> = {
      'cleaning': 'house-cleaning',
      'garden-care': 'gardening',
      'garden-maintenance': 'gardening',
      'pool-cleaning': 'pool-cleaning',
      'chef-catering': 'chef-catering',
      'plumbing': 'plumbing',
      'electrical': 'electrical',
      'waitering': 'event-staff'
    };
    
    const dbServiceId = serviceIdMapping[serviceId] || serviceId;

    // Chef & Catering: Validate 24-hour minimum booking window
    if ((serviceId === "chef-catering" || dbServiceId === "chef-catering") && 
        formData.preferredDate && formData.timePreference) {
      const selectedDateTime = new Date(formData.preferredDate);
      const [hours] = formData.timePreference.split(':').map(Number);
      selectedDateTime.setHours(hours, 0, 0, 0);
      const hoursFromNow = (selectedDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursFromNow < 24) {
        toast({
          variant: "destructive",
          title: "24-Hour Notice Required",
          description: "Chef & Catering services require at least 24 hours notice for menu planning and ingredient sourcing. Please select a later date or time."
        });
        return;
      }
    }

    // Garden Services: Validate 24-hour minimum booking window
    if ((isGardenService || dbServiceId === "gardening") && 
        formData.preferredDate && formData.timePreference) {
      // Block emergency/urgent bookings for garden services
      if (formData.urgency === "emergency" || formData.urgency === "urgent" || formData.urgency === "same-day" || formData.timePreference === "ASAP") {
        toast({
          variant: "destructive",
          title: "Garden Services Not Available for Emergency Booking",
          description: "Garden services require at least 24 hours notice to ensure our professionals arrive prepared with the right equipment. Please select a standard booking."
        });
        return;
      }
      
      const selectedDateTime = new Date(formData.preferredDate);
      const [hours] = formData.timePreference.split(':').map(Number);
      
      // Guard against non-time values (e.g., "ASAP")
      if (isNaN(hours)) {
        toast({
          variant: "destructive",
          title: "Invalid Time Selection",
          description: "Please select a valid time slot for your garden service booking."
        });
        return;
      }
      
      selectedDateTime.setHours(hours, 0, 0, 0);
      const hoursFromNow = (selectedDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursFromNow < 24) {
        toast({
          variant: "destructive",
          title: "24-Hour Notice Required",
          description: "Garden services require at least 24 hours notice to ensure our professionals arrive prepared with the right equipment. Please select a later date or time."
        });
        return;
      }
    }
    
    // Map booking data to CartItem format
    const cartItem = {
      serviceId: dbServiceId, // Use database-compatible service ID
      serviceName: currentConfig?.title ?? '',
      providerId: null, // Set to null - will be assigned after checkout
      providerName: formData.selectedProvider?.name || "To be assigned",
      scheduledDate: formData.preferredDate,
      scheduledTime: formData.timePreference,
      duration: estimatedHours > 0 ? Math.round(estimatedHours) : 3,
      basePrice: pricing.basePrice.toString(),
      addOnsPrice: pricing.addOnsPrice.toString(),
      subtotal: pricing.totalPrice.toString(),
      selectedAddOns: formData.selectedAddOns || [],
      comments: formData.specialRequests || "",
      // HOUSE CLEANING & PLUMBING: Add tip amount
      tipAmount: showEnhancedProviderDetails && formData.tipAmount ? formData.tipAmount.toString() : "0",
      serviceDetails: JSON.stringify({
        propertyType: formData.propertyType,
        address: formData.address,
        recurringSchedule: formData.recurringSchedule,
        materials: formData.materials,
        insurance: formData.insurance,
        cleaningType: formData.cleaningType,
        propertySize: formData.propertySize,
        gardenSize: formData.gardenSize,
        gardenCondition: formData.gardenCondition,
        poolSize: formData.poolSize,
        poolCondition: formData.poolCondition,
        urgency: formData.urgency,
        electricalIssue: formData.electricalIssue,
        cuisineType: formData.cuisineType,
        menuSelection: formData.menuSelection,
        selectedMenu: formData.selectedMenu,
        customMenuItems: formData.customMenuItems,
        dietaryRequirements: formData.dietaryRequirements,
        eventSize: formData.eventSize,
        provider: formData.selectedProvider,
        // HOUSE CLEANING & PLUMBING: Store tip in details too
        tipAmount: showEnhancedProviderDetails ? formData.tipAmount : 0
      })
    };

    console.log("➕ Adding to cart (mapped to CartItem):", cartItem);
    
    try {
      // Add to cart via CartContext
      await addToCart(cartItem);
      
      // Reset modal to step 1 for selecting another service
      setStep(1);
      
      // Clear form data for next service
      setFormData({
        propertyType: "",
        address: "",
        gateCode: "",
        preferredDate: "",
        timePreference: "",
        recurringSchedule: "one-time",
        materials: "supply",
        insurance: false,
        cleaningType: "",
        propertySize: "",
        gardenSize: "",
        gardenCondition: "",
        poolSize: "",
        poolCondition: "",
        urgency: "standard",
        plumbingIssue: "",
        electricalIssue: "",
        cuisineType: "",
        menuSelection: "popular",
        selectedMenu: "",
        customMenuItems: [],
        dietaryRequirements: [],
        eventSize: "",
        selectedAddOns: [],
        specialRequests: "",
        selectedProvider: null,
        tipAmount: 0,
        paymentMethod: "card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
        selectedBank: "",
        bankAccount: "",
        bankBranch: ""
      });
      
      // Reset other state
      setAddOnsComment("");
      setEstimatedHours(0);
      
      toast({
        title: "Service added to cart!",
        description: `You can add ${3 - (itemCount + 1)} more service${3 - (itemCount + 1) === 1 ? '' : 's'}. Select another service or go to cart to checkout.`
      });
      
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        variant: "destructive",
        title: "Failed to add to cart",
        description: "Please try again."
      });
    }
  };

  const handleAddToCart = async () => {
    // Check cart limit (max 3 services)
    if (itemCount >= 3) {
      toast({
        variant: "destructive",
        title: "Cart limit reached",
        description: "You can add up to 3 services per booking. Please proceed to checkout."
      });
      return;
    }

    // Map frontend service IDs to database service IDs (needed for validation)
    const serviceIdMapping: Record<string, string> = {
      'cleaning': 'house-cleaning',
      'garden-care': 'gardening',
      'garden-maintenance': 'gardening',
      'pool-cleaning': 'pool-cleaning',
      'chef-catering': 'chef-catering',
      'plumbing': 'plumbing',
      'electrical': 'electrical',
      'waitering': 'event-staff'
    };
    
    const dbServiceId = serviceIdMapping[serviceId] || serviceId;

    // Chef & Catering: Validate 24-hour minimum booking window
    if ((serviceId === "chef-catering" || dbServiceId === "chef-catering") && 
        formData.preferredDate && formData.timePreference) {
      const selectedDateTime = new Date(formData.preferredDate);
      const [hours] = formData.timePreference.split(':').map(Number);
      selectedDateTime.setHours(hours, 0, 0, 0);
      const hoursFromNow = (selectedDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursFromNow < 24) {
        toast({
          variant: "destructive",
          title: "24-Hour Notice Required",
          description: "Chef & Catering services require at least 24 hours notice for menu planning and ingredient sourcing. Please select a later date or time."
        });
        return;
      }
    }

    // Garden Services: Validate 24-hour minimum booking window
    if ((isGardenService || dbServiceId === "gardening") && 
        formData.preferredDate && formData.timePreference) {
      // Block emergency/urgent bookings for garden services
      if (formData.urgency === "emergency" || formData.urgency === "urgent" || formData.urgency === "same-day" || formData.timePreference === "ASAP") {
        toast({
          variant: "destructive",
          title: "Garden Services Not Available for Emergency Booking",
          description: "Garden services require at least 24 hours notice to ensure our professionals arrive prepared with the right equipment. Please select a standard booking."
        });
        return;
      }
      
      const selectedDateTime = new Date(formData.preferredDate);
      const [hours] = formData.timePreference.split(':').map(Number);
      
      // Guard against non-time values (e.g., "ASAP")
      if (isNaN(hours)) {
        toast({
          variant: "destructive",
          title: "Invalid Time Selection",
          description: "Please select a valid time slot for your garden service booking."
        });
        return;
      }
      
      selectedDateTime.setHours(hours, 0, 0, 0);
      const hoursFromNow = (selectedDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursFromNow < 24) {
        toast({
          variant: "destructive",
          title: "24-Hour Notice Required",
          description: "Garden services require at least 24 hours notice to ensure our professionals arrive prepared with the right equipment. Please select a later date or time."
        });
        return;
      }
    }
    
    // Map booking data to CartItem format
    const cartItem = {
      serviceId: dbServiceId,
      serviceName: currentConfig?.title ?? '',
      providerId: null,
      providerName: formData.selectedProvider?.name || "To be assigned",
      scheduledDate: formData.preferredDate,
      scheduledTime: formData.timePreference,
      duration: estimatedHours > 0 ? Math.round(estimatedHours) : 3,
      basePrice: pricing.basePrice.toString(),
      addOnsPrice: pricing.addOnsPrice.toString(),
      subtotal: pricing.totalPrice.toString(),
      selectedAddOns: formData.selectedAddOns || [],
      comments: formData.specialRequests || "",
      // HOUSE CLEANING & PLUMBING: Add tip amount
      tipAmount: showEnhancedProviderDetails && formData.tipAmount ? formData.tipAmount.toString() : "0",
      serviceDetails: JSON.stringify({
        propertyType: formData.propertyType,
        address: formData.address,
        recurringSchedule: formData.recurringSchedule,
        materials: formData.materials,
        insurance: formData.insurance,
        cleaningType: formData.cleaningType,
        propertySize: formData.propertySize,
        gardenSize: formData.gardenSize,
        gardenCondition: formData.gardenCondition,
        poolSize: formData.poolSize,
        poolCondition: formData.poolCondition,
        urgency: formData.urgency,
        electricalIssue: formData.electricalIssue,
        cuisineType: formData.cuisineType,
        menuSelection: formData.menuSelection,
        selectedMenu: formData.selectedMenu,
        customMenuItems: formData.customMenuItems,
        dietaryRequirements: formData.dietaryRequirements,
        eventSize: formData.eventSize,
        provider: formData.selectedProvider,
        // HOUSE CLEANING & PLUMBING: Store tip in details too
        tipAmount: showEnhancedProviderDetails ? formData.tipAmount : 0
      })
    };

    try {
      await addToCart(cartItem);
      
      toast({
        title: "Service added to cart!",
        description: `${currentConfig?.title ?? 'Service'} added successfully. Redirecting to cart...`
      });
      
      // Close modal and navigate to cart
      onClose();
      navigate("/cart-checkout");
      
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        variant: "destructive",
        title: "Failed to add to cart",
        description: "Please try again."
      });
    }
  };

  const handleGoToCart = () => {
    // Close modal and navigate to cart checkout
    onClose();
    navigate("/cart-checkout");
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setConfirmedBookingData(null);
    
    // SECURITY: Clear all sensitive payment data from memory
    setFormData(prev => ({
      ...prev,
      // Clear card payment fields
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      // Clear bank transfer fields
      selectedBank: "",
      bankAccount: "",
      bankBranch: ""
    }));
    
    // Reset payment validation state
    setPaymentTouched({
      cardNumber: false,
      expiryDate: false,
      cvv: false,
      cardholderName: false,
      selectedBank: false,
      bankAccount: false,
      bankBranch: false
    });
    
    setPaymentErrors({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      selectedBank: "",
      bankAccount: "",
      bankBranch: ""
    });
    
    // Close the main modal after confirmation modal is closed
    onClose();
    // Reset form state
    setStep(1);
    setFormData({
      // Reset all form data
      propertyType: "",
      address: "",
      gateCode: "",
      preferredDate: "",
      timePreference: "",
      recurringSchedule: "one-time",
      materials: "supply",
      insurance: false,
      cleaningType: "",
      propertySize: "",
      gardenSize: "",
      gardenCondition: "",
      poolSize: "",
      poolCondition: "",
      urgency: "standard",
      plumbingIssue: "",
      electricalIssue: "",
      cuisineType: "",
      eventSize: "",
      menuSelection: "popular",
      selectedMenu: "",
      customMenuItems: [],
      dietaryRequirements: [],
      selectedAddOns: [],
      selectedProvider: null,
      specialRequests: "",
      tipAmount: 0,
      paymentMethod: "card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      selectedBank: "",
      bankAccount: "",
      bankBranch: ""
    });
  };

  // Render service selection step (Step 0) when no service is selected
  const renderServiceSelection = () => {
    const availableServices = [
      { id: "cleaning", config: serviceConfigs["cleaning"], description: "Professional house cleaning services" },
      { id: "garden-care", config: serviceConfigs["garden-care"], description: "Complete garden maintenance" },
      { id: "plumbing", config: serviceConfigs["plumbing"], description: "Expert plumbing repairs and installation" },
      { id: "electrical", config: serviceConfigs["electrical"], description: "Certified electrical repairs and installations" },
      { id: "chef-catering", config: serviceConfigs["chef-catering"], description: "Professional catering and chef services" },
      { id: "event-staff", config: serviceConfigs["event-staff"], description: "Waitering and event staffing" },
      { id: "moving", config: serviceConfigs["moving"], description: "Professional moving and relocation services" },
      { id: "au-pair", config: serviceConfigs["au-pair"], description: "Trusted childcare and au pair services" }
    ];

    // Extract last 5 unique services from recent orders with their last used details
    const recentServiceIds: string[] = [];
    const recentServiceDetails: Map<string, any> = new Map();
    
    if (recentOrders && recentOrders.length > 0) {
      const serviceIdMapping: Record<string, string> = {
        'house-cleaning': 'cleaning',
        'gardening': 'garden-care',
        'garden-care': 'garden-care',
        'garden-maintenance': 'garden-care',
        'pool-cleaning': 'pool-cleaning',
        'plumbing': 'plumbing',
        'electrical': 'electrical',
        'chef-catering': 'chef-catering',
        'event-staff': 'event-staff',
        'moving': 'moving',
        'au-pair': 'au-pair'
      };
      
      for (const order of recentOrders) {
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            const mappedId = serviceIdMapping[item.serviceId] || item.serviceId;
            if (!recentServiceIds.includes(mappedId) && recentServiceIds.length < 5) {
              recentServiceIds.push(mappedId);
              // Store the last used details for this service
              let parsedDetails = {};
              try {
                parsedDetails = typeof item.serviceDetails === 'string' 
                  ? JSON.parse(item.serviceDetails) 
                  : item.serviceDetails || {};
              } catch (e) {
                console.error('Failed to parse service details:', e);
              }
              
              recentServiceDetails.set(mappedId, {
                ...parsedDetails,
                orderDate: order.createdAt,
                scheduledDate: item.scheduledDate,
                scheduledTime: item.scheduledTime,
                selectedAddOns: Array.isArray(item.selectedAddOns) ? item.selectedAddOns : []
              });
            }
          }
        }
        if (recentServiceIds.length >= 5) break;
      }
    }

    const recentServices = recentServiceIds
      .map(id => availableServices.find(s => s.id === id))
      .filter(Boolean) as typeof availableServices;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Choose a Service</h3>
          <p className="text-gray-600 text-sm">Select the service you'd like to book</p>
          {bookedServices.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {bookedServices.length} service{bookedServices.length > 1 ? 's' : ''} already selected
            </p>
          )}
        </div>

        {/* Recently Used Services */}
        {recentOrders && recentOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-gray-900">Recently Used Services</h4>
            </div>
            {recentServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentServices.map((service) => {
                const isBooked = bookedServices.includes(service.id);
                const Icon = service.config.icon;
                
                return (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-lg border-2 border-primary/20 ${
                      isBooked ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
                    }`}
                    onClick={() => {
                      if (!isBooked && bookedServices.length < 3) {
                        const prefillData = recentServiceDetails.get(service.id);
                        onServiceSelect?.(service.id, prefillData);
                        setStep(1);
                      } else if (bookedServices.length >= 3) {
                        toast({
                          variant: "destructive",
                          title: "Maximum services reached",
                          description: "You can only book up to 3 services at once."
                        });
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          isBooked ? 'bg-gray-200' : 'bg-primary/10'
                        }`}>
                          <Icon className={`h-6 w-6 ${isBooked ? 'text-gray-400' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{service.config.title}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          {isBooked ? (
                            <Badge variant="secondary" className="mt-2 bg-gray-100">Already Selected</Badge>
                          ) : (
                            <Badge variant="secondary" className="mt-2 bg-green-50 text-green-700 border-green-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Recently Used
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No recent service bookings found</p>
              </div>
            )}
          </div>
        )}

        {/* All Services */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">All Services</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableServices.map((service) => {
              const isBooked = bookedServices.includes(service.id);
              const isRecent = recentServiceIds.includes(service.id);
              const Icon = service.config.icon;
              
              // Skip if already shown in recent services
              if (isRecent) return null;
              
              return (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isBooked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (!isBooked && bookedServices.length < 3) {
                      onServiceSelect?.(service.id, null); // Clear prefill data for regular service
                      setStep(1);
                    } else if (bookedServices.length >= 3) {
                      toast({
                        variant: "destructive",
                        title: "Maximum services reached",
                        description: "You can only book up to 3 services at once."
                      });
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        isBooked ? 'bg-gray-200' : 'bg-primary/10'
                      }`}>
                        <Icon className={`h-6 w-6 ${isBooked ? 'text-gray-400' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{service.config.title}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {isBooked && (
                          <Badge variant="secondary" className="mt-2 bg-gray-100">Already Selected</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Custom Service Solution Form */}
        <div className="mt-6">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600">Don't see what you need?</p>
          </div>
          <CustomServiceContact />
        </div>

        {bookedServices.length >= 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              Maximum of 3 services reached. Complete your booking or remove a service to add another.
            </p>
          </div>
        )}
      </div>
    );
  };


  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">Where do you need help?</h3>
        <p className="text-sm text-muted-foreground">Tell us about your property and location</p>
      </div>

      <div className="space-y-5">
        <LocationStep
          formData={formData}
          setFormData={setFormData}
          currentConfig={currentConfig ?? {}}
          handleAddressChange={handleAddressChange}
        />

        {isHouseCleaning && (
          <CleaningServiceForm
            formData={formData}
            setFormData={setFormData}
            currentConfig={currentConfig}
          />
        )}

        {isGardenService && (
          <GardenServiceForm
            formData={formData}
            setFormData={setFormData}
            currentConfig={currentConfig}
          />
        )}

        {isPoolService && (
          <PoolServiceForm
            formData={formData}
            setFormData={setFormData}
            currentConfig={currentConfig}
          />
        )}

        {isPlumbing && (
          <PlumbingServiceForm
            formData={formData}
            setFormData={setFormData}
            currentConfig={currentConfig}
          />
        )}

        {isElectrical && (
          <ElectricalServiceForm
            formData={formData}
            setFormData={setFormData}
            currentConfig={currentConfig}
          />
        )}

        {serviceId === "event-staff" && (
          <EventStaffForm
            formData={formData}
            setFormData={setFormData}
            currentConfig={currentConfig}
          />
        )}

        {serviceId === "moving" && (
          <>
            <div>
              <Label>Moving Type *</Label>
              <Select value={formData.cleaningType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, cleaningType: value }))
              }>
                <SelectTrigger data-testid="select-moving-type">
                  <SelectValue placeholder="Select moving type" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig?.movingTypes?.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{type.label} - R{type.price}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Moving Distance *</Label>
              <Select value={formData.propertySize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, propertySize: value }))
              }>
                <SelectTrigger data-testid="select-moving-distance">
                  <SelectValue placeholder="Select moving distance" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig?.movingDistance?.map((distance: any) => (
                    <SelectItem key={distance.value} value={distance.value}>
                      {distance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {serviceId === "au-pair" && (
          <>
            <div>
              <Label>Care Type *</Label>
              <Select value={formData.cleaningType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, cleaningType: value }))
              }>
                <SelectTrigger data-testid="select-care-type">
                  <SelectValue placeholder="Select care type" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig?.careTypes?.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{type.label} - R{type.price}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Number of Children *</Label>
              <Select value={formData.propertySize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, propertySize: value }))
              }>
                <SelectTrigger data-testid="select-children-count">
                  <SelectValue placeholder="Select number of children" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig?.childrenCount?.map((count: any) => (
                    <SelectItem key={count.value} value={count.value}>
                      {count.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Children's Age Range *</Label>
              <Select value={formData.gardenSize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, gardenSize: value }))
              }>
                <SelectTrigger data-testid="select-children-ages">
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig?.childrenAges?.map((age: any) => (
                    <SelectItem key={age.value} value={age.value}>
                      {age.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {isChefCatering && (
          <ChefCateringForm
            formData={formData}
            setFormData={setFormData}
            currentConfig={currentConfig}
          />
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <ScheduleStep
      formData={formData}
      setFormData={setFormData}
      isHouseCleaning={isHouseCleaning}
      isChefCatering={isChefCatering}
      isGardenService={isGardenService}
      isPlumbing={isPlumbing}
      isElectrical={isElectrical}
      showEnhancedProviderDetails={showEnhancedProviderDetails}
      shouldDisableRecurring={shouldDisableRecurring}
    />
  );

  const renderStep3 = () => {
    const availableAddOns = serviceAddOns[mappedServiceId] || [];
    
    return (
      <AddOnsStep
        formData={formData}
        setFormData={setFormData}
        addOnsComment={addOnsComment}
        setAddOnsComment={setAddOnsComment}
        commentPlaceholder={getCommentPlaceholder()}
        suggestedAddOns={suggestedAddOnsFromComment}
        availableAddOns={availableAddOns}
        estimatedHours={estimatedHours}
        onAddAnotherService={onAddAnotherService}
        bookedServices={bookedServices}
        mappedServiceId={mappedServiceId}
        currentConfig={currentConfig}
        pricing={pricing}
      />
    );
  };

  const renderStep4 = () => (
    <ReviewStep
      formData={formData}
      setFormData={setFormData}
      providers={providers}
      preSelectedProviderId={preSelectedProviderId}
      preSelectedProviderName={preSelectedProviderName}
      showEnhancedProviderDetails={showEnhancedProviderDetails}
      isHouseCleaning={isHouseCleaning}
      bookedServices={bookedServices}
      setProviderDetailsModal={setProviderDetailsModal}
    />
  );

  const renderStep5 = () => (
    <PaymentStep
      serviceId={serviceId}
      serviceName={currentConfig?.title ?? ''}
      formData={formData}
      setFormData={setFormData}
      pricing={pricing}
      estimatedHours={estimatedHours}
      pendingDrafts={pendingDrafts}
      aggregatePayments={aggregatePayments}
      paymentTouched={paymentTouched}
      paymentErrors={paymentErrors}
      validateField={validateField}
      markTouched={markTouched}
      cardBrand={cardBrand}
    />
  );

  // Guard against undefined config - moved to correct location below
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
          {needsServiceSelection ? (
            <>
              <DialogHeader className="pb-4">
                <DialogTitle className="text-2xl font-bold text-foreground">Book Your Service</DialogTitle>
                <DialogDescription className="text-muted-foreground">Select a service to get started</DialogDescription>
              </DialogHeader>
              {renderServiceSelection()}
              <div className="flex justify-end pt-6 border-t border-border">
                <Button variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <currentConfig.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span>{currentConfig.title}</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground pt-1">
                  Step {step} of {currentConfig.steps}
                </DialogDescription>
              </DialogHeader>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 my-6 px-1">
            {Array.from({ length: currentConfig.steps }, (_, i) => (
              <div key={i} className="flex items-center flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all flex-1 ${
                    i + 1 <= step ? 'bg-primary' : 'bg-border'
                  }`}
                />
                {i < currentConfig.steps - 1 && <div className="w-2" />}
              </div>
            ))}
          </div>

          {/* Step content with white card background */}
          <Card className="bg-card border-border shadow-sm mb-6">
            <CardContent className="p-6 min-h-[400px]">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-lg px-6"
            >
              Back
            </Button>

            <div className="flex gap-3">
              {/* ENHANCED SERVICES: 2-button CTA layout for House Cleaning, Plumbing, Electrical, Garden, Chef, Waitering, Moving, Au Pair */}
              {step === 4 && showEnhancedProviderDetails ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleAddToCartAndContinue}
                    disabled={!formData.selectedProvider}
                    className="border-2 border-border text-foreground hover:bg-muted rounded-lg px-6"
                    data-testid="button-add-to-cart-select-another"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart & Select Another
                  </Button>
                  <Button 
                    onClick={handleAddToCart}
                    className="bg-primary hover:bg-accent text-primary-foreground rounded-lg px-6 shadow-sm"
                    disabled={!formData.selectedProvider}
                    data-testid="button-add-and-go-to-cart"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add & Go to Cart
                  </Button>
                </>
              ) : (
                <>
                  {/* NON-HOUSE CLEANING: Original button layout */}
                  {step === 4 && formData.selectedProvider && itemCount < 3 && (
                    <Button 
                      variant="outline"
                      onClick={handleAddToCartAndContinue}
                      disabled={!formData.selectedProvider}
                      className="border-2 border-border text-foreground hover:bg-muted rounded-lg px-6"
                      data-testid="button-add-to-cart-continue"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart & Select Another
                    </Button>
                  )}

                  {step < currentConfig.steps ? (
                    <Button 
                      onClick={handleNext}
                      className="bg-primary hover:bg-accent text-primary-foreground rounded-lg px-8 shadow-sm"
                      disabled={
                        (step === 1 && (!formData.propertyType || !formData.address || 
                          (isHouseCleaning && (!formData.cleaningType || !formData.propertySize)) ||
                          (isGardenService && (!formData.gardenSize || !formData.gardenCondition)) ||
                          (isPoolService && (!formData.poolSize || !formData.poolCondition)) ||
                          (isPlumbing && (!formData.plumbingIssue || !formData.urgency)) ||
                          (isElectrical && (!formData.electricalIssue || !formData.urgency)) ||
                          (isChefCatering && (!formData.cuisineType || !formData.eventSize)) ||
                          (isEventStaff && (!formData.cleaningType || !formData.propertySize)) ||
                          (isMoving && (!formData.cleaningType || !formData.propertySize)) ||
                          (isAuPair && (!formData.cleaningType || !formData.propertySize || !formData.gardenSize))
                        )) ||
                        (step === 2 && (!formData.preferredDate || !formData.timePreference)) ||
                        (step === 4 && !formData.selectedProvider)
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleAddToCart}
                        className="bg-primary hover:bg-accent text-primary-foreground rounded-lg px-6 shadow-sm"
                        disabled={!formData.selectedProvider}
                        data-testid="button-add-to-cart"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button 
                        onClick={handleGoToCart}
                        variant="outline"
                        className="border-2 border-border text-foreground hover:bg-muted rounded-lg px-6"
                        data-testid="button-go-to-cart"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Go to Cart ({itemCount})
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Provider Details Modal */}
      {providerDetailsModal && (
        <Dialog open={!!providerDetailsModal} onOpenChange={() => setProviderDetailsModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Provider Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{providerDetailsModal.name}</h3>
                  {providerDetailsModal.verified && (
                    <div className="flex items-center text-success text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified Provider
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-semibold">{providerDetailsModal.rating}</span>
                    <span className="text-sm text-gray-600 ml-1">({providerDetailsModal.reviews} reviews)</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-1" />
                    <span className="font-semibold">{providerDetailsModal.distance}km away</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-1" />
                    <span className="font-semibold">{providerDetailsModal.responseTime}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {providerDetailsModal.specializations.map((spec: string) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">About</p>
                <p className="text-sm">
                  Professional service provider with {providerDetailsModal.reviews}+ successful bookings. 
                  Specializes in {providerDetailsModal.specializations.join(', ')}. 
                  Highly rated and verified by Berry Events.
                </p>
              </div>

              <Button 
                className="w-full"
                onClick={() => {
                  setFormData(prev => ({ ...prev, selectedProvider: providerDetailsModal }));
                  setProviderDetailsModal(null);
                }}
              >
                Select This Provider
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        bookingData={confirmedBookingData}
      />
    </>
  );
}