import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Home, 
  Scissors, 
  Droplets, 
  Star,
  CheckCircle,
  Plus,
  Minus,
  CreditCard,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onBookingComplete: (bookingData: any) => void;
}

export default function EnhancedServiceModal({
  isOpen,
  onClose,
  serviceId,
  onBookingComplete
}: EnhancedServiceModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Common fields
    propertyType: "",
    address: "",
    coordinates: null as { lat: number; lng: number } | null,
    preferredDate: null as Date | null,
    timePreference: "",
    recurringSchedule: "",
    materials: "supply", // supply or bring
    insurance: false,
    specialRequests: "",
    
    // House cleaning specific
    cleaningType: "",
    propertySize: "",
    frequency: "",
    
    // Garden care specific
    gardenSize: "",
    gardenCondition: "",
    serviceType: [],
    seasonalNeeds: [],
    specialization: [],
    
    // Plumbing specific
    urgency: "",
    problemType: "",
    
    // Common selections
    selectedAddOns: [] as string[],
    selectedProvider: null as any,
  });

  const [pricing, setPricing] = useState({
    basePrice: 0,
    addOnsPrice: 0,
    materialsPrice: 0,
    totalPrice: 0
  });

  const [availableProviders, setAvailableProviders] = useState<any[]>([]);

  // Service configurations
  const serviceConfigs = {
    "house-cleaning": {
      title: "House Cleaning Service",
      icon: Home,
      steps: 4,
      basePrice: 280,
      propertyTypes: [
        { value: "apartment", label: "Apartment", priceMultiplier: 1.0 },
        { value: "house", label: "House", priceMultiplier: 1.2 },
        { value: "townhouse", label: "Townhouse", priceMultiplier: 1.1 },
        { value: "villa", label: "Villa", priceMultiplier: 1.5 },
        { value: "cottage", label: "Cottage", priceMultiplier: 1.0 }
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
        { id: "carpet-clean", name: "Carpet Deep Clean", price: 200 },
        { id: "upholstery", name: "Upholstery Cleaning", price: 180 }
      ]
    },
    "garden-care": {
      title: "Garden Care Service", 
      icon: Scissors,
      steps: 4,
      basePrice: 320,
      propertyTypes: [
        { value: "apartment", label: "Apartment Balcony", priceMultiplier: 0.7 },
        { value: "house", label: "House Garden", priceMultiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Garden", priceMultiplier: 0.9 },
        { value: "villa", label: "Villa Estate", priceMultiplier: 1.4 },
        { value: "cottage", label: "Cottage Garden", priceMultiplier: 1.0 }
      ],
      gardenSizes: [
        { value: "small", label: "Small (0-100m²)", multiplier: 1.0 },
        { value: "medium", label: "Medium (100-300m²)", multiplier: 1.3 },
        { value: "large", label: "Large (300-500m²)", multiplier: 1.6 },
        { value: "estate", label: "Estate (500m²+)", multiplier: 2.0 }
      ],
      gardenConditions: [
        { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
        { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
        { value: "overgrown", label: "Overgrown", multiplier: 1.5 },
        { value: "neglected", label: "Severely Neglected", multiplier: 1.8 }
      ],
      serviceTypes: [
        { id: "lawn-care", name: "Lawn Mowing & Edging", price: 150 },
        { id: "pruning", name: "Tree & Shrub Pruning", price: 200 },
        { id: "weeding", name: "Weeding & Cleanup", price: 120 },
        { id: "planting", name: "Planting & Landscaping", price: 300 },
        { id: "irrigation", name: "Irrigation Setup", price: 400 }
      ],
      seasonalNeeds: [
        { id: "spring-prep", name: "Spring Preparation", price: 100 },
        { id: "summer-maintenance", name: "Summer Maintenance", price: 80 },
        { id: "autumn-cleanup", name: "Autumn Cleanup", price: 120 },
        { id: "winter-protection", name: "Winter Protection", price: 100 }
      ],
      specializations: [
        { value: "general", label: "General Gardening", multiplier: 1.0 },
        { value: "landscaping", label: "Landscaping Specialist", multiplier: 1.3 },
        { value: "tree-care", label: "Tree Care Expert", multiplier: 1.4 },
        { value: "irrigation", label: "Irrigation Specialist", multiplier: 1.2 }
      ]
    },
    "plumbing": {
      title: "Plumbing Service",
      icon: Droplets, 
      steps: 4,
      basePrice: 380,
      propertyTypes: [
        { value: "apartment", label: "Apartment", priceMultiplier: 1.0 },
        { value: "house", label: "House", priceMultiplier: 1.1 },
        { value: "townhouse", label: "Townhouse", priceMultiplier: 1.05 },
        { value: "villa", label: "Villa", priceMultiplier: 1.3 },
        { value: "cottage", label: "Cottage", priceMultiplier: 1.0 }
      ],
      urgencyLevels: [
        { value: "emergency", label: "Emergency (24/7)", multiplier: 2.0 },
        { value: "urgent", label: "Urgent (Same Day)", multiplier: 1.5 },
        { value: "standard", label: "Standard (Next Day)", multiplier: 1.0 },
        { value: "scheduled", label: "Scheduled (Flexible)", multiplier: 0.9 }
      ],
      problemTypes: [
        { value: "leak", label: "Leak Repair", price: 380 },
        { value: "blockage", label: "Drain Blockage", price: 320 },
        { value: "installation", label: "New Installation", price: 500 },
        { value: "maintenance", label: "Routine Maintenance", price: 280 }
      ],
      serviceTypes: [
        { id: "pipe-repair", name: "Pipe Repair", price: 200 },
        { id: "faucet-install", name: "Faucet Installation", price: 150 },
        { id: "toilet-repair", name: "Toilet Repair", price: 180 },
        { id: "water-heater", name: "Water Heater Service", price: 400 }
      ]
    }
  };

  const currentConfig = serviceConfigs[serviceId as keyof typeof serviceConfigs];

  // Geolocation functionality
  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
    // In production, integrate with Google Places API for autocomplete and geocoding
    if (address.length > 5) {
      // Mock geocoding - replace with actual API call
      setTimeout(() => {
        const mockCoordinates = {
          lat: -26.2041 + (Math.random() - 0.5) * 0.1,
          lng: 28.0473 + (Math.random() - 0.5) * 0.1
        };
        setFormData(prev => ({ ...prev, coordinates: mockCoordinates }));
        toast({
          title: "Location Found",
          description: "Address has been located successfully"
        });
      }, 1000);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setFormData(prev => ({ ...prev, coordinates }));
        toast({
          title: "Location Detected",
          description: "Current location has been set"
        });
      });
    }
  };

  // Pricing calculations
  useEffect(() => {
    calculatePricing();
  }, [formData, serviceId]);

  const calculatePricing = () => {
    if (!currentConfig) return;

    let basePrice = currentConfig.basePrice;
    
    // Apply property type multiplier
    const propertyType = currentConfig.propertyTypes.find(p => p.value === formData.propertyType);
    if (propertyType) {
      basePrice *= propertyType.priceMultiplier;
    }

    // Service-specific calculations
    if (serviceId === "house-cleaning") {
      const cleaningType = currentConfig.cleaningTypes?.find(t => t.value === formData.cleaningType);
      if (cleaningType) basePrice = cleaningType.price;
      
      const propertySize = currentConfig.propertySizes?.find(s => s.value === formData.propertySize);
      if (propertySize) basePrice *= propertySize.multiplier;
    }

    if (serviceId === "garden-care") {
      const gardenSize = currentConfig.gardenSizes?.find(s => s.value === formData.gardenSize);
      if (gardenSize) basePrice *= gardenSize.multiplier;
      
      const condition = currentConfig.gardenConditions?.find(c => c.value === formData.gardenCondition);
      if (condition) basePrice *= condition.multiplier;
    }

    if (serviceId === "plumbing") {
      const urgency = currentConfig.urgencyLevels?.find(u => u.value === formData.urgency);
      if (urgency) basePrice *= urgency.multiplier;
    }

    // Add-ons pricing
    let addOnsPrice = 0;
    if (currentConfig.addOns) {
      addOnsPrice = currentConfig.addOns
        .filter(addon => formData.selectedAddOns.includes(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0);
    }

    // Materials pricing (if bringing own materials, reduce price by 15%)
    let materialsPrice = 0;
    if (formData.materials === "bring") {
      materialsPrice = -basePrice * 0.15;
    }

    const totalPrice = Math.round(basePrice + addOnsPrice + materialsPrice);

    setPricing({
      basePrice: Math.round(basePrice),
      addOnsPrice,
      materialsPrice,
      totalPrice
    });
  };

  // Provider matching (within 20km radius)
  useEffect(() => {
    if (formData.coordinates && step >= 3) {
      fetchNearbyProviders();
    }
  }, [formData.coordinates, step]);

  const fetchNearbyProviders = () => {
    // Mock provider data - in production, fetch from API based on coordinates
    const mockProviders = [
      {
        id: 1,
        name: "Thabo Mthembu",
        rating: 4.9,
        reviews: 156,
        distance: 3.2,
        specializations: ["Deep Cleaning", "Move In/Out"],
        profileImage: "/api/placeholder/64/64",
        verified: true,
        responseTime: "< 2 hours",
        completedJobs: 340
      },
      {
        id: 2,
        name: "Nomsa Dlamini",
        rating: 4.8,
        reviews: 203,
        distance: 5.7,
        specializations: ["Garden Design", "Lawn Care"],
        profileImage: "/api/placeholder/64/64",
        verified: true,
        responseTime: "< 1 hour", 
        completedJobs: 287
      },
      {
        id: 3,
        name: "Sipho Ndlovu",
        rating: 4.7,
        reviews: 98,
        distance: 8.1,
        specializations: ["Emergency Plumbing", "Installation"],
        profileImage: "/api/placeholder/64/64",
        verified: true,
        responseTime: "< 30 min",
        completedJobs: 195
      }
    ].filter(provider => provider.distance <= 20); // 20km radius filter

    setAvailableProviders(mockProviders);
  };

  const handleNext = () => {
    if (step < currentConfig.steps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBookingConfirm = () => {
    const bookingData = {
      service: serviceId,
      ...formData,
      pricing,
      timestamp: new Date().toISOString(),
      totalPrice: pricing.totalPrice
    };

    console.log("Processing booking:", bookingData);
    onBookingComplete(bookingData);
    toast({
      title: "Booking Confirmed!",
      description: `Your ${currentConfig.title} has been booked successfully.`
    });
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <currentConfig.icon className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Service Details</h3>
        <p className="text-gray-600 text-sm">Tell us about your property and needs</p>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label htmlFor="property-type">Property Type *</Label>
        <Select value={formData.propertyType} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, propertyType: value }))
        }>
          <SelectTrigger data-testid="select-property-type">
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig.propertyTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Address with Geolocation */}
      <div className="space-y-2">
        <Label htmlFor="address">Service Address *</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="flex-1"
            data-testid="input-address"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={getCurrentLocation}
            data-testid="button-current-location"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
        {formData.coordinates && (
          <p className="text-xs text-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Location verified
          </p>
        )}
      </div>

      {/* Service-specific options */}
      {serviceId === "house-cleaning" && (
        <>
          <div className="space-y-2">
            <Label>Cleaning Type *</Label>
            <Select value={formData.cleaningType} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, cleaningType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select cleaning type" />
              </SelectTrigger>
              <SelectContent>
                {currentConfig.cleaningTypes?.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} - R{type.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Property Size *</Label>
            <Select value={formData.propertySize} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, propertySize: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select property size" />
              </SelectTrigger>
              <SelectContent>
                {currentConfig.propertySizes?.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {serviceId === "garden-care" && (
        <>
          <div className="space-y-2">
            <Label>Garden Size *</Label>
            <Select value={formData.gardenSize} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, gardenSize: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select garden size" />
              </SelectTrigger>
              <SelectContent>
                {currentConfig.gardenSizes?.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Garden Condition *</Label>
            <Select value={formData.gardenCondition} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, gardenCondition: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select garden condition" />
              </SelectTrigger>
              <SelectContent>
                {currentConfig.gardenConditions?.map(condition => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {serviceId === "plumbing" && (
        <div className="space-y-2">
          <Label>Urgency Level *</Label>
          <Select value={formData.urgency} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, urgency: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select urgency level" />
            </SelectTrigger>
            <SelectContent>
              {currentConfig.urgencyLevels?.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CalendarIcon className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Schedule & Preferences</h3>
        <p className="text-gray-600 text-sm">Choose your preferred date and time</p>
      </div>

      {/* Preferred Date */}
      <div className="space-y-2">
        <Label>Preferred Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.preferredDate ? formData.preferredDate.toLocaleDateString() : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.preferredDate || undefined}
              onSelect={(date) => setFormData(prev => ({ ...prev, preferredDate: date || null }))}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Modern Time Preference */}
      <div className="space-y-2">
        <Label>Time Preference *</Label>
        <Select value={formData.timePreference} onValueChange={(value) =>
          setFormData(prev => ({ ...prev, timePreference: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Select preferred time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="08:00">8:00 AM - Early Morning</SelectItem>
            <SelectItem value="09:00">9:00 AM - Morning</SelectItem>
            <SelectItem value="10:00">10:00 AM - Late Morning</SelectItem>
            <SelectItem value="11:00">11:00 AM - Mid Morning</SelectItem>
            <SelectItem value="12:00">12:00 PM - Lunch Time</SelectItem>
            <SelectItem value="13:00">1:00 PM - Early Afternoon</SelectItem>
            <SelectItem value="14:00">2:00 PM - Afternoon</SelectItem>
            <SelectItem value="15:00">3:00 PM - Late Afternoon</SelectItem>
            <SelectItem value="16:00">4:00 PM - Evening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recurring Schedule */}
      <div className="space-y-2">
        <Label>Recurring Schedule</Label>
        <Select value={formData.recurringSchedule} onValueChange={(value) =>
          setFormData(prev => ({ ...prev, recurringSchedule: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Select recurring option (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-time">One-time Service</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials/Equipment */}
      <div className="space-y-2">
        <Label>Materials & Equipment</Label>
        <Select value={formData.materials} onValueChange={(value) =>
          setFormData(prev => ({ ...prev, materials: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="supply">Provider Supplies (included in price)</SelectItem>
            <SelectItem value="bring">I'll Provide Materials (15% discount)</SelectItem>
          </SelectContent>
        </Select>
        {formData.materials === "bring" && (
          <p className="text-sm text-green-600">15% discount applied for providing your own materials</p>
        )}
      </div>

      {serviceId === "plumbing" && (
        <div className="space-y-2">
          <Label>Insurance Requirement</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurance"
              checked={formData.insurance}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, insurance: !!checked }))
              }
            />
            <Label htmlFor="insurance" className="text-sm">
              Insurance coverage required by insurer
            </Label>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Plus className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Add-ons & Extras</h3>
        <p className="text-gray-600 text-sm">Customize your service with additional options</p>
      </div>

      {/* Service-specific add-ons */}
      {currentConfig.addOns && (
        <div className="space-y-3">
          <Label>Suggested Add-ons</Label>
          {currentConfig.addOns.map(addon => (
            <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={addon.id}
                  checked={formData.selectedAddOns.includes(addon.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        selectedAddOns: [...prev.selectedAddOns, addon.id]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        selectedAddOns: prev.selectedAddOns.filter(id => id !== addon.id)
                      }));
                    }
                  }}
                />
                <div>
                  <Label htmlFor={addon.id} className="font-medium">{addon.name}</Label>
                  {addon.description && (
                    <p className="text-sm text-gray-600">{addon.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold">+R{addon.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Garden care specific options */}
      {serviceId === "garden-care" && currentConfig.serviceTypes && (
        <div className="space-y-3">
          <Label>Service Types</Label>
          {currentConfig.serviceTypes.map(service => (
            <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={service.id}
                  checked={formData.serviceType.includes(service.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        serviceType: [...prev.serviceType, service.id]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        serviceType: prev.serviceType.filter((id: string) => id !== service.id)
                      }));
                    }
                  }}
                />
                <Label htmlFor={service.id} className="font-medium">{service.name}</Label>
              </div>
              <span className="font-semibold">+R{service.price}</span>
            </div>
          ))}
        </div>
      )}

      {serviceId === "garden-care" && currentConfig.seasonalNeeds && (
        <div className="space-y-3">
          <Label>Seasonal Needs</Label>
          <Select value={formData.seasonalNeeds.join(",")} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, seasonalNeeds: value ? value.split(",") : [] }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select seasonal requirements" />
            </SelectTrigger>
            <SelectContent>
              {currentConfig.seasonalNeeds.map(need => (
                <SelectItem key={need.id} value={need.id}>
                  {need.name} (+R{need.price})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Special Requests */}
      <div className="space-y-2">
        <Label htmlFor="special-requests">Special Requests</Label>
        <Input
          id="special-requests"
          placeholder="Any specific requirements or notes..."
          value={formData.specialRequests}
          onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Choose Your Provider</h3>
        <p className="text-gray-600 text-sm">Select from verified professionals in your area</p>
      </div>

      {/* Available Providers within 20km */}
      <div className="space-y-4">
        {availableProviders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Finding providers in your area...</p>
          </div>
        ) : (
          availableProviders.map((provider) => (
            <Card 
              key={provider.id}
              className={`cursor-pointer transition-all ${
                formData.selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setFormData(prev => ({ ...prev, selectedProvider: provider }))}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{provider.name}</h4>
                      {provider.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {provider.rating} ({provider.reviews})
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {provider.distance}km away
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {provider.responseTime}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.specializations.slice(0, 2).map(spec => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{provider.completedJobs} jobs completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Specialization Selection for Garden Care */}
      {serviceId === "garden-care" && (
        <div className="space-y-2">
          <Label>Provider Specialization</Label>
          <Select value={formData.specialization.join(",")} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, specialization: value ? value.split(",") : [] }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select specialization preference" />
            </SelectTrigger>
            <SelectContent>
              {currentConfig.specializations?.map(spec => (
                <SelectItem key={spec.value} value={spec.value}>
                  {spec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Pricing Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Base Service</span>
            <span>R{pricing.basePrice}</span>
          </div>
          {pricing.addOnsPrice > 0 && (
            <div className="flex justify-between">
              <span>Add-ons</span>
              <span>R{pricing.addOnsPrice}</span>
            </div>
          )}
          {pricing.materialsPrice !== 0 && (
            <div className="flex justify-between text-green-600">
              <span>Materials Discount</span>
              <span>R{pricing.materialsPrice}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>R{pricing.totalPrice}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!currentConfig) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <currentConfig.icon className="h-6 w-6" />
            <span>{currentConfig.title}</span>
          </DialogTitle>
          <DialogDescription>
            Step {step} of {currentConfig.steps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-6">
          {Array.from({ length: currentConfig.steps }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i + 1 <= step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < currentConfig.steps ? (
            <Button onClick={handleNext} disabled={
              (step === 1 && (!formData.propertyType || !formData.address)) ||
              (step === 2 && (!formData.preferredDate || !formData.timePreference)) ||
              (step === 4 && !formData.selectedProvider)
            }>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleBookingConfirm}
              className="bg-gradient-to-r from-primary to-purple-600"
              disabled={!formData.selectedProvider}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment - R{pricing.totalPrice}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}