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
import ScheduleStep from "./booking-steps/ScheduleStep";
import AddOnsStep from "./booking-steps/AddOnsStep";
import { serviceAddOns, suggestAddOns, type AddOn } from "../../../config/addons";
import { serviceEstimates, calculateEstimatedHours } from "../../../config/estimates";
import { southAfricanBanks, validateAccountNumber } from "../../../config/banks";
import { aggregatePayments } from "@/lib/paymentAggregator";

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
  const cardBrand = useMemo(() => {
    const cleaned = formData.cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return '';
  }, [formData.cardNumber]);

  // Formatting functions
  const formatCardNumber = (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  const formatExpiryDate = (value: string): string => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    if (numericValue.length >= 2) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
    }
    return numericValue;
  };

  // Validation functions
  const validateCardNumber = (cardNumber: string): string => {
    if (!cardNumber) return "Card number is required";
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return "Invalid card number format";
    
    // Luhn Algorithm
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0 ? "" : "Invalid card number";
  };

  const validateExpiryDate = (expiry: string): string => {
    if (!expiry) return "Expiry date is required";
    const [month, year] = expiry.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return "Use MM/YY format";
    }
    const monthNum = parseInt(month);
    const yearNum = parseInt('20' + year);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (monthNum < 1 || monthNum > 12) return "Invalid month";
    if (yearNum < currentYear) return "Card has expired";
    if (yearNum === currentYear && monthNum < currentMonth) return "Card has expired";
    return "";
  };

  const validateCVV = (cvv: string, cardType: string): string => {
    if (!cvv) return "CVV is required";
    const expectedLength = cardType === 'American Express' ? 4 : 3;
    if (cvv.length !== expectedLength) {
      return `CVV must be ${expectedLength} digits`;
    }
    if (!/^\d+$/.test(cvv)) return "CVV must be numeric";
    return "";
  };

  const validateCardholderName = (name: string): string => {
    if (!name) return "Cardholder name is required";
    if (name.length < 3) return "Name is too short";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters";
    return "";
  };

  const validateSelectedBank = (bankCode: string): string => {
    if (!bankCode) return "Please select your bank";
    return "";
  };

  const validateBankAccount = (account: string): string => {
    if (!account) return "Bank account is required";
    if (formData.selectedBank) {
      const isValid = validateAccountNumber(formData.selectedBank, account);
      if (!isValid) {
        const bank = southAfricanBanks.find(b => b.code === formData.selectedBank);
        const lengths = bank?.accountNumberLength.join(' or ') || '8-12';
        return `Account must be ${lengths} digits for this bank`;
      }
    } else if (!/^\d{8,12}$/.test(account)) {
      return "Account number must be 8-12 digits";
    }
    return "";
  };

  const validateBankBranch = (branch: string): string => {
    if (!branch) return "Branch code is required";
    if (!/^\d{6}$/.test(branch)) return "Branch code must be 6 digits";
    return "";
  };

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
        error = validateBankAccount(value);
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
      const accountError = validateBankAccount(formData.bankAccount);
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

  const serviceConfigs: any = {
    "cleaning": {
      title: "House Cleaning Service",
      icon: Sparkles,
      basePrice: 280,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.2 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.1 },
        { value: "villa", label: "Villa", multiplier: 1.5 }
      ],
      cleaningTypes: [
        { value: "basic", label: "Basic Clean", price: 280 },
        { value: "deep-clean", label: "Deep Clean", price: 450 },
        { value: "move-clean", label: "Move In/Out", price: 680 }
      ],
      propertySizes: [
        { value: "small", label: "Small (1-2 bedrooms)", multiplier: 1.0 },
        { value: "medium", label: "Medium (3-4 bedrooms)", multiplier: 1.3 },
        { value: "large", label: "Large (5+ bedrooms)", multiplier: 1.6 }
      ],
      addOns: [
        { id: "inside-oven", name: "Inside Oven Cleaning", price: 150 },
        { id: "inside-fridge", name: "Inside Fridge Cleaning", price: 100 },
        { id: "windows", name: "Window Cleaning", price: 80 },
        { id: "carpet-clean", name: "Carpet Deep Clean", price: 200 }
      ]
    },
    "garden-care": {
      title: "Garden Care Service",
      icon: Scissors,
      basePrice: 320,
      steps: 4,
      propertyTypes: [
        { value: "house", label: "House Garden", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Garden", multiplier: 0.9 },
        { value: "estate-property", label: "Estate Property", multiplier: 1.4 }
      ],
      gardenSizes: [
        { value: "small", label: "Small (0-100m²)", multiplier: 1.0 },
        { value: "medium", label: "Medium (100-300m²)", multiplier: 1.5 },
        { value: "large", label: "Large (300-500m²)", multiplier: 2.0 },
        { value: "estate", label: "Estate (500m²+)", multiplier: 3.0 }
      ],
      gardenConditions: [
        { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
        { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
        { value: "overgrown", label: "Overgrown", multiplier: 1.5 },
        { value: "neglected", label: "Severely Neglected", multiplier: 1.8 }
      ],
      addOns: [
        { id: "lawn-care", name: "Lawn Mowing & Edging", price: 150 },
        { id: "pruning", name: "Tree & Shrub Pruning", price: 200 },
        { id: "weeding", name: "Weeding & Cleanup", price: 120 },
        { id: "seasonal-prep", name: "Seasonal Preparation", price: 100 }
      ]
    },
    "plumbing": {
      title: "Plumbing Service",
      icon: Droplets,
      basePrice: 380,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.1 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.05 },
        { value: "villa", label: "Villa", multiplier: 1.3 }
      ],
      plumbingIssues: [
        { value: "leaking-pipe", label: "Leaking Pipe", price: 450, description: "Fix water leaks in pipes, joints, or connections" },
        { value: "blocked-drain", label: "Blocked Drain/Toilet", price: 380, description: "Clear blockages in drains, sinks, or toilets" },
        { value: "geyser-repair", label: "Geyser/Water Heater Repair", price: 650, description: "Repair or replace water heater/geyser" },
        { value: "tap-faucet", label: "Tap/Faucet Repair", price: 280, description: "Fix dripping or broken taps and faucets" },
        { value: "burst-pipe", label: "Burst Pipe (Emergency)", price: 850, description: "Emergency repair for burst water pipes" },
        { value: "toilet-installation", label: "Toilet Installation/Repair", price: 420, description: "Install new toilet or fix existing issues" },
        { value: "shower-repair", label: "Shower Repair", price: 380, description: "Fix shower heads, mixers, or drainage" },
        { value: "sink-installation", label: "Sink Installation", price: 520, description: "Install new kitchen or bathroom sink" },
        { value: "water-pressure", label: "Low Water Pressure", price: 350, description: "Diagnose and fix water pressure issues" },
        { value: "sewer-line", label: "Sewer Line Issues", price: 750, description: "Repair or unblock main sewer lines" },
        { value: "other", label: "Other Plumbing Issue", price: 450, description: "Custom plumbing problem not listed above" }
      ],
      addOns: [
        { id: "pipe-repair", name: "Additional Pipe Repair", price: 200 },
        { id: "faucet-install", name: "Extra Faucet Installation", price: 150 },
        { id: "toilet-repair", name: "Additional Toilet Repair", price: 180 },
        { id: "water-heater", name: "Water Heater Service", price: 400 }
      ]
    },
    "electrical": {
      title: "Electrical Service",
      icon: Zap,
      basePrice: 450,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.2 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.1 },
        { value: "villa", label: "Villa", multiplier: 1.4 }
      ],
      electricalIssues: [
        { value: "power-outage", label: "Power Outage/No Electricity", price: 450, description: "Complete loss of power or electrical supply issues" },
        { value: "flickering-lights", label: "Flickering or Dim Lights", price: 320, description: "Light fixtures flickering, dimming, or not working properly" },
        { value: "outlet-not-working", label: "Outlets Not Working", price: 280, description: "Power outlets not functioning or sparking" },
        { value: "circuit-breaker", label: "Circuit Breaker Issues", price: 380, description: "Breakers tripping frequently or not resetting" },
        { value: "wiring-problems", label: "Faulty Wiring", price: 650, description: "Old, damaged, or unsafe electrical wiring" },
        { value: "electrical-panel", label: "Electrical Panel Problems", price: 800, description: "Main electrical panel issues or upgrades needed" },
        { value: "appliance-installation", label: "Appliance Installation", price: 350, description: "Installing new electrical appliances or fixtures" },
        { value: "ceiling-fan", label: "Ceiling Fan Issues", price: 420, description: "Ceiling fan installation, repair, or replacement" },
        { value: "light-fixture", label: "Light Fixture Problems", price: 300, description: "Installing or repairing light fixtures" },
        { value: "electrical-safety", label: "Electrical Safety Check", price: 250, description: "Complete electrical system inspection and safety assessment" },
        { value: "generator-issues", label: "Generator Problems", price: 550, description: "Generator installation, repair, or maintenance" },
        { value: "other", label: "Other Electrical Issue", price: 450, description: "Custom electrical problem not listed above" }
      ],
      urgencyLevels: [
        { value: "emergency", label: "Emergency (24/7)", multiplier: 2.5 },
        { value: "urgent", label: "Urgent (Same Day)", multiplier: 1.8 },
        { value: "standard", label: "Standard (Next Day)", multiplier: 1.0 },
        { value: "scheduled", label: "Scheduled (Flexible)", multiplier: 0.9 }
      ],
      addOns: [
        { id: "outlet-install", name: "Additional Outlet Installation", price: 180 },
        { id: "light-fixture", name: "Extra Light Fixture", price: 220 },
        { id: "ceiling-fan", name: "Additional Ceiling Fan", price: 350 },
        { id: "electrical-panel", name: "Panel Upgrade", price: 800 },
        { id: "surge-protection", name: "Surge Protection Installation", price: 400 },
        { id: "gfci-outlets", name: "GFCI Outlet Installation", price: 150 },
        { id: "electrical-inspection", name: "Full Electrical Inspection", price: 300 }
      ]
    },
    "garden-maintenance": {
      title: "Garden Maintenance Service",
      icon: TreePine,
      basePrice: 320,
      steps: 4,
      propertyTypes: [
        { value: "house", label: "House Garden", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Garden", multiplier: 0.9 },
        { value: "estate-property", label: "Estate Property", multiplier: 1.4 }
      ],
      gardenSizes: [
        { value: "small", label: "Small (0-100m²)", multiplier: 1.0 },
        { value: "medium", label: "Medium (100-300m²)", multiplier: 1.5 },
        { value: "large", label: "Large (300-500m²)", multiplier: 2.0 },
        { value: "estate", label: "Estate (500m²+)", multiplier: 3.0 }
      ],
      gardenConditions: [
        { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
        { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
        { value: "overgrown", label: "Overgrown", multiplier: 1.5 },
        { value: "neglected", label: "Severely Neglected", multiplier: 1.8 }
      ],
      addOns: [
        { id: "lawn-care", name: "Lawn Mowing & Edging", price: 150 },
        { id: "pruning", name: "Tree & Shrub Pruning", price: 200 },
        { id: "weeding", name: "Weeding & Cleanup", price: 120 },
        { id: "seasonal-prep", name: "Seasonal Preparation", price: 100 }
      ]
    },
    "pool-cleaning": {
      title: "Pool Cleaning & Maintenance Service",
      icon: Droplet,
      basePrice: 350,
      steps: 4,
      propertyTypes: [
        { value: "house", label: "House Pool", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Pool", multiplier: 0.9 },
        { value: "estate-property", label: "Estate Property", multiplier: 1.4 }
      ],
      poolSizes: [
        { value: "small", label: "Small Pool (Up to 20,000L)", multiplier: 1.0 },
        { value: "medium", label: "Medium Pool (20,000-40,000L)", multiplier: 1.5 },
        { value: "large", label: "Large Pool (40,000-60,000L)", multiplier: 2.0 },
        { value: "olympic", label: "Olympic/Estate (60,000L+)", multiplier: 3.0 }
      ],
      poolConditions: [
        { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
        { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
        { value: "neglected", label: "Neglected/Green", multiplier: 1.5 }
      ],
      addOns: [
        { id: "chemical-balance", name: "Chemical Balancing", price: 180 },
        { id: "filter-clean", name: "Filter Deep Clean", price: 250 },
        { id: "vacuum-brush", name: "Vacuum & Brush Service", price: 150 },
        { id: "green-recovery", name: "Green Pool Recovery", price: 400 }
      ]
    },
    "chef-catering": {
      title: "Chef & Catering Service",
      icon: ChefHat,
      basePrice: 850,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment/Small Kitchen", multiplier: 1.0 },
        { value: "house", label: "House Kitchen", multiplier: 1.1 },
        { value: "townhouse", label: "Townhouse Kitchen", multiplier: 1.05 },
        { value: "villa", label: "Villa/Large Kitchen", multiplier: 1.3 }
      ],
      cuisineTypes: [
        { 
          value: "south-african", 
          label: "🇿🇦 South African Traditional", 
          multiplier: 1.0,
          popularMenus: [
            { name: "Traditional Braai", items: ["Boerewors", "Lamb Chops", "Chicken", "Pap & Morogo", "Chakalaka", "Potato Salad"], price: 850 },
            { name: "Heritage Feast", items: ["Bobotie", "Yellow Rice", "Green Beans", "Sambals", "Milk Tart"], price: 920 },
            { name: "Potjiekos Experience", items: ["Traditional Potjie", "Steamed Bread", "Roasted Vegetables", "Koeksisters"], price: 780 }
          ],
          customItems: ["Boerewors", "Sosaties", "Bobotie", "Potjiekos", "Biltong", "Droëwors", "Koeksisters", "Milk Tart", "Malva Pudding", "Pap & Morogo", "Chakalaka", "Roosterkoek"]
        },
        { 
          value: "west-african", 
          label: "🌍 West African", 
          multiplier: 1.1,
          popularMenus: [
            { name: "Nigerian Feast", items: ["Jollof Rice", "Suya", "Plantain", "Pepper Soup", "Chin Chin"], price: 950 },
            { name: "Ghanaian Special", items: ["Banku", "Tilapia", "Kelewele", "Groundnut Soup", "Fufu"], price: 920 },
            { name: "Senegalese Delight", items: ["Thieboudienne", "Yassa Chicken", "Bissap Drink", "Pastels"], price: 890 }
          ],
          customItems: ["Jollof Rice", "Fufu", "Banku", "Suya", "Kelewele", "Plantain", "Yassa", "Thieboudienne", "Bissap", "Chin Chin", "Pepper Soup", "Palm Nut Soup"]
        },
        { 
          value: "east-african", 
          label: "🌍 East African", 
          multiplier: 1.1,
          popularMenus: [
            { name: "Ethiopian Experience", items: ["Injera", "Doro Wat", "Kitfo", "Vegetarian Combo", "Ethiopian Coffee"], price: 940 },
            { name: "Kenyan Safari", items: ["Nyama Choma", "Ugali", "Sukuma Wiki", "Pilau Rice", "Mandazi"], price: 880 },
            { name: "Tanzanian Taste", items: ["Pilau", "Mishkaki", "Chapati", "Coconut Rice", "Urojo Soup"], price: 910 }
          ],
          customItems: ["Injera", "Doro Wat", "Kitfo", "Ugali", "Nyama Choma", "Sukuma Wiki", "Pilau", "Mishkaki", "Chapati", "Mandazi", "Coconut Rice", "Ethiopian Coffee"]
        },
        { 
          value: "north-african", 
          label: "🌍 North African", 
          multiplier: 1.2,
          popularMenus: [
            { name: "Moroccan Royal", items: ["Tagine", "Couscous", "Pastilla", "Harira Soup", "Mint Tea", "Baklava"], price: 1050 },
            { name: "Egyptian Pharaoh", items: ["Koshari", "Molokhia", "Fattah", "Basbousa", "Hibiscus Juice"], price: 980 },
            { name: "Tunisian Treasure", items: ["Couscous Tunisien", "Brik", "Harissa Chicken", "Makroudh"], price: 920 }
          ],
          customItems: ["Tagine", "Couscous", "Pastilla", "Harira", "Koshari", "Molokhia", "Brik", "Harissa", "Mint Tea", "Baklava", "Makroudh", "Basbousa"]
        },
        { 
          value: "central-african", 
          label: "🌍 Central African", 
          multiplier: 1.15,
          popularMenus: [
            { name: "Congolese Celebration", items: ["Fufu", "Ndolé", "Grilled Fish", "Plantain", "Palm Wine"], price: 890 },
            { name: "Cameroonian Combo", items: ["Jollof Rice", "Pepper Soup", "Banga Soup", "Puff Puff"], price: 860 }
          ],
          customItems: ["Fufu", "Ndolé", "Banga Soup", "Pepper Soup", "Cassava", "Plantain", "Palm Wine", "Puff Puff", "Grilled Fish"]
        }
      ],
      dietaryRequirements: [
        { value: "halaal", label: "🕌 Halaal Certified", description: "Strictly Halaal ingredients and preparation" },
        { value: "kosher", label: "✡️ Kosher Certified", description: "Kosher ingredients and supervision" },
        { value: "vegan", label: "🌱 Vegan", description: "Plant-based ingredients only" },
        { value: "vegetarian", label: "🥬 Vegetarian", description: "No meat, fish allowed" },
        { value: "gluten-free", label: "🌾 Gluten-Free", description: "No wheat, barley, rye products" },
        { value: "keto", label: "🥑 Keto-Friendly", description: "Low-carb, high-fat diet" },
        { value: "diabetic", label: "🩺 Diabetic-Friendly", description: "Low sugar, controlled carbs" },
        { value: "nut-free", label: "🥜 Nut-Free", description: "No tree nuts or peanuts" },
        { value: "dairy-free", label: "🥛 Dairy-Free", description: "No milk products" }
      ],
      eventSizes: [
        { value: "intimate", label: "Intimate Dining (2-8 people)", multiplier: 1.0 },
        { value: "small", label: "Small Gathering (9-15 people)", multiplier: 1.5 },
        { value: "medium", label: "Medium Event (16-30 people)", multiplier: 2.2 },
        { value: "large", label: "Large Celebration (31-50 people)", multiplier: 3.5 },
        { value: "corporate", label: "Corporate Event (50+ people)", multiplier: 5.0 }
      ],
      addOns: [
        { id: "premium-ingredients", name: "🥩 Premium Ingredient Sourcing", price: 200, description: "Organic, free-range, premium quality ingredients" },
        { id: "full-service", name: "👥 Full Service Experience", price: 400, description: "Professional waitering, bartending, setup & cleanup" },
        { id: "dietary-specialist", name: "🥗 Dietary Specialist Chef", price: 250, description: "Specialized chef for dietary requirements" },
        { id: "cooking-demo", name: "👨‍🍳 Live Cooking Demonstration", price: 300, description: "Interactive cooking experience with guests" },
        { id: "recipe-cards", name: "📝 Custom Recipe Cards", price: 150, description: "Take-home recipe cards for prepared dishes" },
        { id: "wine-pairing", name: "🍷 Wine & Beverage Pairing", price: 350, description: "Professional sommelier and beverage selection" },
        { id: "traditional-setup", name: "🎭 Traditional Cultural Setup", price: 280, description: "Authentic cultural decorations and presentation" }
      ]
    },
    "event-staff": {
      title: "Event Staffing Service",
      icon: Users,
      basePrice: 180,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment/Small Space", multiplier: 0.8 },
        { value: "house", label: "House Event", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Event", multiplier: 0.9 },
        { value: "villa", label: "Villa/Large Event", multiplier: 1.4 }
      ],
      staffTypes: [
        { value: "waiters", label: "Professional Waiters", price: 180 },
        { value: "bartenders", label: "Bartenders", price: 220 },
        { value: "security", label: "Event Security", price: 300 },
        { value: "coordinators", label: "Event Coordinators", price: 400 }
      ],
      eventSizes: [
        { value: "small", label: "Small (10-25 guests)", multiplier: 1.0 },
        { value: "medium", label: "Medium (26-50 guests)", multiplier: 1.5 },
        { value: "large", label: "Large (51-100 guests)", multiplier: 2.5 },
        { value: "corporate", label: "Corporate (100+ guests)", multiplier: 4.0 }
      ],
      addOns: [
        { id: "uniform-rental", name: "Professional Uniform Rental", price: 50 },
        { id: "overtime-coverage", name: "Overtime Coverage", price: 120 },
        { id: "event-setup", name: "Event Setup Assistance", price: 200 },
        { id: "cleanup-service", name: "Post-Event Cleanup", price: 250 }
      ]
    },
    "beauty-wellness": {
      title: "Beauty & Wellness Service",
      icon: Scissors,
      basePrice: 280,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment Visit", multiplier: 1.0 },
        { value: "house", label: "House Visit", multiplier: 1.1 },
        { value: "townhouse", label: "Townhouse Visit", multiplier: 1.05 },
        { value: "villa", label: "Villa Visit", multiplier: 1.2 }
      ],
      serviceTypes: [
        { value: "hair-styling", label: "Hair Styling & Cut", price: 280 },
        { value: "manicure-pedicure", label: "Manicure & Pedicure", price: 220 },
        { value: "massage-therapy", label: "Massage Therapy", price: 400 },
        { value: "makeup-artistry", label: "Makeup Artistry", price: 350 }
      ],
      sessionDuration: [
        { value: "quick", label: "Quick Session (30-60 min)", multiplier: 1.0 },
        { value: "standard", label: "Standard Session (1-2 hours)", multiplier: 1.5 },
        { value: "extended", label: "Extended Session (2-3 hours)", multiplier: 2.2 },
        { value: "full-day", label: "Full Day Package", multiplier: 4.0 }
      ],
      addOns: [
        { id: "premium-products", name: "Premium Product Upgrade", price: 150 },
        { id: "group-discount", name: "Group Service (2+ people)", price: -50 },
        { id: "travel-kit", name: "Professional Travel Kit", price: 100 },
        { id: "follow-up-care", name: "Follow-up Care Package", price: 80 }
      ]
    },
    "moving": {
      title: "Moving Services",
      icon: Wrench,
      basePrice: 600,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment/1-2 Bedrooms", multiplier: 1.0 },
        { value: "house", label: "House/3-4 Bedrooms", multiplier: 1.4 },
        { value: "townhouse", label: "Townhouse/2-3 Bedrooms", multiplier: 1.2 },
        { value: "villa", label: "Villa/5+ Bedrooms", multiplier: 1.8 }
      ],
      movingTypes: [
        { value: "local", label: "Local Moving (Same City)", price: 600, description: "Moving within the same city or nearby areas" },
        { value: "long-distance", label: "Long-Distance Moving", price: 1200, description: "Intercity or interstate moving" },
        { value: "office", label: "Office Relocation", price: 800, description: "Business and office moving services" },
        { value: "furniture", label: "Furniture Moving & Assembly", price: 400, description: "Specialized furniture transport and setup" },
        { value: "packing", label: "Packing & Unpacking Services", price: 350, description: "Professional packing and unpacking assistance" },
        { value: "piano", label: "Piano & Specialty Items", price: 900, description: "Special handling for delicate items" }
      ],
      movingDistance: [
        { value: "local", label: "Local (0-50km)", multiplier: 1.0 },
        { value: "regional", label: "Regional (50-200km)", multiplier: 1.5 },
        { value: "long-distance", label: "Long Distance (200km+)", multiplier: 2.2 }
      ],
      addOns: [
        { id: "packing-materials", name: "Packing Materials Supply", price: 200 },
        { id: "storage", name: "Temporary Storage (1 month)", price: 300 },
        { id: "insurance", name: "Premium Moving Insurance", price: 150 },
        { id: "disassembly", name: "Furniture Disassembly/Assembly", price: 250 },
        { id: "cleaning", name: "Post-Move Cleaning", price: 400 }
      ]
    },
    "au-pair": {
      title: "Au Pair Services",
      icon: Users,
      basePrice: 65,
      steps: 4,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.1 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.05 },
        { value: "villa", label: "Villa", multiplier: 1.2 }
      ],
      careTypes: [
        { value: "live-in", label: "Live-in Au Pair (6-12 months)", price: 3500, description: "Full-time live-in childcare provider" },
        { value: "part-time", label: "Part-time Childcare", price: 65, description: "Flexible part-time childcare hours" },
        { value: "after-school", label: "After-school Care", price: 80, description: "Care and supervision after school hours" },
        { value: "weekend", label: "Weekend & Holiday Care", price: 90, description: "Weekend and special occasion care" },
        { value: "overnight", label: "Overnight Babysitting", price: 120, description: "Extended overnight care services" },
        { value: "educational", label: "Educational Support & Tutoring", price: 95, description: "Homework help and educational activities" }
      ],
      childrenCount: [
        { value: "1", label: "1 Child", multiplier: 1.0 },
        { value: "2", label: "2 Children", multiplier: 1.4 },
        { value: "3", label: "3 Children", multiplier: 1.7 },
        { value: "4+", label: "4+ Children", multiplier: 2.0 }
      ],
      childrenAges: [
        { value: "infant", label: "Infant (0-1 year)", multiplier: 1.3 },
        { value: "toddler", label: "Toddler (1-3 years)", multiplier: 1.2 },
        { value: "preschool", label: "Preschool (3-5 years)", multiplier: 1.1 },
        { value: "school", label: "School Age (6+ years)", multiplier: 1.0 }
      ],
      addOns: [
        { id: "background-check", name: "Enhanced Background Check", price: 120 },
        { id: "first-aid", name: "Certified First Aid Training", price: 80 },
        { id: "transport", name: "Child Transportation Service", price: 100 },
        { id: "meal-prep", name: "Meal Preparation for Children", price: 60 },
        { id: "overnight", name: "Overnight Care Available", price: 150 }
      ]
    }
  };

  // Map service IDs to their correct configurations
  const serviceIdMapping: Record<string, string> = {
    "cleaning": "cleaning",
    "house-cleaning": "cleaning", // Map house-cleaning to cleaning config
    "gardening": "garden-care", // Database ID → config (all garden services use garden-care config)
    "garden-care": "garden-care",
    "garden-maintenance": "garden-care", // Consolidate to single garden config
    "pool-cleaning": "pool-cleaning",
    "plumbing": "plumbing",
    "plumbing-services": "plumbing",
    "electrical": "electrical",
    "electrical-services": "electrical",
    "chef-catering": "chef-catering",
    "waitering": "event-staff", // waitering maps to event-staff config
    "event-staff": "event-staff",
    "event-staffing": "event-staff",
    "beauty-wellness": "beauty-wellness",
    "moving": "moving",
    "au-pair": "au-pair"
  };

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
      serviceName: currentConfig.title,
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
      serviceName: currentConfig.title,
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
      serviceName: currentConfig.title,
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
        description: `${currentConfig.title} added successfully. Redirecting to cart...`
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
        <div>
          <Label htmlFor="property-type">Property Type *</Label>
          <Select value={formData.propertyType} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, propertyType: value }))
          }>
            <SelectTrigger data-testid="select-property-type">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {currentConfig.propertyTypes?.map((type: any) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="address">Service Address *</Label>
          <div className="space-y-3">
            <Input
              id="address"
              placeholder="Enter your service address"
              value={formData.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full"
              data-testid="input-address"
            />
            {formData.address && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Address confirmed - Provider matching within 20km radius
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conditional Gate Code Field (Phase 3.2 - Secure) */}
        {(formData.propertyType === "apartment" || formData.propertyType === "townhouse" || formData.propertyType === "villa") && (
          <div>
            <Label htmlFor="gate-code">Gate/Access Code (Optional)</Label>
            <Input
              id="gate-code"
              type="password"
              placeholder="Enter gate or access code"
              value={formData.gateCode}
              onChange={(e) => setFormData(prev => ({ ...prev, gateCode: e.target.value }))}
              className="w-full"
              data-testid="input-gate-code"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <LockIcon className="h-3 w-3" />
              Encrypted and only shared with your assigned provider
            </p>
          </div>
        )}

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
          <>
            <div>
              <Label>Staff Type *</Label>
              <Select value={formData.cleaningType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, cleaningType: value }))
              }>
                <SelectTrigger data-testid="select-staff-type">
                  <SelectValue placeholder="Select staff type" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.staffTypes?.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - R{type.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Event Size *</Label>
              <Select value={formData.propertySize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, propertySize: value }))
              }>
                <SelectTrigger data-testid="select-event-size">
                  <SelectValue placeholder="Select event size" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.eventSizes?.map((size: any) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
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
                  {currentConfig.movingTypes?.map((type: any) => (
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
                  {currentConfig.movingDistance?.map((distance: any) => (
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
                  {currentConfig.careTypes?.map((type: any) => (
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
                  {currentConfig.childrenCount?.map((count: any) => (
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
                  {currentConfig.childrenAges?.map((age: any) => (
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
          <>
            <div>
              <Label>Cuisine Type *</Label>
              <Select value={formData.cuisineType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, cuisineType: value, selectedMenu: "", customMenuItems: [] }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.cuisineTypes?.map((cuisine: any) => (
                    <SelectItem key={cuisine.value} value={cuisine.value}>
                      {cuisine.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Event Size *</Label>
              <Select value={formData.eventSize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, eventSize: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select event size" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.eventSizes?.map((size: any) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dietary Requirements</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
                {currentConfig.dietaryRequirements?.map((req: any) => (
                  <div key={req.value} className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={formData.dietaryRequirements.includes(req.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            dietaryRequirements: [...prev.dietaryRequirements, req.value]
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            dietaryRequirements: prev.dietaryRequirements.filter((r: string) => r !== req.value)
                          }));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium cursor-pointer">{req.label}</label>
                      <p className="text-xs text-gray-500">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.cuisineType && (
              <div>
                <Label>Menu Selection *</Label>
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.menuSelection === "popular" 
                          ? "border-primary bg-primary/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, menuSelection: "popular", customMenuItems: [] }))}
                    >
                      <h4 className="font-semibold text-sm">Popular Menus</h4>
                      <p className="text-xs text-gray-500">Pre-designed menu combinations</p>
                    </div>
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.menuSelection === "custom" 
                          ? "border-primary bg-primary/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, menuSelection: "custom", selectedMenu: "" }))}
                    >
                      <h4 className="font-semibold text-sm">Custom Menu</h4>
                      <p className="text-xs text-gray-500">Build your own menu</p>
                    </div>
                  </div>

                  {formData.menuSelection === "popular" && (
                    <div>
                      <Label>Choose Popular Menu *</Label>
                      <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                        {currentConfig.cuisineTypes
                          ?.find((c: any) => c.value === formData.cuisineType)
                          ?.popularMenus?.map((menu: any, i: number) => (
                          <div 
                            key={i}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.selectedMenu === menu.name
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, selectedMenu: menu.name }))}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-sm">{menu.name}</h5>
                                <p className="text-xs text-gray-600 mt-1">
                                  {menu.items.join(", ")}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-primary">R{menu.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.menuSelection === "custom" && (
                    <div>
                      <Label>Build Custom Menu *</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                        {currentConfig.cuisineTypes
                          ?.find((c: any) => c.value === formData.cuisineType)
                          ?.customItems?.map((item: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              checked={formData.customMenuItems.includes(item)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    customMenuItems: [...prev.customMenuItems, item]
                                  }));
                                } else {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    customMenuItems: prev.customMenuItems.filter((i: string) => i !== item)
                                  }));
                                }
                              }}
                            />
                            <label className="text-sm cursor-pointer flex-1">{item}</label>
                          </div>
                        ))}
                      </div>
                      {formData.customMenuItems.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h6 className="font-semibold text-sm text-blue-800">Selected Items:</h6>
                          <p className="text-xs text-blue-600 mt-1">
                            {formData.customMenuItems.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
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

  const renderStep4 = () => {
    // Phase 5.2: Show ONLY locked Berry Star provider if pre-selected (no other providers shown)
    if (preSelectedProviderId && preSelectedProviderName) {
      // Create provider object from pre-selected data
      const provider = formData.selectedProvider || { 
        id: preSelectedProviderId, 
        name: preSelectedProviderName,
        rating: 4.9,
        reviews: 150,
        distance: "2.5 km",
        specializations: ["Berry Star", "Top Rated"],
        verified: true,
        verifiedBadges: ["Berry Star", "Verified", "Top Rated"],
        responseTime: "< 1 hour",
        hourlyRate: 350
      };
      
      // Ensure provider is selected in form data
      if (!formData.selectedProvider) {
        setFormData(prev => ({ ...prev, selectedProvider: provider }));
      }
      
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3 fill-current" />
            <h3 className="text-lg font-semibold">Berry Star Provider Selected</h3>
            <p className="text-gray-600 text-sm">
              You've chosen one of our top-rated Berry Star professionals
            </p>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <p className="text-xs text-yellow-700 flex items-center justify-center">
                <Star className="h-4 w-4 mr-2 fill-current" />
                Berry Stars are our highest-rated providers with proven excellence
              </p>
            </div>
          </div>

          {/* Locked Provider Card */}
          <Card className="ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-50/50 to-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white fill-current" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                    <Badge className="bg-yellow-500 text-white">Berry Star</Badge>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                      {provider.rating} ({provider.reviews})
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {provider.distance}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {provider.responseTime}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {provider.verifiedBadges?.map((badge: string) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm font-semibold text-gray-700">
                      R{provider.hourlyRate}/hour
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <LockIcon className="h-3 w-3 mr-1" />
                      Pre-Selected
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">
              This Berry Star provider is pre-selected for this booking. 
              Proceed to add to cart or complete your booking.
            </p>
          </div>
        </div>
      );
    }

    // Normal provider selection flow
    return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Choose Your Verified Provider</h3>
        <p className="text-gray-600 text-sm">
          Showing {providers.length} verified professionals within 20km radius matching your requirements
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-blue-700 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            All providers are background-checked, insured, and rated 4.5+ stars
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id}
            className={`transition-all ${
              formData.selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* ENHANCED DETAILS: Show profile image for House Cleaning & Plumbing */}
                {showEnhancedProviderDetails && provider.profileImage ? (
                  <img 
                    src={provider.profileImage} 
                    alt={provider.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 
                      className="font-semibold text-primary underline cursor-pointer hover:text-primary/80"
                      onClick={() => setProviderDetailsModal(provider)}
                    >
                      {provider.name}
                    </h4>
                    {provider.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  {/* ENHANCED DETAILS: Show bio for House Cleaning & Plumbing */}
                  {showEnhancedProviderDetails && provider.bio && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{provider.bio}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                      {provider.rating} ({provider.reviews} reviews)
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {provider.distance}km
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {provider.responseTime}
                    </div>
                  </div>
                  
                  {/* ENHANCED DETAILS: Show jobs completed and experience for House Cleaning & Plumbing */}
                  {showEnhancedProviderDetails && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      {provider.jobsCompleted && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-success" />
                          {provider.jobsCompleted} jobs completed
                        </div>
                      )}
                      {provider.experience && (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          {provider.experience} years exp.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* ENHANCED DETAILS: Show qualifications for House Cleaning & Plumbing */}
                  {showEnhancedProviderDetails && provider.qualifications && provider.qualifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.qualifications.map((qual: string) => (
                        <Badge key={qual} variant="secondary" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Show specializations for all services OR availability for House Cleaning */}
                  {!isHouseCleaning && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.specializations.slice(0, 2).map((spec: string) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {isHouseCleaning && provider.availability && (
                    <div className="text-xs text-gray-600 mb-2">
                      Available: {provider.availability}
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant={formData.selectedProvider?.id === provider.id ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, selectedProvider: provider }))}
                    className="w-full"
                    data-testid={`button-select-provider-${provider.id}`}
                  >
                    {formData.selectedProvider?.id === provider.id ? "Selected" : "Select Provider"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* ENHANCED SERVICES: Tip input section for House Cleaning, Plumbing, Electrical, Garden, Chef, Waitering, Moving, Au Pair */}
      {showEnhancedProviderDetails && formData.selectedProvider && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <Label className="text-sm font-semibold mb-2 block">Add a tip for your provider (optional)</Label>
            <p className="text-xs text-gray-600 mb-3">Show your appreciation for excellent service</p>
            
            <div className="flex gap-2 mb-3">
              {[0, 20, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  size="sm"
                  variant={formData.tipAmount === amount ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, tipAmount: amount }))}
                  className="flex-1"
                  data-testid={`button-tip-${amount}`}
                >
                  R{amount}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-tip" className="text-xs whitespace-nowrap">Custom:</Label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">R</span>
                <Input
                  id="custom-tip"
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  value={formData.tipAmount || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    // Handle empty string as 0
                    if (rawValue === '' || rawValue === null || rawValue === undefined) {
                      setFormData(prev => ({ ...prev, tipAmount: 0 }));
                      return;
                    }
                    
                    const value = parseFloat(rawValue);
                    // Validate number and range
                    if (!isNaN(value) && value >= 0 && value <= 1000) {
                      // Round to 2 decimal places for currency
                      const rounded = Math.round(value * 100) / 100;
                      setFormData(prev => ({ ...prev, tipAmount: rounded }));
                    }
                  }}
                  className="pl-8"
                  placeholder="0"
                  data-testid="input-custom-tip"
                />
              </div>
            </div>
            
            {formData.tipAmount > 0 && (
              <p className="text-xs text-success mt-2">
                ✓ R{formData.tipAmount.toFixed(2)} tip will be added to your total
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {bookedServices.length > 0 && (
        <div className="text-sm text-gray-600 text-center mt-4">
          Already booked: {bookedServices.length} service{bookedServices.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
    );
  };

  const renderStep5 = () => {
    // Create current draft from form data (plain variables, not hooks)
    const currentDraft = {
      serviceId,
      serviceName: currentConfig.title,
      ...formData,
      pricing,
      estimatedHours,
      timestamp: new Date().toISOString()
    };

    // Aggregate all services (pending + current)
    const paymentSnapshot = aggregatePayments(pendingDrafts, currentDraft);

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Summary</h3>
          <p className="text-gray-600">Review your services and complete payment</p>
        </div>

        {/* Multi-Service Summary */}
        {paymentSnapshot.services.length > 1 && (
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Booking {paymentSnapshot.services.length} Services</span>
                <Badge className="bg-green-600">{paymentSnapshot.services.length}x Services</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentSnapshot.lineItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{item.serviceName}</h4>
                    <span className="font-bold text-primary">R{item.total}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>R{item.basePrice}</span>
                    </div>
                    {item.addOns > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Add-ons:</span>
                        <span>+R{item.addOns}</span>
                      </div>
                    )}
                    {item.discounts > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discounts:</span>
                        <span>-R{item.discounts}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Separator />
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R{paymentSnapshot.subtotal}</span>
                </div>
                {paymentSnapshot.totalDiscounts > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Total Discounts:</span>
                    <span>-R{paymentSnapshot.totalDiscounts}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Grand Total:</span>
                  <span>R{paymentSnapshot.grandTotal}</span>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Includes R{paymentSnapshot.commission} platform fee (15%)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Select Payment Method</Label>
          <div className="grid grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer border-2 transition-all ${
              formData.paymentMethod === "card" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "card" }))}
          >
            <CardContent className="p-4 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Credit/Debit Card</h4>
              <p className="text-sm text-gray-600">Secure card payment</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer border-2 transition-all ${
              formData.paymentMethod === "bank" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "bank" }))}
          >
            <CardContent className="p-4 text-center">
              <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Bank Transfer</h4>
              <p className="text-sm text-gray-600">Direct bank transfer</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Card Payment Form */}
      {formData.paymentMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Card Details
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure Payment</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cardholder Name */}
            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <div className="relative">
                <Input
                  id="cardholderName"
                  data-testid="input-cardholder-name"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, cardholderName: e.target.value }));
                    if (paymentTouched.cardholderName) {
                      validateField('cardholderName', e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    markTouched('cardholderName');
                    validateField('cardholderName', e.target.value);
                  }}
                  className={`pr-10 ${
                    paymentTouched.cardholderName && !paymentErrors.cardholderName 
                      ? 'border-green-500' 
                      : paymentTouched.cardholderName && paymentErrors.cardholderName 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
                {paymentTouched.cardholderName && !paymentErrors.cardholderName && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {paymentTouched.cardholderName && paymentErrors.cardholderName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {paymentErrors.cardholderName}
                </p>
              )}
            </div>

            {/* Card Number with Brand Detection */}
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  data-testid="input-card-number"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setFormData(prev => ({ ...prev, cardNumber: formatted }));
                    if (paymentTouched.cardNumber) {
                      validateField('cardNumber', formatted);
                    }
                  }}
                  onBlur={(e) => {
                    markTouched('cardNumber');
                    validateField('cardNumber', e.target.value);
                  }}
                  maxLength={19}
                  className={`pr-16 ${
                    paymentTouched.cardNumber && !paymentErrors.cardNumber 
                      ? 'border-green-500' 
                      : paymentTouched.cardNumber && paymentErrors.cardNumber 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
                {/* Card Brand Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {cardBrand && (
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {cardBrand}
                    </span>
                  )}
                  {paymentTouched.cardNumber && !paymentErrors.cardNumber && cardBrand && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
              {paymentTouched.cardNumber && paymentErrors.cardNumber && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {paymentErrors.cardNumber}
                </p>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <div className="relative">
                  <Input
                    id="expiryDate"
                    data-testid="input-expiry-date"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setFormData(prev => ({ ...prev, expiryDate: formatted }));
                      if (paymentTouched.expiryDate) {
                        validateField('expiryDate', formatted);
                      }
                    }}
                    onBlur={(e) => {
                      markTouched('expiryDate');
                      validateField('expiryDate', e.target.value);
                    }}
                    maxLength={5}
                    className={`pr-10 ${
                      paymentTouched.expiryDate && !paymentErrors.expiryDate 
                        ? 'border-green-500' 
                        : paymentTouched.expiryDate && paymentErrors.expiryDate 
                        ? 'border-red-500' 
                        : ''
                    }`}
                  />
                  {paymentTouched.expiryDate && !paymentErrors.expiryDate && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                  )}
                </div>
                {paymentTouched.expiryDate && paymentErrors.expiryDate && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {paymentErrors.expiryDate}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    data-testid="input-cvv"
                    placeholder={cardBrand === 'American Express' ? '1234' : '123'}
                    value={formData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, cvv: value }));
                      if (paymentTouched.cvv) {
                        validateField('cvv', value);
                      }
                    }}
                    onBlur={(e) => {
                      markTouched('cvv');
                      validateField('cvv', e.target.value);
                    }}
                    maxLength={cardBrand === 'American Express' ? 4 : 3}
                    type="password"
                    className={`pr-10 ${
                      paymentTouched.cvv && !paymentErrors.cvv 
                        ? 'border-green-500' 
                        : paymentTouched.cvv && paymentErrors.cvv 
                        ? 'border-red-500' 
                        : ''
                    }`}
                  />
                  {paymentTouched.cvv && !paymentErrors.cvv && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                  )}
                </div>
                {paymentTouched.cvv && paymentErrors.cvv && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {paymentErrors.cvv}
                  </p>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-3">
                <LockIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-green-800">
                  <p className="font-semibold mb-1">Your payment is secure</p>
                  <ul className="space-y-0.5 text-green-700">
                    <li>• 256-bit SSL encryption</li>
                    <li>• PCI DSS compliant</li>
                    <li>• No card details stored</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Transfer Form */}
      {formData.paymentMethod === "bank" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Bank Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank Selector */}
            <div>
              <Label htmlFor="selectedBank">Select Your Bank *</Label>
              <Select
                value={formData.selectedBank}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, selectedBank: value }));
                  if (paymentTouched.selectedBank) {
                    validateField('selectedBank', value);
                  }
                  if (formData.bankAccount) {
                    validateField('bankAccount', formData.bankAccount);
                  }
                }}
              >
                <SelectTrigger 
                  id="selectedBank"
                  data-testid="select-bank"
                  className={`${
                    paymentTouched.selectedBank && !paymentErrors.selectedBank 
                      ? 'border-green-500' 
                      : paymentTouched.selectedBank && paymentErrors.selectedBank 
                      ? 'border-red-500' 
                      : ''
                  }`}
                  onBlur={() => {
                    markTouched('selectedBank');
                    validateField('selectedBank', formData.selectedBank);
                  }}
                >
                  <SelectValue placeholder="Choose your bank..." />
                </SelectTrigger>
                <SelectContent>
                  {southAfricanBanks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {paymentTouched.selectedBank && paymentErrors.selectedBank && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {paymentErrors.selectedBank}
                </p>
              )}
              {paymentTouched.selectedBank && !paymentErrors.selectedBank && formData.selectedBank && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Bank selected
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bankAccount">Bank Account Number *</Label>
              <div className="relative">
                <Input
                  id="bankAccount"
                  data-testid="input-bank-account"
                  placeholder="1234567890"
                  value={formData.bankAccount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, bankAccount: value }));
                    if (paymentTouched.bankAccount) {
                      validateField('bankAccount', value);
                    }
                  }}
                  onBlur={(e) => {
                    markTouched('bankAccount');
                    validateField('bankAccount', e.target.value);
                  }}
                  maxLength={12}
                  className={`pr-10 ${
                    paymentTouched.bankAccount && !paymentErrors.bankAccount 
                      ? 'border-green-500' 
                      : paymentTouched.bankAccount && paymentErrors.bankAccount 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
                {paymentTouched.bankAccount && !paymentErrors.bankAccount && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {paymentTouched.bankAccount && paymentErrors.bankAccount && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {paymentErrors.bankAccount}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="bankBranch">Branch Code *</Label>
              <div className="relative">
                <Input
                  id="bankBranch"
                  data-testid="input-bank-branch"
                  placeholder="123456"
                  value={formData.bankBranch}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, bankBranch: value }));
                    if (paymentTouched.bankBranch) {
                      validateField('bankBranch', value);
                    }
                  }}
                  onBlur={(e) => {
                    markTouched('bankBranch');
                    validateField('bankBranch', e.target.value);
                  }}
                  maxLength={6}
                  className={`pr-10 ${
                    paymentTouched.bankBranch && !paymentErrors.bankBranch 
                      ? 'border-green-500' 
                      : paymentTouched.bankBranch && paymentErrors.bankBranch 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
                {paymentTouched.bankBranch && !paymentErrors.bankBranch && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {paymentTouched.bankBranch && paymentErrors.bankBranch && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {paymentErrors.bankBranch}
                </p>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> You will receive payment instructions via email after confirming this booking. 
                Your service will be scheduled once payment is received.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Final Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Service</span>
            <span className="font-medium">{currentConfig.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Provider</span>
            <span className="font-medium">{formData.selectedProvider?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time</span>
            <span className="font-medium">{formData.preferredDate} at {formData.timePreference}</span>
          </div>
          <div className="flex justify-between">
            <span>Address</span>
            <span className="font-medium">{formData.address}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount</span>
            <span className="text-primary">R{pricing.totalPrice}</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Secured by Berry Events Bank - Your satisfaction guaranteed
          </p>
        </CardContent>
      </Card>
    </div>
    );
  };

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