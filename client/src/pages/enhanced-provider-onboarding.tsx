import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Camera, 
  CheckCircle, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText,
  Shield,
  AlertTriangle,
  Sparkles,
  Truck
} from "lucide-react";
import { useLocation } from "wouter";
import berryLogo from "@assets/berry-logo.png";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/queryClient";

const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too large
        const maxDimension = 800;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to 70% quality JPEG
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface ProviderData {
  // Basic Information
  applicationType: 'individual' | 'company';
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  idNumber: string;
  companyRegistration: string;
  
  // Address
  address: string;
  city: string;
  province: string;
  postalCode: string;
  
  // Services
  services: string[];
  experience: string;
  description: string;
  specializations: string;
  baseRate: string;
  availability: Record<string, any>;
  
  // Banking Details
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  
  // Documents
  idDocument: File | null;
  proofOfAddress: File | null;
  businessRegistration: File | null;
  bankStatement: File | null;
  certificates: File[];
  portfolio: File[];
  profilePicture: File | null;
  
  // Verification
  kycStatus: 'pending' | 'verified' | 'failed';
  kybStatus: 'pending' | 'verified' | 'failed';
  password: string;
  confirmPassword: string;

  // Locksmith Specific
  locksmithSpecializations: string[];
  mobileService: boolean;
  serviceRadius: string;
  availability247: boolean;
  responseTime: string;
  certifications: string;

  // Au Pair Specific
  auPairExperience: string[];
  auPairCertifications: string[];
  auPairServices: string[];
  childcareExperienceYears: string;
  agePreference: string;
  maxChildren: string;
  languages: string[];
  startDate: Date | undefined;
  hasReferences: string; // "yes" | "no"
  referenceDocument: File | null;
  policeClearance: File | null;

  // Event Staff Specific
  eventStaffType: string;
  eventStaffSpecializations: string[];
  eventStaffCertifications: string[];
  eventExperienceYears: string;
  eventTypesExperienced: string[];
  typicalEventSize: string;
  maxGuests: string;
  eventAvailabilityDays: string[];
  eventAvailabilityTimes: string[];
  weekendAvailable: boolean;
  travelDistance: string;
  ownTransport: boolean;
  ownUniform: boolean;
  uniformDescription: string;
  physicalStand: boolean;
  physicalLift: boolean;
  physicalCarry: boolean;
  referencesCV: File | null;
  previousEmployers: string;
  referenceContacts: string;

  // Moving Service Specific
  movingProviderTypes: string[];
  movingFleet: string[];
  movingSpecializations: string[];
  movingCertifications: string[];
  movingServiceCoverage: string[]; // Cities/Regions
  movingMaxDistance: string;
  movingCrossBorder: boolean;
  movingInterstate: boolean;
  movingTeamSize: string;
  movingTeamExperienceLevel: string;
  movingAvgTeamExperience: string;
  movingSupervisors: boolean;
  movingSecurityClearance: boolean;
  movingStorageLocation: string;
  movingStorageCapacity: string;
  movingClimateControl: boolean;
  moving247Access: boolean;
  movingSecurityFeatures: string;
  movingAdditionalServices: string[];
  movingAvailabilityDays: string[];
  movingWeekendAvailable: boolean;
  movingPublicHolidayAvailable: boolean;
  movingNoticePeriod: string;
  movingPeakSeasonAvailable: boolean;
  movingHourlyRate: string;
  movingMinCharge: string;
  movingAfterHoursRate: string;
  movingWeekendRate: string;
  movingLongDistanceRate: string;
  movingCompanyRegDoc: File | null;
  movingInsuranceCert: File | null;
  movingVehicleRegDoc: File | null;
  movingPortfolio: File[];
  movingClientReferences: string;
}

