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
        fields: ["issueType", "urgency", "photos"]
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
        fields: ["serviceType", "emergency", "safety"]
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
    priceRange: "R550-R5000",
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
        description: "Choose cuisine and menu preferences",
        fields: ["cuisine", "menu", "budget"]
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
        fields: ["movingType", "distance", "flexibility"]
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
        fields: ["childrenAges", "schedule", "duration"]
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
  }
};

export default function AdvancedBookingModal({ isOpen, onClose, preSelectedService = "" }: AdvancedBookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState(preSelectedService);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate booking submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
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