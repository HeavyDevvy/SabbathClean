import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  X,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Home,
  Users,
  CheckCircle2,
  Star,
  Shield,
  Phone,
  Mail,
  Camera,
  Upload
} from "lucide-react";

interface AdvancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: string;
}

interface ServiceStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

interface ServiceConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  gradient: string;
  steps: ServiceStep[];
  estimatedDuration: string;
  priceRange: string;
}

const serviceConfigs: { [key: string]: ServiceConfig } = {
  "cleaning": {
    id: "cleaning",
    name: "House Cleaning",
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
    estimatedDuration: "2-6 hours",
    priceRange: "R280-R850",
    steps: [
      {
        id: "service-selection",
        title: "Service Selection",
        description: "Choose your cleaning type and property details",
        fields: ["cleaningType", "propertySize", "frequency"]
      },
      {
        id: "location-property",
        title: "Location & Property Details",
        description: "Provide address and property information",
        fields: ["address", "propertyType", "specialRequirements", "accessInstructions"]
      },
      {
        id: "schedule",
        title: "Schedule Selection",
        description: "Pick your preferred date and time",
        fields: ["date", "timePreference", "recurringSchedule"]
      },
      {
        id: "customization",
        title: "Service Customization",
        description: "Add-ons and special instructions",
        fields: ["addOns", "supplies", "instructions"]
      },
      {
        id: "confirmation",
        title: "Provider & Confirmation",
        description: "Select your cleaner and confirm booking",
        fields: ["provider", "finalReview"]
      }
    ]
  },
  "plumbing": {
    id: "plumbing",
    name: "Plumbing Services",
    icon: MapPin,
    gradient: "from-cyan-500 to-blue-600",
    estimatedDuration: "1-4 hours",
    priceRange: "R350-R1200",
    steps: [
      {
        id: "problem-assessment",
        title: "Problem Assessment",
        description: "Describe your plumbing issue",
        fields: ["issueType", "urgency", "emergencyService", "photos"]
      },
      {
        id: "location-details",
        title: "Location Details",
        description: "Property information and access",
        fields: ["address", "propertyInfo", "accessibility"]
      },
      {
        id: "requirements",
        title: "Service Requirements", 
        description: "Details about materials and insurance",
        fields: ["description", "materials", "insurance"]
      },
      {
        id: "plumber-selection",
        title: "Plumber Selection",
        description: "Choose your certified plumber",
        fields: ["serviceType", "plumber", "pricing"]
      }
    ]
  },
  "electrical": {
    id: "electrical",
    name: "Electrical Services",
    icon: MapPin,
    gradient: "from-yellow-500 to-orange-500",
    estimatedDuration: "1-8 hours",
    priceRange: "R400-R2000",
    steps: [
      {
        id: "service-type",
        title: "Service Type Selection",
        description: "Emergency, installation, or inspection",
        fields: ["issueType", "emergency", "safety"]
      },
      {
        id: "compliance",
        title: "Safety & Compliance",
        description: "Certificates and insurance verification",
        fields: ["certificates", "insurance", "systemAge"]
      },
      {
        id: "requirements",
        title: "Detailed Requirements",
        description: "Specific electrical work needed",
        fields: ["workDetails", "photos", "scheduling"]
      },
      {
        id: "electrician",
        title: "Electrician Selection",
        description: "Licensed electrician matching",
        fields: ["electrician", "specialization", "pricing"]
      }
    ]
  },
  "chef-catering": {
    id: "chef-catering",
    name: "Chef & Catering",
    icon: MapPin,
    gradient: "from-green-500 to-emerald-500",
    estimatedDuration: "2-12 hours",
    priceRange: "R400-R4500",
    steps: [
      {
        id: "service-type",
        title: "Service Type",
        description: "Personal chef, catering, or cooking classes",
        fields: ["serviceType", "dietary", "guestCount"]
      },
      {
        id: "cuisine-menu",
        title: "Cuisine & Menu Selection",
        description: "Choose cuisine, menu preferences, and dietary requirements",
        fields: ["cuisineType", "menu", "dietaryRequirements", "ingredientSource", "budget"]
      },
      {
        id: "event-details",
        title: "Event Details",
        description: "Venue and timing information",
        fields: ["date", "venue", "facilities", "duration"]
      },
      {
        id: "chef-matching",
        title: "Chef Matching",
        description: "Select your specialized chef",
        fields: ["chef", "portfolio", "pricing"]
      }
    ]
  },
  "moving": {
    id: "moving",
    name: "Moving Services",
    icon: MapPin,
    gradient: "from-purple-500 to-pink-500",
    estimatedDuration: "4-12 hours",
    priceRange: "R800-R5000",
    steps: [
      {
        id: "moving-type",
        title: "Moving Type & Distance",
        description: "Local or long-distance moving",
        fields: ["serviceType", "distance", "flexibility"]
      },
      {
        id: "locations",
        title: "Location Details",
        description: "Current and destination addresses",
        fields: ["currentAddress", "destinationAddress", "access"]
      },
      {
        id: "inventory",
        title: "Inventory & Services",
        description: "Items to move and additional services",
        fields: ["inventory", "specialItems", "services"]
      },
      {
        id: "customization",
        title: "Service Customization",
        description: "Packing, insurance, and storage options",
        fields: ["packing", "insurance", "assembly"]
      },
      {
        id: "team-selection",
        title: "Team Selection",
        description: "Moving team and scheduling",
        fields: ["team", "vehicle", "schedule"]
      }
    ]
  },
  "au-pair": {
    id: "au-pair",
    name: "Au Pair Services",
    icon: MapPin,
    gradient: "from-pink-500 to-rose-500",
    estimatedDuration: "4 hours - 12 months",
    priceRange: "R180-R8000",
    steps: [
      {
        id: "care-requirements",
        title: "Care Requirements",
        description: "Children's needs and schedule",
        fields: ["careType", "childrenAges", "schedule", "duration"]
      },
      {
        id: "family-profile",
        title: "Family Profile",
        description: "Household information and expectations",
        fields: ["household", "routines", "accommodation"]
      },
      {
        id: "matching",
        title: "Au Pair Matching", 
        description: "Background checks and experience matching",
        fields: ["background", "experience", "cultural"]
      },
      {
        id: "agreement",
        title: "Contract & Agreement",
        description: "Terms, payment, and trial period",
        fields: ["terms", "payment", "trial"]
      }
    ]
  },
  "garden-care": {
    id: "garden-care",
    name: "Garden Care",
    icon: MapPin,
    gradient: "from-green-500 to-teal-500",
    estimatedDuration: "2-8 hours",
    priceRange: "R180-R1200",
    steps: [
      {
        id: "service-type",
        title: "Garden Service Type",
        description: "What type of garden work do you need?",
        fields: ["serviceType", "gardenSize", "frequency"]
      },
      {
        id: "garden-details",
        title: "Garden Details",
        description: "Property and garden information",
        fields: ["address", "gardenCondition", "equipment"]
      },
      {
        id: "scheduling",
        title: "Schedule Service",
        description: "When would you like the service?",
        fields: ["preferredDate", "timePreference", "seasonalNeeds"]
      },
      {
        id: "gardener-selection",
        title: "Gardener Selection",
        description: "Choose your garden care specialist",
        fields: ["gardener", "specialization", "pricing"]
      }
    ]
  },
  "waitering": {
    id: "waitering",
    name: "Waitering Services",
    icon: MapPin,
    gradient: "from-indigo-500 to-purple-500",
    estimatedDuration: "4-12 hours",
    priceRange: "R340-R2000",
    steps: [
      {
        id: "event-type",
        title: "Event Type",
        description: "What type of event do you need waiters for?",
        fields: ["eventType", "guestCount", "duration"]
      },
      {
        id: "event-details",
        title: "Event Details",
        description: "Date, venue, and service requirements",
        fields: ["eventDate", "venue", "serviceLevel"]
      },
      {
        id: "requirements",
        title: "Service Requirements",
        description: "Specific needs and uniform requirements",
        fields: ["uniform", "experience", "languages"]
      },
      {
        id: "staff-selection",
        title: "Staff Selection",
        description: "Choose your waitering team",
        fields: ["staffCount", "teamLead", "pricing"]
      }
    ]
  }
};