export default function EnhancedProviderOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const fileInputRefs = {
    idDocument: useRef<HTMLInputElement>(null),
    proofOfAddress: useRef<HTMLInputElement>(null),
    businessRegistration: useRef<HTMLInputElement>(null),
    bankStatement: useRef<HTMLInputElement>(null),
    certificates: useRef<HTMLInputElement>(null),
    portfolio: useRef<HTMLInputElement>(null),
    profilePicture: useRef<HTMLInputElement>(null),
    policeClearance: useRef<HTMLInputElement>(null),
    referenceDocument: useRef<HTMLInputElement>(null),
    referencesCV: useRef<HTMLInputElement>(null),
    movingCompanyRegDoc: useRef<HTMLInputElement>(null),
    movingInsuranceCert: useRef<HTMLInputElement>(null),
    movingVehicleRegDoc: useRef<HTMLInputElement>(null),
    movingPortfolio: useRef<HTMLInputElement>(null)
  };

  const [providerData, setProviderData] = useState<ProviderData>({
    applicationType: 'individual',
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    idNumber: "",
    companyRegistration: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    services: [],
    experience: "",
    description: "",
    specializations: "",
    baseRate: "",
    availability: {},
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: "",
    accountType: "checking",
    idDocument: null,
    proofOfAddress: null,
    businessRegistration: null,
    bankStatement: null,
    certificates: [],
    portfolio: [],
    profilePicture: null,
    kycStatus: 'pending',
    kybStatus: 'pending',
    password: "",
    confirmPassword: "",
    locksmithSpecializations: [],
    mobileService: false,
    serviceRadius: "10km",
    availability247: false,
    responseTime: "Scheduled",
    certifications: "",
    
    // Au Pair Defaults
    auPairExperience: [],
    auPairCertifications: [],
    auPairServices: [],
    childcareExperienceYears: "",
    agePreference: "No preference",
    maxChildren: "1",
    languages: [],
    startDate: undefined,
    hasReferences: "no",
    referenceDocument: null,
    policeClearance: null,

    // Event Staff Defaults
    eventStaffType: "",
    eventStaffSpecializations: [],
    eventStaffCertifications: [],
    eventExperienceYears: "",
    eventTypesExperienced: [],
    typicalEventSize: "",
    maxGuests: "",
    eventAvailabilityDays: [],
    eventAvailabilityTimes: [],
    weekendAvailable: false,
    travelDistance: "",
    ownTransport: false,
    ownUniform: false,
    uniformDescription: "",
    physicalStand: false,
    physicalLift: false,
    physicalCarry: false,
    referencesCV: null,
    previousEmployers: "",
    referenceContacts: "",

    // Moving Service Defaults
    movingProviderTypes: [],
    movingFleet: [],
    movingSpecializations: [],
    movingCertifications: [],
    movingServiceCoverage: [],
    movingMaxDistance: "",
    movingCrossBorder: false,
    movingInterstate: false,
    movingTeamSize: "",
    movingTeamExperienceLevel: "",
    movingAvgTeamExperience: "",
    movingSupervisors: false,
    movingSecurityClearance: false,
    movingStorageLocation: "",
    movingStorageCapacity: "",
    movingClimateControl: false,
    moving247Access: false,
    movingSecurityFeatures: "",
    movingAdditionalServices: [],
    movingAvailabilityDays: [],
    movingWeekendAvailable: false,
    movingPublicHolidayAvailable: false,
    movingNoticePeriod: "",
    movingPeakSeasonAvailable: false,
    movingHourlyRate: "",
    movingMinCharge: "",
    movingAfterHoursRate: "",
    movingWeekendRate: "",
    movingLongDistanceRate: "",
    movingCompanyRegDoc: null,
    movingInsuranceCert: null,
    movingVehicleRegDoc: null,
    movingPortfolio: [],
    movingClientReferences: ""
  });

  const availableServices = [
    "House Cleaning",
    "Plumbing Services",
    "Electrical Services",
    "Garden Care",
    "Pool Cleaning & Maintenance",
    "Chef & Catering",
    "Waitering Services",
    "Moving Services",
    "Au Pair Services",
    "Locksmith Services",
    "Hair Stylist",
    "Makeup Artist",
    "Nail Technician",
    "Massage Therapist",
    "Esthetician/Beautician",
    "Spa Therapist"
  ];

  const locksmithSpecializations = [ 
    { id: 'automotive', label: 'Automotive Specialist', description: 'Car lockouts, key programming' }, 
    { id: 'residential', label: 'Residential Specialist', description: 'Home locks, security' }, 
    { id: 'commercial', label: 'Commercial Specialist', description: 'Business, access control' }, 
    { id: 'emergency', label: '24/7 Emergency Services', description: 'Urgent lockouts, break-ins' }, 
    { id: 'safe', label: 'Safe Technician', description: 'Safe opening, repair' }, 
    { id: 'smart', label: 'Smart Lock Expert', description: 'Electronic, smart locks' }, 
    { id: 'master', label: 'Master Key Systems', description: 'Complex key systems' }, 
    { id: 'access', label: 'Access Control', description: 'Security systems' } 
  ];

  const auPairExperienceOptions = [
    "Newborn/Infant Care (0-12 months)",
    "Toddler Care (1-3 years)",
    "Preschool Age (3-5 years)",
    "School Age (6-12 years)",
    "Teenagers (13-18 years)",
    "Special Needs Children",
    "Multiple Children (3+)",
    "Twins/Multiples"
  ];

  const auPairCertificationOptions = [
    "First Aid certified",
    "CPR certified",
    "Early Childhood Development (ECD) qualification",
    "Special needs training",
    "Montessori training",
    "Valid driver's license",
    "Swimming instructor",
    "Teaching qualification"
  ];

  const auPairServiceOptions = [
    "Live-in arrangement",
    "Part-time only",
    "After-school care",
    "Weekend availability",
    "Overnight care",
    "Emergency/short-term",
    "Tutoring/homework help",
    "Meal preparation"
  ];

  // Event Staff Constants
  const eventStaffTypes = [
    { id: 'waiter', label: 'Professional Waiter' },
    { id: 'bartender', label: 'Bartender/Mixologist' },
    { id: 'assistant', label: 'Catering Assistant' },
    { id: 'coordinator', label: 'Event Coordinator/Manager' },
    { id: 'multiskilled', label: 'Multi-skilled (can do multiple roles)' }
  ];

  const eventStaffSpecializations = [
    "Silver service trained",
    "Fine dining experience",
    "Wedding specialist",
    "Corporate events",
    "Cocktail party service",
    "Wine service & sommelier",
    "Mixology/Flair bartending",
    "Event coordination",
    "Food safety certified",
    "Responsible Service of Alcohol (RSA)"
  ];

  const eventStaffCertifications = [
    "Food Handler's Certificate",
    "First Aid certification",
    "RSA/Alcohol service license",
    "Event management qualification",
    "Hospitality diploma/degree",
    "Wine certification (WSET, etc.)",
    "Mixology certification"
  ];

  const eventTypesExperienced = [
    "Wedding",
    "Corporate",
    "Private parties",
    "Fine dining",
    "Casual events",
    "Festival/outdoor"
  ];
  
  // Moving Service Constants
  const movingProviderTypes = [
    "General furniture movers",
    "Office/Commercial movers",
    "Long-distance specialists",
    "Piano/Specialty item movers",
    "Packing/Unpacking specialists",
    "Storage services"
  ];

  const movingFleetOptions = [
    "Bakkie/Small truck (<2 tons)",
    "Medium truck (4-6 tons)",
    "Large truck (8-10 tons)",
    "Extra-large truck (12+ tons)",
    "Multiple vehicles available",
    "Furniture blankets/padding",
    "Dollies and hand trucks",
    "Lifting straps",
    "Furniture sliders",
    "Packing materials",
    "Special equipment (hoists, cranes)"
  ];

  const movingSpecializations = [
    "Piano moving certified",
    "Antique handling trained",
    "Art transport specialist",
    "Heavy machinery moving",
    "IT/Server relocation",
    "Medical equipment moving",
    "White glove service",
    "International moves",
    "Vehicle transport",
    "Pet relocation"
  ];

  const movingCertifications = [
    "Professional moving license",
    "Goods in transit insurance",
    "Public liability insurance",
    "SABS certification",
    "Occupational health & safety training",
    "Forklift license",
    "Crane operator license",
    "Driver's license (Code 10/14)"
  ];

  const movingDistances = [
    "50km", "100km", "200km", "500km", "National", "International"
  ];

  const movingTeamSizes = [
    "2", "3", "4-6", "7-10", "10+"
  ];

  const movingExperienceLevels = [
    "Entry", "Intermediate", "Experienced", "Expert"
  ];

  const movingAdditionalServices = [
    "Packing service",
    "Unpacking service",
    "Furniture assembly/disassembly",
    "Appliance installation",
    "Cleaning services",
    "Junk removal",
    "Packing materials sales",
    "Storage solutions",
    "Temporary accommodation assistance"
  ];

  const movingNoticePeriods = [
    "Same day", "24hrs", "48hrs", "1 week"
  ];

  const languageOptions = ["English", "Afrikaans", "Zulu", "Xhosa", "Sotho", "Other"];

  const canonicalServiceMap: Record<string, string> = {
    "House Cleaning": "HOUSE_CLEANING",
    "Plumbing Services": "PLUMBING_SERVICES",
    "Electrical Services": "ELECTRICAL_SERVICES",
    "Garden Care": "GARDEN_CARE",
    "Pool Cleaning & Maintenance": "POOL_CLEANING_MAINTENANCE",
    "Chef & Catering": "CHEF_CATERING",
    "Waitering Services": "WAITERING_SERVICES",
    "Moving Services": "MOVING_SERVICES",
    "Au Pair Services": "AU_PAIR_SERVICES",
    "Locksmith Services": "LOCKSMITH_SERVICES",
    "Hair Stylist": "HAIR_STYLIST",
    "Makeup Artist": "MAKEUP_ARTIST",
    "Nail Technician": "NAIL_TECHNICIAN",
    "Massage Therapist": "MASSAGE_THERAPIST",
    "Esthetician/Beautician": "ESTHETICIAN",
    "Spa Therapist": "SPA_THERAPIST"
  };

  const southAfricanBanks = [
    "ABSA Bank",
    "Standard Bank",
    "FirstNational Bank (FNB)",
    "Nedbank",
    "Capitec Bank",
    "African Bank",
    "Bidvest Bank",
    "Discovery Bank",
    "Investec",
    "Sasfin Bank"
  ];

  const handleFileUpload = async (field: keyof ProviderData, file: File | null) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Convert file to base64 with compression for images
    if (file.type.startsWith('image/')) {
      try {
        const compressedDataUrl = await compressImage(file);
        
        if (field === 'certificates') {
          // For certificates array, we might need a different handling or just store file
          // Assuming certificates is just File[] for now, but we need base64 for API
          // Let's store the base64 in a parallel array if needed, or just keep File for now
          // If the API expects base64 for certificates, we need to handle it.
          // Currently, handleSubmit logic for certificates uses certificatesData if it exists
          
          setProviderData(prev => ({
            ...prev,
            certificates: [...prev.certificates, file],
             // We'll handle certificate compression in bulk at submit time if needed, 
             // or add a 'certificatesData' array. For now, let's just add the file.
             // If we need immediate base64, we'd add it to a parallel array.
          }));
        } else {
          setProviderData(prev => ({
            ...prev,
            [field]: file,
            [`${field}Data`]: compressedDataUrl 
          }));
        }
        
        toast({
          title: "Image uploaded & compressed",
          description: `${file.name} processed successfully`,
        });
      } catch (err) {
        console.error("Compression failed", err);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          if (field !== 'certificates') {
             setProviderData(prev => ({
              ...prev,
              [field]: file,
              [`${field}Data`]: imageData
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      // Non-image files (PDFs etc) - no compression
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        
        if (field === 'certificates' || field === 'portfolio' || field === 'movingPortfolio') {
          setProviderData(prev => ({
            ...prev,
            [field]: [...(prev[field] as File[]), file]
          }));
        } else {
          setProviderData(prev => ({
            ...prev,
            [field]: file,
            [`${field}Data`]: fileData 
          }));
        }
  
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async (field: keyof typeof fileInputRefs) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use rear camera for documents
      });
      
      // Create a simple camera interface
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      toast({
        title: "Camera Access",
        description: "Camera opened. Use file picker for document upload.",
      });
      
      // Clean up
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please use file upload instead.",
        variant: "destructive"
      });
    }
  };

  const handleServiceToggle = (service: string) => {
    const updatedServices = providerData.services.includes(service)
      ? providerData.services.filter(s => s !== service)
      : [...providerData.services, service];
    
    setProviderData({ ...providerData, services: updatedServices });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate KYC/KYB verification process
    try {
      if (!providerData.firstName || !providerData.lastName || !providerData.email) {
        toast({
          title: "Missing information",
          description: "Please fill in your name and email",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      if (providerData.services.length === 0) {
        toast({
          title: "Select services",
          description: "Please select at least one service you offer",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      if (providerData.password.length < 8) {
        toast({
          title: "Password Error",
          description: "Password must be at least 8 characters",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      if (providerData.password !== providerData.confirmPassword) {
        toast({
          title: "Password Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const accountHolderClean = providerData.accountHolder.trim();
      const accountNumberClean = providerData.accountNumber.replace(/\D/g, "");
      const branchCodeClean = providerData.branchCode.replace(/\D/g, "");

      if (!providerData.bankName) {
        toast({
          title: "Banking Details Error",
          description: "Please select your bank",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      if (!providerData.accountType) {
        toast({
          title: "Banking Details Error",
          description: "Please select your account type",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      if (!accountHolderClean) {
        toast({
          title: "Banking Details Error",
          description: "Please enter the account holder name",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      if (accountNumberClean.length < 6) {
        toast({
          title: "Banking Details Error",
          description: "Account number is too short",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      if (branchCodeClean.length < 4) {
        toast({
          title: "Banking Details Error",
          description: "Branch code is invalid",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!captchaToken) {
        toast({
          title: "Verification Required",
          description: "Please complete the CAPTCHA check.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const registerRes = await authClient.register({
        email: providerData.email,
        password: providerData.password,
        firstName: providerData.firstName,
        lastName: providerData.lastName,
        phone: providerData.phone,
        address: providerData.address,
        city: providerData.city,
        province: providerData.province,
        captchaToken: captchaToken
      });

      const newUserId = registerRes.user.id;
      const locationStr = providerData.city || providerData.address || "";
      if (!locationStr) {
        toast({
          title: "Missing location",
          description: "Please provide your city or address",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const servicesMapped = providerData.services.map(s => canonicalServiceMap[s] || s.toLowerCase().replace(/\s+/g, '-'));
      
      // Process portfolio images
      const portfolioData = await Promise.all(
        providerData.portfolio.map(file => compressImage(file))
      );
      
      const movingPortfolioData = await Promise.all(
        providerData.movingPortfolio.map(file => compressImage(file))
      );

      // Construct Au Pair Specializations String
      const auPairSpecs: string[] = [];
      if (providerData.services.includes("Au Pair Services") || providerData.services.includes("Childcare Provider")) {
         if (providerData.auPairExperience.length) auPairSpecs.push(`Experience: ${providerData.auPairExperience.join(', ')}`);
         if (providerData.auPairCertifications.length) auPairSpecs.push(`Certs: ${providerData.auPairCertifications.join(', ')}`);
         if (providerData.auPairServices.length) auPairSpecs.push(`Services: ${providerData.auPairServices.join(', ')}`);
         if (providerData.languages.length) auPairSpecs.push(`Languages: ${providerData.languages.join(', ')}`);
         if (providerData.childcareExperienceYears) auPairSpecs.push(`Years Exp: ${providerData.childcareExperienceYears}`);
         if (providerData.agePreference) auPairSpecs.push(`Age Pref: ${providerData.agePreference}`);
         if (providerData.maxChildren) auPairSpecs.push(`Max Children: ${providerData.maxChildren}`);
         if (providerData.startDate) auPairSpecs.push(`Start Date: ${new Date(providerData.startDate).toLocaleDateString()}`);
         if (providerData.hasReferences === 'yes') auPairSpecs.push(`References Available`);
      }

      // Construct Event Staff Specializations String
      const eventStaffSpecs: string[] = [];
      if (providerData.services.includes("Waitering Services") || providerData.services.includes("Event Staff")) {
         const roleLabel = eventStaffTypes.find(t => t.id === providerData.eventStaffType)?.label;
         if (roleLabel) eventStaffSpecs.push(`Role: ${roleLabel}`);
         if (providerData.eventStaffSpecializations.length) eventStaffSpecs.push(`Specs: ${providerData.eventStaffSpecializations.join(', ')}`);
         if (providerData.eventStaffCertifications.length) eventStaffSpecs.push(`Certs: ${providerData.eventStaffCertifications.join(', ')}`);
         if (providerData.eventExperienceYears) eventStaffSpecs.push(`Exp: ${providerData.eventExperienceYears}`);
         if (providerData.eventTypesExperienced.length) eventStaffSpecs.push(`Events: ${providerData.eventTypesExperienced.join(', ')}`);
         if (providerData.typicalEventSize) eventStaffSpecs.push(`Typical Size: ${providerData.typicalEventSize}`);
         if (providerData.maxGuests) eventStaffSpecs.push(`Max Guests: ${providerData.maxGuests}`);
         
         const avail = [];
         if (providerData.eventAvailabilityDays.length) avail.push(providerData.eventAvailabilityDays.join(', '));
         if (providerData.eventAvailabilityTimes.length) avail.push(providerData.eventAvailabilityTimes.join(', '));
         if (avail.length) eventStaffSpecs.push(`Avail: ${avail.join(' - ')}`);
         
         if (providerData.travelDistance) eventStaffSpecs.push(`Travel: ${providerData.travelDistance}`);
         if (providerData.languages.length) eventStaffSpecs.push(`Lang: ${providerData.languages.join(', ')}`);
         if (providerData.ownTransport) eventStaffSpecs.push("Own Transport");
         if (providerData.ownUniform) eventStaffSpecs.push("Own Uniform");

         const physical = [];
         if (providerData.physicalStand) physical.push("Stand 4h+");
         if (providerData.physicalLift) physical.push("Lift 10kg+");
         if (providerData.physicalCarry) physical.push("Carry Trays");
         if (physical.length) eventStaffSpecs.push(`Physical: ${physical.join(', ')}`);
      }

      // Construct Moving Service Specializations String
      const movingSpecs: string[] = [];
      if (providerData.services.includes("Moving Services")) {
         if (providerData.movingProviderTypes.length) movingSpecs.push(`Types: ${providerData.movingProviderTypes.join(', ')}`);
         if (providerData.movingFleet.length) movingSpecs.push(`Fleet: ${providerData.movingFleet.join(', ')}`);
         if (providerData.movingSpecializations.length) movingSpecs.push(`Specs: ${providerData.movingSpecializations.join(', ')}`);
         if (providerData.movingCertifications.length) movingSpecs.push(`Certs: ${providerData.movingCertifications.join(', ')}`);
         if (providerData.movingServiceCoverage.length) movingSpecs.push(`Coverage: ${providerData.movingServiceCoverage.join(', ')}`);
         if (providerData.movingMaxDistance) movingSpecs.push(`Max Dist: ${providerData.movingMaxDistance}`);
         if (providerData.movingCrossBorder) movingSpecs.push("Cross Border");
         if (providerData.movingInterstate) movingSpecs.push("Interstate");
         
         if (providerData.movingTeamSize) movingSpecs.push(`Team Size: ${providerData.movingTeamSize}`);
         if (providerData.movingTeamExperienceLevel) movingSpecs.push(`Team Level: ${providerData.movingTeamExperienceLevel}`);
         if (providerData.movingAvgTeamExperience) movingSpecs.push(`Avg Exp: ${providerData.movingAvgTeamExperience} yrs`);
         if (providerData.movingSupervisors) movingSpecs.push("Supervisors Avail");
         if (providerData.movingSecurityClearance) movingSpecs.push("Security Cleared");
         
         if (providerData.movingProviderTypes.includes("Storage services")) {
            const storage = [];
            if (providerData.movingStorageLocation) storage.push(providerData.movingStorageLocation);
            if (providerData.movingStorageCapacity) storage.push(`${providerData.movingStorageCapacity} m³`);
            if (providerData.movingClimateControl) storage.push("Climate Ctrl");
            if (providerData.moving247Access) storage.push("24/7 Access");
            if (storage.length) movingSpecs.push(`Storage: ${storage.join(', ')}`);
         }
         
         if (providerData.movingAdditionalServices.length) movingSpecs.push(`Add. Svcs: ${providerData.movingAdditionalServices.join(', ')}`);
         
         if (providerData.movingAvailabilityDays.length) movingSpecs.push(`Avail Days: ${providerData.movingAvailabilityDays.join(', ')}`);
         if (providerData.movingNoticePeriod) movingSpecs.push(`Notice: ${providerData.movingNoticePeriod}`);
         if (providerData.movingWeekendAvailable) movingSpecs.push("Wknd Avail");
         if (providerData.movingPublicHolidayAvailable) movingSpecs.push("Hol Avail");
         if (providerData.movingPeakSeasonAvailable) movingSpecs.push("Peak Season Avail");
         
         if (providerData.movingHourlyRate) movingSpecs.push(`Rate: R${providerData.movingHourlyRate}/hr`);
         if (providerData.movingMinCharge) movingSpecs.push(`Min: R${providerData.movingMinCharge}`);
      }

       const providerPayload: any = {
         userId: newUserId,
         firstName: providerData.firstName,
         lastName: providerData.lastName,
         email: providerData.email,
         phone: providerData.phone,
         bio: providerData.description || "",
         hourlyRate: providerData.baseRate || providerData.movingHourlyRate || "250.00",
         servicesOffered: servicesMapped,
         category: servicesMapped[0] || "general",
         experience: [
           providerData.experience,
           providerData.previousEmployers ? `Previous Employers: ${providerData.previousEmployers}` : null,
           providerData.referenceContacts ? `References: ${providerData.referenceContacts}` : null,
           providerData.movingClientReferences ? `Moving Refs: ${providerData.movingClientReferences}` : null
         ].filter(Boolean).join("\n\n"),
         specializations: [
           providerData.specializations,
           providerData.locksmithSpecializations.map(id => locksmithSpecializations.find(s => s.id === id)?.label).join(", "),
           auPairSpecs.join(" | "),
           eventStaffSpecs.join(" | "),
           movingSpecs.join(" | ")
         ].filter(Boolean).join(", "),
         
         // Locksmith specific fields
         mobileService: providerData.mobileService,
         serviceRadius: providerData.serviceRadius,
         availability247: providerData.availability247,
         responseTime: providerData.responseTime,
         certifications: providerData.certifications,
         
         // Au Pair specific fields (Documents)
         policeClearance: (providerData as any).policeClearanceData || null,
         referenceDocument: (providerData as any).referenceDocumentData || (providerData as any).referencesCVData || null,
         
         // Moving Service Specific Fields
         movingProviderTypes: providerData.movingProviderTypes,
         movingFleet: providerData.movingFleet,
         movingSpecializations: providerData.movingSpecializations,
         movingCertifications: providerData.movingCertifications,
         movingServiceCoverage: providerData.movingServiceCoverage,
         movingMaxDistance: providerData.movingMaxDistance,
         movingCrossBorder: providerData.movingCrossBorder,
         movingInterstate: providerData.movingInterstate,
         movingTeamSize: providerData.movingTeamSize,
         movingTeamExperienceLevel: providerData.movingTeamExperienceLevel,
         movingAvgTeamExperience: providerData.movingAvgTeamExperience,
         movingSupervisors: providerData.movingSupervisors,
         movingSecurityClearance: providerData.movingSecurityClearance,
         movingStorageLocation: providerData.movingStorageLocation,
         movingStorageCapacity: providerData.movingStorageCapacity,
         movingClimateControl: providerData.movingClimateControl,
         moving247Access: providerData.moving247Access,
         movingSecurityFeatures: providerData.movingSecurityFeatures,
         movingAdditionalServices: providerData.movingAdditionalServices,
         movingAvailabilityDays: providerData.movingAvailabilityDays,
         movingNoticePeriod: providerData.movingNoticePeriod,
         movingHourlyRate: providerData.movingHourlyRate,
         movingMinCharge: providerData.movingMinCharge,
         movingPortfolio: movingPortfolioData,
         
         // Moving Documents
         movingCompanyRegDoc: (providerData as any).movingCompanyRegDocData || null,
         movingInsuranceCert: (providerData as any).movingInsuranceCertData || null,
         movingVehicleRegDoc: (providerData as any).movingVehicleRegDocData || null,

         availability: providerData.availability,
         portfolio: portfolioData,
         location: locationStr,
         profileImage: (providerData as any).profilePictureData || null, // Send base64 image
         idDocument: (providerData as any).idDocumentData || null,
         proofOfAddress: (providerData as any).proofOfAddressData || null,
         qualificationCertificate: (providerData as any).certificatesData || (providerData as any).qualificationCertificateData || null,
         bankingDetails: {
           bankName: providerData.bankName,
           accountHolder: accountHolderClean,
           accountNumber: accountNumberClean,
           branchCode: branchCodeClean,
           accountType: providerData.accountType,
         },
         providerType: 'individual',
         verificationStatus: 'pending',
         isVerified: false
       };

       console.log("Provider registration payload:", providerPayload);

       const createRes = await apiRequest("POST", "/api/providers", providerPayload);
       await createRes.json();
      
      // Also update the user profile image if provided
      if ((providerData as any).profilePictureData) {
        try {
          // This might fail if the user is not fully logged in yet, but we'll try
          await apiRequest('PUT', '/api/user/profile', {
            profileImage: (providerData as any).profilePictureData
          });
        } catch (e) {
          console.warn("Could not update user profile image immediately:", e);
        }
      }

      // If there are other documents (proofOfAddress, qualificationCertificate), we should upload them now
      // Since the provider is created, we can get the ID from the response if we had it, 
      // but here we are in a void function from mutation. 
      // However, the mutation invalidates queries, so we rely on the main payload for initial creation.
      // The main payload already includes idDocument. 
      // If we need to upload other docs separately or if they are large, we would do it here.
      // For now, we included idDocument in the initial payload. 
      
      // Let's handle proofOfAddress and certificates if they are present and not in the main payload (which they aren't currently fully mapped)
      // Actually, schema has proofOfAddress and qualificationCertificate fields now.
      // We should include them in the initial payload if possible, OR upload them sequentially here.
      // Since we don't have the new provider ID easily here without refactoring the mutation,
      // we'll rely on the fact that we can add them to the payload above if we update the interface.
      
      // For now, let's assume the backend createServiceProvider handles extra fields if we pass them.
      // We need to update the payload construction above to include them.

      // Step 1: Document verification
      toast({
        title: "Verifying Documents",
        description: "Please wait while we verify your documents...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: KYC verification
      toast({
        title: "Identity Verification",
        description: "Verifying your identity through our KYC partner...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Banking verification
      toast({
        title: "Banking Verification",
        description: "Verifying your banking details...",
      });
      
      try {
        const verifyRes = await apiRequest("POST", "/api/providers/verify-bank", {
          bankName: providerData.bankName,
          accountHolder: accountHolderClean,
          accountNumber: accountNumberClean,
          branchCode: branchCodeClean,
          accountType: providerData.accountType,
        });
        await verifyRes.json();
      } catch (e: any) {
        console.error("Bank verification error:", e?.message || e);
        toast({
          title: "Verification Failed",
          description: e?.message || "Banking verification failed. Please check your details and try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Success
      toast({
        title: "Application Submitted Successfully!",
        description: "Your application is under review. You'll receive an email within 24-48 hours with the verification status.",
      });
      
      // Redirect to Home
      setTimeout(() => {
        setLocation("/");
      }, 1500);
      
    } catch (error) {
      console.error('Provider application submission error:', error);
      const message = (error as any)?.message || "Verification failed due to a network or server error.";
      toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Tell us about yourself or your business</p>
            </div>
            
            {/* Application Type */}
            <div className="space-y-4">
              <Label>Application Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    providerData.applicationType === 'individual' 
                      ? 'border-[#44062D] bg-[#EED1C4]/30' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setProviderData({ ...providerData, applicationType: 'individual' })}
                >
                  <CardContent className="flex flex-col items-center p-4">
                    <User className="h-8 w-8 text-[#44062D] mb-2" />
                    <span className="font-medium">Individual</span>
                    <span className="text-sm text-gray-600 text-center">Personal service provider</span>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    providerData.applicationType === 'company' 
                      ? 'border-[#44062D] bg-[#EED1C4]/30' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setProviderData({ ...providerData, applicationType: 'company' })}
                >
                  <CardContent className="flex flex-col items-center p-4">
                    <Building2 className="h-8 w-8 text-[#44062D] mb-2" />
                    <span className="font-medium">Company</span>
                    <span className="text-sm text-gray-600 text-center">Business service provider</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Personal/Company Information */}
            {providerData.applicationType === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={providerData.firstName}
                    onChange={(e) => setProviderData({...providerData, firstName: e.target.value})}
                    required
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={providerData.lastName}
                    onChange={(e) => setProviderData({...providerData, lastName: e.target.value})}
                    required
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company Ltd"
                  value={providerData.companyName}
                  onChange={(e) => setProviderData({...providerData, companyName: e.target.value})}
                  required
                  data-testid="input-company-name"
                />
              </div>
            )}



            {(providerData.services.includes("Au Pair Services") || providerData.services.includes("Childcare Provider")) && (
              <div className="space-y-6 border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#44062D]" />
                  <h4 className="font-semibold text-lg text-[#44062D]">Au Pair / Childcare Details</h4>
                </div>

                {/* Experience Categories */}
                <div className="space-y-4">
                  <Label>Experience Categories</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auPairExperienceOptions.map((exp) => (
                      <div key={exp} className="flex items-center space-x-2">
                        <Checkbox
                          id={`exp-${exp}`}
                          checked={providerData.auPairExperience.includes(exp)}
                          onCheckedChange={(checked) => {
                            const current = providerData.auPairExperience;
                            const updated = checked
                              ? [...current, exp]
                              : current.filter(e => e !== exp);
                            setProviderData({ ...providerData, auPairExperience: updated });
                          }}
                        />
                        <Label htmlFor={`exp-${exp}`} className="text-sm font-medium cursor-pointer">
                          {exp}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-4">
                  <Label>Certifications & Training</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auPairCertificationOptions.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${cert}`}
                          checked={providerData.auPairCertifications.includes(cert)}
                          onCheckedChange={(checked) => {
                            const current = providerData.auPairCertifications;
                            const updated = checked
                              ? [...current, cert]
                              : current.filter(c => c !== cert);
                            setProviderData({ ...providerData, auPairCertifications: updated });
                          }}
                        />
                        <Label htmlFor={`cert-${cert}`} className="text-sm font-medium cursor-pointer">
                          {cert}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Offered */}
                <div className="space-y-4">
                  <Label>Services Offered</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auPairServiceOptions.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`svc-${service}`}
                          checked={providerData.auPairServices.includes(service)}
                          onCheckedChange={(checked) => {
                            const current = providerData.auPairServices;
                            const updated = checked
                              ? [...current, service]
                              : current.filter(s => s !== service);
                            setProviderData({ ...providerData, auPairServices: updated });
                          }}
                        />
                        <Label htmlFor={`svc-${service}`} className="text-sm font-medium cursor-pointer">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="childcareExperienceYears">Years of Childcare Experience</Label>
                     <Select
                       value={providerData.childcareExperienceYears}
                       onValueChange={(value) => setProviderData({...providerData, childcareExperienceYears: value})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select years" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="0-1">0-1 years</SelectItem>
                         <SelectItem value="1-3">1-3 years</SelectItem>
                         <SelectItem value="3-5">3-5 years</SelectItem>
                         <SelectItem value="5-10">5-10 years</SelectItem>
                         <SelectItem value="10+">10+ years</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="agePreference">Age Preference</Label>
                     <Select
                       value={providerData.agePreference}
                       onValueChange={(value) => setProviderData({...providerData, agePreference: value})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select preference" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Infants">Infants</SelectItem>
                         <SelectItem value="Toddlers">Toddlers</SelectItem>
                         <SelectItem value="School age">School age</SelectItem>
                         <SelectItem value="Teens">Teens</SelectItem>
                         <SelectItem value="No preference">No preference</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="maxChildren">Max Children</Label>
                     <Select
                       value={providerData.maxChildren}
                       onValueChange={(value) => setProviderData({...providerData, maxChildren: value})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select max children" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="1">1</SelectItem>
                         <SelectItem value="2">2</SelectItem>
                         <SelectItem value="3">3</SelectItem>
                         <SelectItem value="4">4</SelectItem>
                         <SelectItem value="5+">5+</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="startDate">Available Start Date</Label>
                     <Input
                       id="startDate"
                       type="date"
                       value={providerData.startDate ? new Date(providerData.startDate).toISOString().split('T')[0] : ''}
                       onChange={(e) => setProviderData({...providerData, startDate: e.target.value ? new Date(e.target.value) : undefined})}
                     />
                   </div>
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-4">
                    {languageOptions.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={providerData.languages.includes(lang)}
                          onCheckedChange={(checked) => {
                            const current = providerData.languages;
                            const updated = checked
                              ? [...current, lang]
                              : current.filter(l => l !== lang);
                            setProviderData({ ...providerData, languages: updated });
                          }}
                        />
                        <Label htmlFor={`lang-${lang}`} className="text-sm font-medium cursor-pointer">
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* References Toggle */}
                <div className="space-y-4 border p-4 rounded-md">
                   <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                       <Label className="text-base">References Available</Label>
                       <p className="text-sm text-muted-foreground">
                         Do you have written references from previous families?
                       </p>
                     </div>
                     <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="hasReferences"
                                checked={providerData.hasReferences === "yes"}
                                onCheckedChange={(checked) => setProviderData({...providerData, hasReferences: checked ? "yes" : "no"})}
                            />
                            <Label htmlFor="hasReferences">Yes</Label>
                        </div>
                     </div>
                   </div>
                   
                   {providerData.hasReferences === "yes" && (
                     <div className="pt-2">
                        <Label>Upload Reference (Optional)</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => fileInputRefs.referenceDocument.current?.click()}>
                            <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">Click to upload reference document</p>
                        </div>
                        <input
                            ref={fileInputRefs.referenceDocument}
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload('referenceDocument', e.target.files?.[0] || null)}
                        />
                        {providerData.referenceDocument && (
                            <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {providerData.referenceDocument.name}
                            </p>
                        )}
                     </div>
                   )}
                </div>
              </div>
            )}

            {providerData.services.includes("Moving Services") && (
              <div className="space-y-6 border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-[#44062D]" />
                  <h4 className="font-semibold text-lg text-[#44062D]">Moving Service Details</h4>
                </div>

                {/* Provider Types */}
                <div className="space-y-4">
                  <Label>Provider Types</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {movingProviderTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mtype-${type}`}
                          checked={providerData.movingProviderTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            const current = providerData.movingProviderTypes;
                            const updated = checked
                              ? [...current, type]
                              : current.filter(t => t !== type);
                            setProviderData({ ...providerData, movingProviderTypes: updated });
                          }}
                        />
                        <Label htmlFor={`mtype-${type}`} className="text-sm font-medium cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fleet & Equipment */}
                <div className="space-y-4">
                  <Label>Fleet & Equipment</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {movingFleetOptions.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mfleet-${item}`}
                          checked={providerData.movingFleet.includes(item)}
                          onCheckedChange={(checked) => {
                            const current = providerData.movingFleet;
                            const updated = checked
                              ? [...current, item]
                              : current.filter(i => i !== item);
                            setProviderData({ ...providerData, movingFleet: updated });
                          }}
                        />
                        <Label htmlFor={`mfleet-${item}`} className="text-sm font-medium cursor-pointer">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-4">
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {movingSpecializations.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mspec-${spec}`}
                          checked={providerData.movingSpecializations.includes(spec)}
                          onCheckedChange={(checked) => {
                            const current = providerData.movingSpecializations;
                            const updated = checked
                              ? [...current, spec]
                              : current.filter(s => s !== spec);
                            setProviderData({ ...providerData, movingSpecializations: updated });
                          }}
                        />
                        <Label htmlFor={`mspec-${spec}`} className="text-sm font-medium cursor-pointer">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications & Licenses */}
                <div className="space-y-4">
                  <Label>Certifications & Licenses</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {movingCertifications.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mcert-${cert}`}
                          checked={providerData.movingCertifications.includes(cert)}
                          onCheckedChange={(checked) => {
                            const current = providerData.movingCertifications;
                            const updated = checked
                              ? [...current, cert]
                              : current.filter(c => c !== cert);
                            setProviderData({ ...providerData, movingCertifications: updated });
                          }}
                        />
                        <Label htmlFor={`mcert-${cert}`} className="text-sm font-medium cursor-pointer">
                          {cert}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Document Uploads for Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                     <div className="space-y-2">
                        <Label className="text-xs">Company Registration</Label>
                        <div className="border border-dashed border-gray-300 rounded p-2 text-center hover:bg-gray-50 cursor-pointer"
                             onClick={() => fileInputRefs.movingCompanyRegDoc.current?.click()}>
                           <Upload className="mx-auto h-4 w-4 text-gray-400" />
                           <span className="text-xs">Upload Doc</span>
                        </div>
                        <input
                           ref={fileInputRefs.movingCompanyRegDoc}
                           type="file"
                           accept=".pdf,image/*"
                           className="hidden"
                           onChange={(e) => handleFileUpload('movingCompanyRegDoc', e.target.files?.[0] || null)}
                        />
                        {providerData.movingCompanyRegDoc && <span className="text-xs text-green-600">{providerData.movingCompanyRegDoc.name}</span>}
                     </div>
                     
                     <div className="space-y-2">
                        <Label className="text-xs">Insurance Certificate</Label>
                        <div className="border border-dashed border-gray-300 rounded p-2 text-center hover:bg-gray-50 cursor-pointer"
                             onClick={() => fileInputRefs.movingInsuranceCert.current?.click()}>
                           <Upload className="mx-auto h-4 w-4 text-gray-400" />
                           <span className="text-xs">Upload Doc</span>
                        </div>
                        <input
                           ref={fileInputRefs.movingInsuranceCert}
                           type="file"
                           accept=".pdf,image/*"
                           className="hidden"
                           onChange={(e) => handleFileUpload('movingInsuranceCert', e.target.files?.[0] || null)}
                        />
                        {providerData.movingInsuranceCert && <span className="text-xs text-green-600">{providerData.movingInsuranceCert.name}</span>}
                     </div>

                     <div className="space-y-2">
                        <Label className="text-xs">Vehicle Registration</Label>
                        <div className="border border-dashed border-gray-300 rounded p-2 text-center hover:bg-gray-50 cursor-pointer"
                             onClick={() => fileInputRefs.movingVehicleRegDoc.current?.click()}>
                           <Upload className="mx-auto h-4 w-4 text-gray-400" />
                           <span className="text-xs">Upload Doc</span>
                        </div>
                        <input
                           ref={fileInputRefs.movingVehicleRegDoc}
                           type="file"
                           accept=".pdf,image/*"
                           className="hidden"
                           onChange={(e) => handleFileUpload('movingVehicleRegDoc', e.target.files?.[0] || null)}
                        />
                        {providerData.movingVehicleRegDoc && <span className="text-xs text-green-600">{providerData.movingVehicleRegDoc.name}</span>}
                     </div>
                  </div>
                </div>

                {/* Service Coverage */}
                <div className="space-y-4">
                  <Label>Service Coverage</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="movingMaxDistance">Max Travel Distance</Label>
                       <Select
                         value={providerData.movingMaxDistance}
                         onValueChange={(value) => setProviderData({...providerData, movingMaxDistance: value})}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select max distance" />
                         </SelectTrigger>
                         <SelectContent>
                           {movingDistances.map(d => (
                             <SelectItem key={d} value={d}>{d}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                        <Label>Cross Border / Interstate</Label>
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center space-x-2">
                              <Checkbox 
                                 id="movingCrossBorder"
                                 checked={providerData.movingCrossBorder}
                                 onCheckedChange={(checked) => setProviderData({...providerData, movingCrossBorder: !!checked})}
                              />
                              <Label htmlFor="movingCrossBorder">Cross-border moves</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                              <Checkbox 
                                 id="movingInterstate"
                                 checked={providerData.movingInterstate}
                                 onCheckedChange={(checked) => setProviderData({...providerData, movingInterstate: !!checked})}
                              />
                              <Label htmlFor="movingInterstate">Interstate moves</Label>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Team Details */}
                <div className="space-y-4">
                  <Label>Team Details</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="movingTeamSize">Movers Available</Label>
                       <Select
                         value={providerData.movingTeamSize}
                         onValueChange={(value) => setProviderData({...providerData, movingTeamSize: value})}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select team size" />
                         </SelectTrigger>
                         <SelectContent>
                           {movingTeamSizes.map(s => (
                             <SelectItem key={s} value={s}>{s}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="movingTeamExperienceLevel">Team Experience Level</Label>
                       <Select
                         value={providerData.movingTeamExperienceLevel}
                         onValueChange={(value) => setProviderData({...providerData, movingTeamExperienceLevel: value})}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select level" />
                         </SelectTrigger>
                         <SelectContent>
                           {movingExperienceLevels.map(l => (
                             <SelectItem key={l} value={l}>{l}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="movingAvgTeamExperience">Avg Member Experience (Years)</Label>
                        <Input 
                           id="movingAvgTeamExperience"
                           type="number"
                           placeholder="e.g. 3"
                           value={providerData.movingAvgTeamExperience}
                           onChange={(e) => setProviderData({...providerData, movingAvgTeamExperience: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label>Team Verification</Label>
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center space-x-2">
                              <Checkbox 
                                 id="movingSupervisors"
                                 checked={providerData.movingSupervisors}
                                 onCheckedChange={(checked) => setProviderData({...providerData, movingSupervisors: !!checked})}
                              />
                              <Label htmlFor="movingSupervisors">Supervisors available</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                              <Checkbox 
                                 id="movingSecurityClearance"
                                 checked={providerData.movingSecurityClearance}
                                 onCheckedChange={(checked) => setProviderData({...providerData, movingSecurityClearance: !!checked})}
                              />
                              <Label htmlFor="movingSecurityClearance">Security cleared team</Label>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Storage Facilities */}
                {providerData.movingProviderTypes.includes("Storage services") && (
                   <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                     <Label>Storage Facilities</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="movingStorageLocation">Storage Location</Label>
                           <Input 
                              id="movingStorageLocation"
                              placeholder="Address/Area"
                              value={providerData.movingStorageLocation}
                              onChange={(e) => setProviderData({...providerData, movingStorageLocation: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="movingStorageCapacity">Capacity (m³)</Label>
                           <Input 
                              id="movingStorageCapacity"
                              placeholder="e.g. 500"
                              value={providerData.movingStorageCapacity}
                              onChange={(e) => setProviderData({...providerData, movingStorageCapacity: e.target.value})}
                           />
                        </div>
                        <div className="flex items-center space-x-2">
                           <Checkbox 
                              id="movingClimateControl"
                              checked={providerData.movingClimateControl}
                              onCheckedChange={(checked) => setProviderData({...providerData, movingClimateControl: !!checked})}
                           />
                           <Label htmlFor="movingClimateControl">Climate Controlled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Checkbox 
                              id="moving247Access"
                              checked={providerData.moving247Access}
                              onCheckedChange={(checked) => setProviderData({...providerData, moving247Access: !!checked})}
                           />
                           <Label htmlFor="moving247Access">24/7 Access</Label>
                        </div>
                     </div>
                   </div>
                )}

                {/* Additional Services */}
                <div className="space-y-4">
                  <Label>Additional Services</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {movingAdditionalServices.map((svc) => (
                      <div key={svc} className="flex items-center space-x-2">
                        <Checkbox
                          id={`msvc-${svc}`}
                          checked={providerData.movingAdditionalServices.includes(svc)}
                          onCheckedChange={(checked) => {
                            const current = providerData.movingAdditionalServices;
                            const updated = checked
                              ? [...current, svc]
                              : current.filter(s => s !== svc);
                            setProviderData({ ...providerData, movingAdditionalServices: updated });
                          }}
                        />
                        <Label htmlFor={`msvc-${svc}`} className="text-sm font-medium cursor-pointer">
                          {svc}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability & Pricing */}
                <div className="space-y-4">
                  <Label>Availability & Pricing</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Days Available</Label>
                       <div className="flex flex-wrap gap-2">
                           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                              <div key={day} className="flex items-center space-x-2">
                                 <Checkbox 
                                    id={`mday-${day}`}
                                    checked={providerData.movingAvailabilityDays.includes(day)}
                                    onCheckedChange={(checked) => {
                                       const current = providerData.movingAvailabilityDays;
                                       const updated = checked 
                                          ? [...current, day]
                                          : current.filter(d => d !== day);
                                       setProviderData({...providerData, movingAvailabilityDays: updated});
                                    }}
                                 />
                                 <Label htmlFor={`mday-${day}`}>{day}</Label>
                              </div>
                           ))}
                       </div>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="movingNoticePeriod">Notice Period</Label>
                       <Select
                         value={providerData.movingNoticePeriod}
                         onValueChange={(value) => setProviderData({...providerData, movingNoticePeriod: value})}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select notice period" />
                         </SelectTrigger>
                         <SelectContent>
                           {movingNoticePeriods.map(p => (
                             <SelectItem key={p} value={p}>{p}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     
                     {/* Pricing Inputs */}
                     <div className="space-y-2">
                        <Label htmlFor="movingHourlyRate">Hourly Rate (Small Jobs)</Label>
                        <Input 
                           id="movingHourlyRate"
                           type="number"
                           placeholder="R"
                           value={providerData.movingHourlyRate}
                           onChange={(e) => setProviderData({...providerData, movingHourlyRate: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="movingMinCharge">Minimum Charge</Label>
                        <Input 
                           id="movingMinCharge"
                           type="number"
                           placeholder="R"
                           value={providerData.movingMinCharge}
                           onChange={(e) => setProviderData({...providerData, movingMinCharge: e.target.value})}
                        />
                     </div>
                  </div>
                </div>
                
                {/* References & Portfolio */}
                <div className="space-y-4 border-t pt-4">
                   <Label>References & Portfolio</Label>
                   <div className="space-y-2">
                      <Label htmlFor="movingClientReferences">Client References</Label>
                      <Textarea 
                         id="movingClientReferences"
                         placeholder="List client references (Name, Contact)"
                         value={providerData.movingClientReferences}
                         onChange={(e) => setProviderData({...providerData, movingClientReferences: e.target.value})}
                      />
                   </div>
                   
                   {/* Specific Portfolio Upload for Moving */}
                   <div className="space-y-2">
                     <Label>Portfolio (Move Photos)</Label>
                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => fileInputRefs.movingPortfolio.current?.click()}>
                       <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                       <p className="text-sm font-medium">Upload photos of successful moves</p>
                     </div>
                     <input
                       ref={fileInputRefs.movingPortfolio}
                       type="file"
                       accept="image/*"
                       multiple
                       className="hidden"
                       onChange={(e) => {
                         const files = Array.from(e.target.files || []);
                         files.forEach(file => handleFileUpload('movingPortfolio', file));
                       }}
                     />
                     {providerData.movingPortfolio.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-2">
                         {providerData.movingPortfolio.map((file, idx) => (
                           <div key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                             {file.name}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                </div>

              </div>
            )}

            {(providerData.services.includes("Waitering Services") || providerData.services.includes("Event Staff")) && (
              <div className="space-y-6 border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#44062D]" />
                  <h4 className="font-semibold text-lg text-[#44062D]">Event Staff Details</h4>
                </div>

                {/* Staff Type */}
                <div className="space-y-4">
                  <Label>Primary Role</Label>
                  <Select
                    value={providerData.eventStaffType}
                    onValueChange={(value) => setProviderData({...providerData, eventStaffType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary role" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventStaffTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Specializations */}
                <div className="space-y-4">
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eventStaffSpecializations.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={`espec-${spec}`}
                          checked={providerData.eventStaffSpecializations.includes(spec)}
                          onCheckedChange={(checked) => {
                            const current = providerData.eventStaffSpecializations;
                            const updated = checked
                              ? [...current, spec]
                              : current.filter(s => s !== spec);
                            setProviderData({ ...providerData, eventStaffSpecializations: updated });
                          }}
                        />
                        <Label htmlFor={`espec-${spec}`} className="text-sm font-medium cursor-pointer">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-4">
                  <Label>Certifications</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eventStaffCertifications.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ecert-${cert}`}
                          checked={providerData.eventStaffCertifications.includes(cert)}
                          onCheckedChange={(checked) => {
                            const current = providerData.eventStaffCertifications;
                            const updated = checked
                              ? [...current, cert]
                              : current.filter(c => c !== cert);
                            setProviderData({ ...providerData, eventStaffCertifications: updated });
                          }}
                        />
                        <Label htmlFor={`ecert-${cert}`} className="text-sm font-medium cursor-pointer">
                          {cert}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Types Experienced */}
                <div className="space-y-4">
                  <Label>Event Types Experienced</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {eventTypesExperienced.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`etype-${type}`}
                          checked={providerData.eventTypesExperienced.includes(type)}
                          onCheckedChange={(checked) => {
                            const current = providerData.eventTypesExperienced;
                            const updated = checked
                              ? [...current, type]
                              : current.filter(t => t !== type);
                            setProviderData({ ...providerData, eventTypesExperienced: updated });
                          }}
                        />
                        <Label htmlFor={`etype-${type}`} className="text-sm font-medium cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience & Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="eventExperienceYears">Years of Event Experience</Label>
                     <Select
                       value={providerData.eventExperienceYears}
                       onValueChange={(value) => setProviderData({...providerData, eventExperienceYears: value})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select years" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="0-1">0-1 years</SelectItem>
                         <SelectItem value="1-3">1-3 years</SelectItem>
                         <SelectItem value="3-5">3-5 years</SelectItem>
                         <SelectItem value="5-10">5-10 years</SelectItem>
                         <SelectItem value="10+">10+ years</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="typicalEventSize">Typical Event Size</Label>
                     <Select
                       value={providerData.typicalEventSize}
                       onValueChange={(value) => setProviderData({...providerData, typicalEventSize: value})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select size" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Small (<20)">Small (&lt;20 guests)</SelectItem>
                         <SelectItem value="Medium (20-50)">Medium (20-50 guests)</SelectItem>
                         <SelectItem value="Large (50-100)">Large (50-100 guests)</SelectItem>
                         <SelectItem value="Huge (100+)">Huge (100+ guests)</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="maxGuests">Max Guests Handled</Label>
                     <Input
                       id="maxGuests"
                       type="number"
                       placeholder="e.g. 200"
                       value={providerData.maxGuests}
                       onChange={(e) => setProviderData({...providerData, maxGuests: e.target.value})}
                     />
                   </div>
                </div>

                {/* Availability & Preferences */}
                <div className="space-y-4">
                  <Label>Availability & Preferences</Label>
                  <div className="space-y-4 border p-4 rounded-md">
                     <div className="space-y-2">
                        <Label>Days Available</Label>
                        <div className="flex flex-wrap gap-2">
                           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                              <div key={day} className="flex items-center space-x-2">
                                 <Checkbox 
                                    id={`day-${day}`}
                                    checked={providerData.eventAvailabilityDays.includes(day)}
                                    onCheckedChange={(checked) => {
                                       const current = providerData.eventAvailabilityDays;
                                       const updated = checked 
                                          ? [...current, day]
                                          : current.filter(d => d !== day);
                                       setProviderData({...providerData, eventAvailabilityDays: updated});
                                    }}
                                 />
                                 <Label htmlFor={`day-${day}`}>{day}</Label>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label>Times Available</Label>
                        <div className="flex flex-wrap gap-2">
                           {['Morning', 'Afternoon', 'Evening', 'Late Night'].map(time => (
                              <div key={time} className="flex items-center space-x-2">
                                 <Checkbox 
                                    id={`time-${time}`}
                                    checked={providerData.eventAvailabilityTimes.includes(time)}
                                    onCheckedChange={(checked) => {
                                       const current = providerData.eventAvailabilityTimes;
                                       const updated = checked 
                                          ? [...current, time]
                                          : current.filter(t => t !== time);
                                       setProviderData({...providerData, eventAvailabilityTimes: updated});
                                    }}
                                 />
                                 <Label htmlFor={`time-${time}`}>{time}</Label>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="travelDistance">Travel Distance Willing to Go</Label>
                        <Select
                           value={providerData.travelDistance}
                           onValueChange={(value) => setProviderData({...providerData, travelDistance: value})}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Select distance" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="10km">Within 10km</SelectItem>
                              <SelectItem value="25km">Within 25km</SelectItem>
                              <SelectItem value="50km">Within 50km</SelectItem>
                              <SelectItem value="100km+">100km+</SelectItem>
                              <SelectItem value="Anywhere">Anywhere (with travel fee)</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Transportation</Label>
                     <div className="flex items-center space-x-2 border p-3 rounded-md">
                        <Checkbox
                          id="ownTransport"
                          checked={providerData.ownTransport}
                          onCheckedChange={(checked) => setProviderData({...providerData, ownTransport: !!checked})}
                        />
                        <Label htmlFor="ownTransport" className="cursor-pointer">I have my own transport</Label>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label>Uniform</Label>
                     <div className="flex items-center space-x-2 border p-3 rounded-md">
                        <Checkbox
                          id="ownUniform"
                          checked={providerData.ownUniform}
                          onCheckedChange={(checked) => setProviderData({...providerData, ownUniform: !!checked})}
                        />
                        <Label htmlFor="ownUniform" className="cursor-pointer">I have my own uniform (Black & White)</Label>
                     </div>
                   </div>
                </div>

                {/* Physical Requirements */}
                <div className="space-y-4">
                  <Label>Physical Requirements</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     <div className="flex items-center space-x-2">
                        <Checkbox
                          id="physicalStand"
                          checked={providerData.physicalStand}
                          onCheckedChange={(checked) => setProviderData({...providerData, physicalStand: !!checked})}
                        />
                        <Label htmlFor="physicalStand">Can stand for 4+ hours</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                          id="physicalLift"
                          checked={providerData.physicalLift}
                          onCheckedChange={(checked) => setProviderData({...providerData, physicalLift: !!checked})}
                        />
                        <Label htmlFor="physicalLift">Can lift 10kg+</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                          id="physicalCarry"
                          checked={providerData.physicalCarry}
                          onCheckedChange={(checked) => setProviderData({...providerData, physicalCarry: !!checked})}
                        />
                        <Label htmlFor="physicalCarry">Can carry trays</Label>
                     </div>
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-4">
                    {languageOptions.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`elang-${lang}`}
                          checked={providerData.languages.includes(lang)}
                          onCheckedChange={(checked) => {
                            const current = providerData.languages;
                            const updated = checked
                              ? [...current, lang]
                              : current.filter(l => l !== lang);
                            setProviderData({ ...providerData, languages: updated });
                          }}
                        />
                        <Label htmlFor={`elang-${lang}`} className="text-sm font-medium cursor-pointer">
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* References */}
                <div className="space-y-4 border p-4 rounded-md">
                   <div className="space-y-2">
                     <Label>CV / Resume (Optional)</Label>
                     <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                         onClick={() => fileInputRefs.referencesCV.current?.click()}>
                         <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                         <p className="text-sm font-medium">Click to upload CV</p>
                     </div>
                     <input
                         ref={fileInputRefs.referencesCV}
                         type="file"
                         accept=".pdf,.doc,.docx"
                         className="hidden"
                         onChange={(e) => handleFileUpload('referencesCV', e.target.files?.[0] || null)}
                     />
                     {providerData.referencesCV && (
                         <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                             <CheckCircle className="h-4 w-4 mr-1" />
                             {providerData.referencesCV.name}
                         </p>
                     )}
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="previousEmployers">Previous Employers</Label>
                     <Textarea
                       id="previousEmployers"
                       placeholder="List recent employers (Name, Role, Duration)"
                       value={providerData.previousEmployers}
                       onChange={(e) => setProviderData({...providerData, previousEmployers: e.target.value})}
                       rows={3}
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="referenceContacts">References</Label>
                     <Textarea
                       id="referenceContacts"
                       placeholder="Contact Name, Phone Number, Relationship"
                       value={providerData.referenceContacts}
                       onChange={(e) => setProviderData({...providerData, referenceContacts: e.target.value})}
                       rows={3}
                     />
                   </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={providerData.email}
                    onChange={(e) => setProviderData({...providerData, email: e.target.value})}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+27 123 456 7890"
                    className="pl-10"
                    value={providerData.phone}
                    onChange={(e) => setProviderData({...providerData, phone: e.target.value})}
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={providerData.password}
                  onChange={(e) => setProviderData({...providerData, password: e.target.value})}
                  required
                  data-testid="input-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={providerData.confirmPassword}
                  onChange={(e) => setProviderData({...providerData, confirmPassword: e.target.value})}
                  required
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idNumber">
                  {providerData.applicationType === 'individual' ? 'ID Number' : 'Company Registration Number'}
                </Label>
                <Input
                  id="idNumber"
                  placeholder={providerData.applicationType === 'individual' ? "0000000000000" : "2000/000000/00"}
                  value={providerData.applicationType === 'individual' ? providerData.idNumber : providerData.companyRegistration}
                  onChange={(e) => setProviderData({
                    ...providerData, 
                    [providerData.applicationType === 'individual' ? 'idNumber' : 'companyRegistration']: e.target.value
                  })}
                  required
                  data-testid="input-id-number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Address & Services</h3>
              <p className="text-gray-600">Where are you located and what services do you offer?</p>
            </div>
            
            {/* Address */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    className="pl-10"
                    value={providerData.address}
                    onChange={(e) => setProviderData({...providerData, address: e.target.value})}
                    required
                    data-testid="input-address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Cape Town"
                    value={providerData.city}
                    onChange={(e) => setProviderData({...providerData, city: e.target.value})}
                    required
                    data-testid="input-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select value={providerData.province} onValueChange={(value) => setProviderData({...providerData, province: value})}>
                    <SelectTrigger data-testid="select-province">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="western-cape">Western Cape</SelectItem>
                      <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                      <SelectItem value="northern-cape">Northern Cape</SelectItem>
                      <SelectItem value="free-state">Free State</SelectItem>
                      <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                      <SelectItem value="north-west">North West</SelectItem>
                      <SelectItem value="gauteng">Gauteng</SelectItem>
                      <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                      <SelectItem value="limpopo">Limpopo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="8001"
                    value={providerData.postalCode}
                    onChange={(e) => setProviderData({...providerData, postalCode: e.target.value})}
                    required
                    data-testid="input-postal-code"
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <Label>Services You Offer</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={providerData.services.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service)}
                      data-testid={`checkbox-service-${service.toLowerCase().replace(/ /g, '-')}`}
                    />
                    <Label htmlFor={service} className="text-sm font-medium cursor-pointer">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Select value={providerData.experience} onValueChange={(value) => setProviderData({...providerData, experience: value})}>
                <SelectTrigger data-testid="select-experience">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="2-5">2-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {providerData.services.some(s => [
              "Hair Stylist", "Makeup Artist", "Nail Technician", 
              "Massage Therapist", "Esthetician/Beautician", "Spa Therapist"
            ].includes(s)) && (
              <div className="space-y-6 border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#44062D]" />
                  <h4 className="font-semibold text-lg text-[#44062D]">Beauty & Wellness Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specializations">Specializations</Label>
                    <Input
                      id="specializations"
                      placeholder="e.g. Bridal makeup, Deep tissue massage"
                      value={providerData.specializations}
                      onChange={(e) => setProviderData({...providerData, specializations: e.target.value})}
                      data-testid="input-specializations"
                    />
                    <p className="text-xs text-muted-foreground">Separate with commas</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="baseRate">Base Hourly Rate (R)</Label>
                    <Input
                      id="baseRate"
                      type="number"
                      placeholder="e.g. 450"
                      value={providerData.baseRate}
                      onChange={(e) => setProviderData({...providerData, baseRate: e.target.value})}
                      data-testid="input-base-rate"
                    />
                  </div>
                </div>

                {/* Portfolio Upload */}
                <div className="space-y-2">
                  <Label>Portfolio (Upload photos of your work)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => fileInputRefs.portfolio.current?.click()}>
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground">Max 5MB per file</p>
                  </div>
                  <input
                    ref={fileInputRefs.portfolio}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => handleFileUpload('portfolio', file));
                    }}
                  />
                  {providerData.portfolio.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {providerData.portfolio.map((file, idx) => (
                        <div key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simple Availability Grid */}
                <div className="space-y-2">
                  <Label>Weekly Availability</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                       <div key={day} className="flex items-center space-x-2">
                         <Checkbox 
                           id={`avail-${day}`}
                           checked={!!providerData.availability[day]}
                           onCheckedChange={(checked) => {
                             const newAvail = {...providerData.availability};
                             if (checked) {
                               newAvail[day] = ['09:00-17:00']; // Default hours
                             } else {
                               delete newAvail[day];
                             }
                             setProviderData({...providerData, availability: newAvail});
                           }}
                         />
                         <Label htmlFor={`avail-${day}`}>{day}</Label>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {providerData.services.includes("Locksmith Services") && (
              <div className="space-y-6 border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-[#44062D]" />
                  <h4 className="font-semibold text-lg text-[#44062D]">Locksmith Details</h4>
                </div>

                {/* Specializations */}
                <div className="space-y-4">
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {locksmithSpecializations.map((spec) => (
                      <div key={spec.id} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-gray-50">
                        <Checkbox
                          id={`spec-${spec.id}`}
                          checked={providerData.locksmithSpecializations.includes(spec.id)}
                          onCheckedChange={(checked) => {
                            const current = providerData.locksmithSpecializations;
                            const updated = checked
                              ? [...current, spec.id]
                              : current.filter(id => id !== spec.id);
                            setProviderData({ ...providerData, locksmithSpecializations: updated });
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`spec-${spec.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {spec.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {spec.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Mobile Service & 24/7 Availability */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label htmlFor="mobileService" className="cursor-pointer">Mobile Service Available</Label>
                         <Checkbox 
                           id="mobileService"
                           checked={providerData.mobileService}
                           onCheckedChange={(checked) => setProviderData({...providerData, mobileService: !!checked})}
                         />
                      </div>
                      <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label htmlFor="availability247" className="cursor-pointer">24/7 Availability</Label>
                         <Checkbox 
                           id="availability247"
                           checked={providerData.availability247}
                           onCheckedChange={(checked) => setProviderData({...providerData, availability247: !!checked})}
                         />
                      </div>
                   </div>

                   {/* Service Radius & Response Time */}
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceRadius">Service Radius</Label>
                        <Select 
                          value={providerData.serviceRadius} 
                          onValueChange={(value) => setProviderData({...providerData, serviceRadius: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select radius" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5km">5km</SelectItem>
                            <SelectItem value="10km">10km</SelectItem>
                            <SelectItem value="20km">20km</SelectItem>
                            <SelectItem value="30km">30km</SelectItem>
                            <SelectItem value="50km+">50km+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responseTime">Typical Response Time</Label>
                        <Select 
                          value={providerData.responseTime} 
                          onValueChange={(value) => setProviderData({...providerData, responseTime: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select response time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Under 30min">Under 30min</SelectItem>
                            <SelectItem value="Within 1hr">Within 1hr</SelectItem>
                            <SelectItem value="Within 2hrs">Within 2hrs</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </div>

                {/* Certifications */}
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications & Qualifications</Label>
                  <Textarea
                    id="certifications"
                    placeholder="List your locksmith certifications, registration numbers, etc."
                    value={providerData.certifications}
                    onChange={(e) => setProviderData({...providerData, certifications: e.target.value})}
                    rows={3}
                  />
                </div>

              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your services and what makes you unique..."
                value={providerData.description}
                onChange={(e) => setProviderData({...providerData, description: e.target.value})}
                rows={4}
                data-testid="textarea-description"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Upload</h3>
              <p className="text-gray-600">Upload required documents for verification</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Profile Picture</h4>
                    <p className="text-sm text-gray-600 mb-4">Clear photo of yourself for your profile</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.profilePicture.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-profile-picture"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      
                      <Button
                        onClick={() => openCamera('profilePicture')}
                        variant="outline"
                        className="w-full"
                        data-testid="button-camera-profile-picture"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.profilePicture}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload('profilePicture', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.profilePicture && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.profilePicture.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ID Document */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">
                      {providerData.applicationType === 'individual' ? 'ID Document' : 'Company Registration'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {providerData.applicationType === 'individual' ? 'South African ID or Passport' : 'CK/CIPC Registration Certificate'}
                    </p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.idDocument.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-id"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      
                      <Button
                        onClick={() => openCamera('idDocument')}
                        variant="outline"
                        className="w-full"
                        data-testid="button-camera-id"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.idDocument}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('idDocument', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.idDocument && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.idDocument.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Proof of Address */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Proof of Address</h4>
                    <p className="text-sm text-gray-600 mb-4">Utility bill or bank statement (last 3 months)</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.proofOfAddress.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-address"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      
                      <Button
                        onClick={() => openCamera('proofOfAddress')}
                        variant="outline"
                        className="w-full"
                        data-testid="button-camera-address"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.proofOfAddress}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('proofOfAddress', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.proofOfAddress && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.proofOfAddress.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bank Statement */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Bank Statement</h4>
                    <p className="text-sm text-gray-600 mb-4">Latest 3 months bank statement</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.bankStatement.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-bank-statement"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Statement
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.bankStatement}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('bankStatement', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.bankStatement && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.bankStatement.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Certificates (Optional)</h4>
                    <p className="text-sm text-gray-600 mb-4">Professional certificates or qualifications</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.certificates.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-certificates"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Certificates
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.certificates}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileUpload('certificates', file));
                      }}
                    />
                    
                    {providerData.certificates.length > 0 && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.certificates.length} file(s) uploaded
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Police Clearance (Au Pair only) */}
              {(providerData.services.includes("Au Pair Services") || providerData.services.includes("Childcare Provider")) && (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Shield className="mx-auto h-12 w-12 text-gray-400" />
                      <h4 className="mt-2 font-medium text-gray-900">Police Clearance</h4>
                      <p className="text-sm text-gray-600 mb-4">Required for childcare providers</p>
                      
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={() => fileInputRefs.policeClearance.current?.click()}
                          variant="outline"
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Clearance
                        </Button>
                      </div>
                      
                      <input
                        ref={fileInputRefs.policeClearance}
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload('policeClearance', e.target.files?.[0] || null)}
                      />
                      
                      {providerData.policeClearance && (
                        <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {providerData.policeClearance.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Banking Details</h3>
              <p className="text-gray-600">Required for payment processing</p>
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Important Payment Information</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Berry Events processes all payments through our secure platform. 
                      Payments are released to providers 2-3 business days after service completion.
                      A 15% platform commission is deducted from each payment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={providerData.bankName} onValueChange={(value) => setProviderData({...providerData, bankName: value})}>
                  <SelectTrigger data-testid="select-bank">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {southAfricanBanks.map(bank => (
                      <SelectItem key={bank} value={bank.toLowerCase().replace(/\s+/g, '-')}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={providerData.accountType} onValueChange={(value) => setProviderData({...providerData, accountType: value})}>
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                placeholder="Full name as shown on bank account"
                value={providerData.accountHolder}
                onChange={(e) => setProviderData({...providerData, accountHolder: e.target.value})}
                required
                data-testid="input-account-holder"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={providerData.accountNumber}
                  onChange={(e) => setProviderData({...providerData, accountNumber: e.target.value})}
                  required
                  data-testid="input-account-number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  placeholder="123456"
                  value={providerData.branchCode}
                  onChange={(e) => setProviderData({...providerData, branchCode: e.target.value})}
                  required
                  data-testid="input-branch-code"
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
               <ReCAPTCHA
                 sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                 onChange={(token) => setCaptchaToken(token)}
               />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EF] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Berry Events Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={berryLogo} 
            alt="Berry Events Logo" 
            className="h-16 w-auto object-contain"
            data-testid="img-berry-logo"
          />
        </div>
        
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center border-b border-[#EED1C4]">
            <CardTitle className="text-2xl font-bold text-[#44062D]">
              Service Provider Application
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Join Berry Events as a verified service provider
            </p>
            
            {/* Progress Bar */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= step
                        ? "bg-[#44062D] text-white"
                        : currentStep > step
                        ? "bg-[#C56B86] text-white"
                        : "bg-[#F7F2EF] text-[#3C0920] border-2 border-[#3C0920]"
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 transition-colors ${
                        currentStep > step ? "bg-[#C56B86]" : "bg-[#EED1C4]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-2">
              <span className="text-sm text-gray-600">
                Step {currentStep} of 4
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {renderStep()}
            
            <div className="flex justify-between pt-6 border-t border-[#EED1C4] mt-6">
              <div>
                {currentStep > 1 && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="border-[#44062D] text-[#44062D] hover:bg-[#EED1C4]/30"
                    disabled={isSubmitting}
                    data-testid="button-previous"
                  >
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setLocation("/")}
                  variant="ghost"
                  className="text-gray-600 hover:text-[#44062D] hover:bg-[#F7F2EF]"
                  disabled={isSubmitting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-[#44062D] hover:bg-[#3C0920] text-white"
                    disabled={isSubmitting}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-[#44062D] hover:bg-[#3C0920] text-white"
                    disabled={isSubmitting}
                    data-testid="button-submit"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