export default function AdvancedBookingModal({ isOpen, onClose, preSelectedService = "" }: AdvancedBookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState(preSelectedService);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [basePrices] = useState({
    cleaning: 75,
    plumbing: 120,
    electrical: 150,
    'chef-catering': 400,
    moving: 600,
    'au-pair': 65,
    'garden-care': 90,
    waitering: 85
  });

  useEffect(() => {
    if (preSelectedService && serviceConfigs[preSelectedService]) {
      setSelectedService(preSelectedService);
      setCurrentStep(0);
    }
  }, [preSelectedService]);

  const currentServiceConfig = selectedService ? serviceConfigs[selectedService] : null;
  const totalSteps = currentServiceConfig ? currentServiceConfig.steps.length : 0;
  const currentStepData = currentServiceConfig ? currentServiceConfig.steps[currentStep] : null;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setCurrentStep(0);
    setFormData({});
  };

  const calculateTotalPrice = (data: any) => {
    if (!selectedService) return 0;
    
    let basePrice = basePrices[selectedService as keyof typeof basePrices] || 0;
    let additionalCosts = 0;
    
    // Chef & Catering specific pricing
    if (selectedService === 'chef-catering') {
      if (data.ingredientSource === 'chef-brings') {
        additionalCosts += 150; // Chef brings ingredients surcharge
      }
      if (data.guestCount) {
        const guests = parseInt(data.guestCount) || 1;
        if (guests > 10) {
          additionalCosts += (guests - 10) * 25; // R25 per guest over 10
        }
      }
    }
    
    // Cleaning service pricing
    if (selectedService === 'cleaning') {
      if (data.propertySize === 'large' || data.propertySize === 'mansion') {
        additionalCosts += 50; // Large property surcharge
      }
      if (data.frequency === 'one-time-deep' || data.cleaningType === 'deep-clean') {
        additionalCosts += 75; // Deep cleaning surcharge
      }
    }
    
    // Plumbing emergency surcharge
    if (selectedService === 'plumbing' && data.emergencyService === 'yes') {
      additionalCosts += 80; // Emergency service surcharge
    }
    
    // Moving distance surcharge
    if (selectedService === 'moving') {
      if (data.distance === 'long-distance' || data.distance === 'provincial') {
        additionalCosts += 200; // Long distance surcharge
      }
      if (data.serviceType === 'long-distance') {
        additionalCosts += 200; // Service type long distance surcharge
      }
    }
    
    // Guest count surcharge for chef/catering and waitering
    if ((selectedService === 'chef-catering' || selectedService === 'waitering') && data.guestCount) {
      const guestRange = data.guestCount;
      if (guestRange === '11-20' || guestRange === '21-50' || guestRange === '50+') {
        // Calculate additional cost for guests over 10
        let extraGuests = 0;
        if (guestRange === '11-20') extraGuests = 15; // Average 15 guests
        else if (guestRange === '21-50') extraGuests = 35; // Average 35 guests
        else if (guestRange === '50+') extraGuests = 60; // Average 60 guests
        
        if (extraGuests > 10) {
          additionalCosts += (extraGuests - 10) * 25; // R25 per guest over 10
        }
      }
    }
    
    return basePrice + additionalCosts;
  };

  const handleFormChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    setTotalPrice(calculateTotalPrice(newFormData));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Process payment through gateway
      const bookingData = {
        service: selectedService,
        ...formData,
        totalPrice,
        timestamp: new Date().toISOString()
      };
      
      // Here we would integrate with Stripe or other payment gateway
      console.log('Processing booking:', bookingData);
      
      // Simulate API call for booking creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create URL parameters for payment page
      const paymentParams = new URLSearchParams({
        service: currentServiceConfig?.name || selectedService,
        total: totalPrice.toString(),
        basePrice: (basePrices[selectedService as keyof typeof basePrices] || 0).toString(),
        date: formData.preferredDate || '2025-01-15',
        time: formData.preferredTime || '09:00',
        location: `${formData.address || '123 Oak Street'}, ${formData.city || 'Cape Town'}`,
        ...(formData.ingredientSource && { ingredientSource: formData.ingredientSource })
      });
      
      // Redirect to payment confirmation page
      window.location.href = `/payment?${paymentParams.toString()}`;
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
      setIsLoading(false);
    }
  };

  const renderServiceSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Your Service</h3>
        <p className="text-gray-600">Choose the home service you need to get started</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(serviceConfigs).map((service) => (
          <Card 
            key={service.id} 
            className={`cursor-pointer border-2 hover:shadow-lg transition-all duration-300 ${
              selectedService === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleServiceSelect(service.id)}
            data-testid={`service-option-${service.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center`}>
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{service.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{service.estimatedDuration}</span>
                    <span>{service.priceRange}</span>
                  </div>
                </div>
                {selectedService === service.id && (
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (!currentStepData || !currentServiceConfig) return null;

    // This would contain service-specific form fields based on the step
    // For now, showing a generic form structure
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        <div className="space-y-4">
          {currentStepData.fields.map((field, index) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-sm font-medium text-gray-700 capitalize">
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
              
              {field.includes('address') ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={field}
                    placeholder="Enter your address"
                    className="pl-10"
                    value={formData[field] || ''}
                    onChange={(e) => handleFormChange(field, e.target.value)}
                    data-testid={`input-${field}`}
                  />
                </div>
              ) : field.includes('date') ? (
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={field}
                    type="date"
                    className="pl-10"
                    value={formData[field] || ''}
                    onChange={(e) => handleFormChange(field, e.target.value)}
                    data-testid={`input-${field}`}
                  />
                </div>
              ) : field.includes('time') ? (
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={field}
                    type="time"
                    className="pl-10"
                    value={formData[field] || ''}
                    onChange={(e) => handleFormChange(field, e.target.value)}
                    data-testid={`input-${field}`}
                  />
                </div>
              ) : field.includes('instructions') || field.includes('description') ? (
                <Textarea
                  id={field}
                  placeholder="Provide additional details..."
                  value={formData[field] || ''}
                  onChange={(e) => handleFormChange(field, e.target.value)}
                  data-testid={`textarea-${field}`}
                />
              ) : field.includes('photos') ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload photos of the issue</p>
                  <Button variant="outline" size="sm" data-testid="upload-photos">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              ) : field === 'dietaryRequirements' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select dietary requirements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="halaal">Halaal</SelectItem>
                    <SelectItem value="non-halaal">Non-Halaal</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="kosher">Kosher</SelectItem>
                    <SelectItem value="none">No Restrictions</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'issueType' && selectedService === 'plumbing' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select plumbing issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="burst-pipe">Burst Pipe (Emergency)</SelectItem>
                    <SelectItem value="toilet-blockage">Toilet Blockage/Repair</SelectItem>
                    <SelectItem value="tap-leak">Leaking Tap/Faucet</SelectItem>
                    <SelectItem value="geyser-issue">Geyser Problems</SelectItem>
                    <SelectItem value="drain-blockage">Drain Blockage</SelectItem>
                    <SelectItem value="pipe-installation">Pipe Installation</SelectItem>
                    <SelectItem value="shower-repair">Shower/Bath Repair</SelectItem>
                    <SelectItem value="sink-repair">Kitchen Sink Issues</SelectItem>
                    <SelectItem value="valve-replacement">Valve Replacement</SelectItem>
                    <SelectItem value="water-pressure">Water Pressure Issues</SelectItem>
                    <SelectItem value="other">Other (Please Specify)</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'issueType' && selectedService === 'electrical' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select electrical issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="power-outage">Power Outage/No Electricity</SelectItem>
                    <SelectItem value="circuit-breaker">Circuit Breaker Issues</SelectItem>
                    <SelectItem value="outlet-installation">Outlet Installation/Repair</SelectItem>
                    <SelectItem value="light-fixture">Light Fixture Installation</SelectItem>
                    <SelectItem value="wiring-repair">Electrical Wiring Repair</SelectItem>
                    <SelectItem value="ceiling-fan">Ceiling Fan Installation</SelectItem>
                    <SelectItem value="electrical-panel">Electrical Panel Upgrade</SelectItem>
                    <SelectItem value="safety-inspection">Electrical Safety Inspection</SelectItem>
                    <SelectItem value="outdoor-lighting">Outdoor Lighting Setup</SelectItem>
                    <SelectItem value="appliance-connection">Appliance Connection</SelectItem>
                    <SelectItem value="other">Other (Please Specify)</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'cleaningType' && selectedService === 'cleaning' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select cleaning type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular-clean">Regular House Clean</SelectItem>
                    <SelectItem value="deep-clean">Deep Cleaning (+R75)</SelectItem>
                    <SelectItem value="move-in-out">Move In/Out Cleaning</SelectItem>
                    <SelectItem value="post-construction">Post-Construction Clean</SelectItem>
                    <SelectItem value="carpet-clean">Carpet & Upholstery</SelectItem>
                    <SelectItem value="window-clean">Window Cleaning</SelectItem>
                    <SelectItem value="office-clean">Office/Commercial Clean</SelectItem>
                    <SelectItem value="eco-friendly">Eco-Friendly Cleaning</SelectItem>
                    <SelectItem value="disinfection">Deep Disinfection</SelectItem>
                    <SelectItem value="custom">Custom Cleaning Plan</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'serviceType' && selectedService === 'garden-care' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select garden service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lawn-mowing">Lawn Mowing & Edging</SelectItem>
                    <SelectItem value="hedge-trimming">Hedge Trimming & Pruning</SelectItem>
                    <SelectItem value="garden-cleanup">General Garden Cleanup</SelectItem>
                    <SelectItem value="landscaping">Garden Landscaping</SelectItem>
                    <SelectItem value="tree-removal">Tree Removal/Trimming</SelectItem>
                    <SelectItem value="irrigation">Irrigation System Setup</SelectItem>
                    <SelectItem value="plant-care">Plant Care & Maintenance</SelectItem>
                    <SelectItem value="pest-control">Garden Pest Control</SelectItem>
                    <SelectItem value="seasonal-prep">Seasonal Garden Prep</SelectItem>
                    <SelectItem value="design-consultation">Garden Design Consultation</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'serviceType' && selectedService === 'moving' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select moving service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local-residential">Local Residential Move</SelectItem>
                    <SelectItem value="long-distance">Long Distance Move (+R200)</SelectItem>
                    <SelectItem value="office-move">Office/Commercial Move</SelectItem>
                    <SelectItem value="packing-only">Packing Services Only</SelectItem>
                    <SelectItem value="furniture-move">Furniture Moving Only</SelectItem>
                    <SelectItem value="piano-move">Piano/Specialty Items</SelectItem>
                    <SelectItem value="storage-move">Move to Storage</SelectItem>
                    <SelectItem value="same-day">Same Day Emergency Move</SelectItem>
                    <SelectItem value="assembly">Furniture Assembly/Disassembly</SelectItem>
                    <SelectItem value="full-service">Full Service Move (Pack+Move)</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'careType' && selectedService === 'au-pair' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select childcare type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="babysitting">Occasional Babysitting</SelectItem>
                    <SelectItem value="daily-care">Daily Childcare</SelectItem>
                    <SelectItem value="live-in">Live-in Au Pair</SelectItem>
                    <SelectItem value="after-school">After School Care</SelectItem>
                    <SelectItem value="weekend-care">Weekend Care</SelectItem>
                    <SelectItem value="overnight-care">Overnight Care</SelectItem>
                    <SelectItem value="newborn-care">Newborn/Infant Care</SelectItem>
                    <SelectItem value="special-needs">Special Needs Care</SelectItem>
                    <SelectItem value="tutoring">Tutoring & Homework Help</SelectItem>
                    <SelectItem value="emergency-care">Emergency Childcare</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'eventType' && selectedService === 'waitering' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding Reception</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="birthday-party">Birthday Party</SelectItem>
                    <SelectItem value="dinner-party">Private Dinner Party</SelectItem>
                    <SelectItem value="cocktail-party">Cocktail Party</SelectItem>
                    <SelectItem value="family-gathering">Family Gathering</SelectItem>
                    <SelectItem value="holiday-party">Holiday Celebration</SelectItem>
                    <SelectItem value="graduation">Graduation Party</SelectItem>
                    <SelectItem value="baby-shower">Baby Shower</SelectItem>
                    <SelectItem value="conference">Business Conference</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'cuisineType' && selectedService === 'chef-catering' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="south-african">South African Traditional</SelectItem>
                    <SelectItem value="west-african">West African (Nigerian, Ghanaian)</SelectItem>
                    <SelectItem value="east-african">East African (Ethiopian, Kenyan)</SelectItem>
                    <SelectItem value="north-african">North African (Moroccan, Egyptian)</SelectItem>
                    <SelectItem value="central-african">Central African</SelectItem>
                    <SelectItem value="indian-fusion">Indian Fusion</SelectItem>
                    <SelectItem value="continental">Continental/European</SelectItem>
                    <SelectItem value="asian-fusion">Asian Fusion</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="custom-menu">Custom Menu Design</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'urgency' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (Within 2 hours)</SelectItem>
                    <SelectItem value="same-day">Same Day Service</SelectItem>
                    <SelectItem value="next-day">Next Day Service</SelectItem>
                    <SelectItem value="within-week">Within This Week</SelectItem>
                    <SelectItem value="flexible">Flexible Timing</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'propertySize' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select property size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1-2 bedrooms)</SelectItem>
                    <SelectItem value="medium">Medium (3-4 bedrooms)</SelectItem>
                    <SelectItem value="large">Large (5+ bedrooms) (+R50)</SelectItem>
                    <SelectItem value="mansion">Mansion/Estate (+R50)</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'frequency' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Select service frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time Service</SelectItem>
                    <SelectItem value="one-time-deep">One-time Deep Clean (+R75)</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Every 2 Weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'emergencyService' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Emergency service needed?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Emergency (+R80)</SelectItem>
                    <SelectItem value="no">No - Regular Service</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'guestCount' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 guests</SelectItem>
                    <SelectItem value="6-10">6-10 guests</SelectItem>
                    <SelectItem value="11-20">11-20 guests (+R25 per guest over 10)</SelectItem>
                    <SelectItem value="21-50">21-50 guests (+R25 per guest over 10)</SelectItem>
                    <SelectItem value="50+">50+ guests (+R25 per guest over 10)</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'distance' ? (
                <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                  <SelectTrigger data-testid={`select-${field}`}>
                    <SelectValue placeholder="Moving distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local (Same city)</SelectItem>
                    <SelectItem value="regional">Regional (Under 100km)</SelectItem>
                    <SelectItem value="long-distance">Long Distance (100km+) (+R200)</SelectItem>
                    <SelectItem value="provincial">Different Province (+R200)</SelectItem>
                  </SelectContent>
                </Select>
              ) : field === 'ingredientSource' ? (
                <div className="space-y-4">
                  <Select value={formData[field] || ''} onValueChange={(value) => handleFormChange(field, value)}>
                    <SelectTrigger data-testid={`select-${field}`}>
                      <SelectValue placeholder="Choose ingredient sourcing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chef-brings">Chef Brings Ingredients (+R150)</SelectItem>
                      <SelectItem value="on-site">Use On-Site Ingredients</SelectItem>
                      <SelectItem value="mixed">Mixed (Some Chef, Some On-Site)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData[field] === 'chef-brings' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Additional R150 charge</strong> applies for chef-sourced ingredients.
                        This includes premium quality ingredients and dietary-specific items.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  id={field}
                  placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  value={formData[field] || ''}
                  onChange={(e) => handleFormChange(field, e.target.value)}
                  data-testid={`input-${field}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProgressBar = () => {
    if (!currentServiceConfig) return null;
    
    const progress = ((currentStep + 1) / totalSteps) * 100;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-gradient-to-r ${currentServiceConfig.gradient} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" 
        data-testid="advanced-booking-modal"
        aria-describedby="booking-modal-description"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {selectedService ? `Book ${currentServiceConfig?.name}` : 'Book a Service'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div id="booking-modal-description" className="sr-only">
            Complete service booking form with step-by-step process
          </div>
        </DialogHeader>

        <div className="mt-6">
          {selectedService && renderProgressBar()}
          
          {!selectedService ? renderServiceSelection() : renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? () => setSelectedService('') : handleBack}
              className="flex items-center"
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Change Service' : 'Back'}
            </Button>

            {selectedService && (
              <div className="flex items-center space-x-4">
                {currentStep < totalSteps - 1 ? (
                  <Button
                    onClick={handleNext}
                    className={`bg-gradient-to-r ${currentServiceConfig?.gradient} text-white flex items-center`}
                    data-testid="next-button"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`bg-gradient-to-r ${currentServiceConfig?.gradient} text-white flex items-center`}
                    data-testid="submit-booking"
                  >
                    {isLoading ? 'Processing...' : 'Confirm Booking'}
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}