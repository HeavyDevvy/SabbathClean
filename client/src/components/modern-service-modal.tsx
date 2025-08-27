import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Star,
  CheckCircle,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModernServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onBookingComplete: (bookingData: any) => void;
}

export default function ModernServiceModal({
  isOpen,
  onClose,
  serviceId,
  onBookingComplete
}: ModernServiceModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Core fields
    propertyType: "",
    address: "",
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
    urgency: "standard",
    
    // Selections
    selectedAddOns: [] as string[],
    selectedProvider: null as any
  });

  const [pricing, setPricing] = useState({
    basePrice: 0,
    addOnsPrice: 0,
    materialsDiscount: 0,
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
      responseTime: "< 2 hours"
    },
    {
      id: 2,
      name: "Nomsa Dlamini", 
      rating: 4.8,
      reviews: 203,
      distance: 5.7,
      specializations: ["Garden Design", "Lawn Care"],
      verified: true,
      responseTime: "< 1 hour"
    },
    {
      id: 3,
      name: "Sipho Ndlovu",
      rating: 4.7,
      reviews: 98,
      distance: 8.1,
      specializations: ["Emergency Plumbing"],
      verified: true,
      responseTime: "< 30 min"
    }
  ]);

  const serviceConfigs: any = {
    "house-cleaning": {
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
        { value: "apartment", label: "Apartment Balcony", multiplier: 0.7 },
        { value: "house", label: "House Garden", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Garden", multiplier: 0.9 },
        { value: "villa", label: "Villa Estate", multiplier: 1.4 }
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
      urgencyLevels: [
        { value: "emergency", label: "Emergency (24/7)", multiplier: 2.0 },
        { value: "urgent", label: "Urgent (Same Day)", multiplier: 1.5 },
        { value: "standard", label: "Standard (Next Day)", multiplier: 1.0 },
        { value: "scheduled", label: "Scheduled (Flexible)", multiplier: 0.9 }
      ],
      addOns: [
        { id: "pipe-repair", name: "Pipe Repair", price: 200 },
        { id: "faucet-install", name: "Faucet Installation", price: 150 },
        { id: "toilet-repair", name: "Toilet Repair", price: 180 },
        { id: "water-heater", name: "Water Heater Service", price: 400 }
      ]
    }
  };

  const currentConfig = serviceConfigs[serviceId] || serviceConfigs["house-cleaning"];

  // Calculate pricing whenever form data changes
  useEffect(() => {
    let basePrice = currentConfig.basePrice;
    
    // Property type multiplier
    const propertyType = currentConfig.propertyTypes?.find((p: any) => p.value === formData.propertyType);
    if (propertyType) {
      basePrice *= propertyType.multiplier;
    }

    // Service-specific multipliers
    if (serviceId === "house-cleaning") {
      const cleaningType = currentConfig.cleaningTypes?.find((t: any) => t.value === formData.cleaningType);
      if (cleaningType) basePrice = cleaningType.price;
      
      const propertySize = currentConfig.propertySizes?.find((s: any) => s.value === formData.propertySize);
      if (propertySize) basePrice *= propertySize.multiplier;
    }

    if (serviceId === "garden-care") {
      const gardenSize = currentConfig.gardenSizes?.find((s: any) => s.value === formData.gardenSize);
      if (gardenSize) basePrice *= gardenSize.multiplier;
      
      const condition = currentConfig.gardenConditions?.find((c: any) => c.value === formData.gardenCondition);
      if (condition) basePrice *= condition.multiplier;
    }

    if (serviceId === "plumbing") {
      const urgency = currentConfig.urgencyLevels?.find((u: any) => u.value === formData.urgency);
      if (urgency) basePrice *= urgency.multiplier;
    }

    // Add-ons pricing
    const addOnsPrice = currentConfig.addOns
      ?.filter((addon: any) => formData.selectedAddOns.includes(addon.id))
      ?.reduce((sum: number, addon: any) => sum + addon.price, 0) || 0;

    // Materials discount (15% if bringing own materials)
    const materialsDiscount = formData.materials === "bring" ? Math.round(basePrice * 0.15) : 0;

    const totalPrice = Math.round(basePrice + addOnsPrice - materialsDiscount);

    setPricing({
      basePrice: Math.round(basePrice),
      addOnsPrice,
      materialsDiscount,
      totalPrice
    });
  }, [formData, serviceId, currentConfig]);

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
    if (address.length > 5) {
      toast({
        title: "Location Detected",
        description: "Address has been located successfully"
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        toast({
          title: "Location Found",
          description: "Current location has been set"
        });
      });
    }
  };

  const handleNext = () => {
    if (step < currentConfig.steps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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

      <div className="space-y-4">
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
          <div className="flex gap-2">
            <Input
              id="address"
              placeholder="Enter your address for geolocation"
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
          {formData.address && (
            <p className="text-xs text-green-600 flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Location will be verified
            </p>
          )}
        </div>

        {serviceId === "house-cleaning" && (
          <>
            <div>
              <Label>Cleaning Type *</Label>
              <Select value={formData.cleaningType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, cleaningType: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select cleaning type" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.cleaningTypes?.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - R{type.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Property Size *</Label>
              <Select value={formData.propertySize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, propertySize: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select property size" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.propertySizes?.map((size: any) => (
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
            <div>
              <Label>Garden Size Range *</Label>
              <Select value={formData.gardenSize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, gardenSize: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select garden size" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.gardenSizes?.map((size: any) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Garden Condition *</Label>
              <Select value={formData.gardenCondition} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, gardenCondition: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select garden condition" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.gardenConditions?.map((condition: any) => (
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
          <div>
            <Label>Service Type *</Label>
            <Select value={formData.urgency} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, urgency: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select service urgency" />
              </SelectTrigger>
              <SelectContent>
                {currentConfig.urgencyLevels?.map((level: any) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CalendarIcon className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Schedule & Preferences</h3>
        <p className="text-gray-600 text-sm">Choose your preferred date and time</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Preferred Date *</Label>
          <Input
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>

        <div>
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
              <SelectItem value="12:00">12:00 PM - Lunch Time</SelectItem>
              <SelectItem value="14:00">2:00 PM - Afternoon</SelectItem>
              <SelectItem value="16:00">4:00 PM - Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Recurring Schedule</Label>
          <Select value={formData.recurringSchedule} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, recurringSchedule: value }))
          }>
            <SelectTrigger>
              <SelectValue />
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

        <div>
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
            <p className="text-sm text-green-600 mt-1">15% discount applied for providing your own materials</p>
          )}
        </div>

        {serviceId === "plumbing" && (
          <div className="space-y-2">
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
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-primary text-xl">+</span>
        </div>
        <h3 className="text-lg font-semibold">Add-ons & Extras</h3>
        <p className="text-gray-600 text-sm">Customize your service with additional options</p>
      </div>

      <div className="space-y-4">
        <Label>Suggested Add-ons</Label>
        {currentConfig.addOns?.map((addon: any) => (
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
              <Label htmlFor={addon.id} className="font-medium">{addon.name}</Label>
            </div>
            <span className="font-semibold">+R{addon.price}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Choose Your Provider</h3>
        <p className="text-gray-600 text-sm">Select from verified professionals within 20km</p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id}
            className={`cursor-pointer transition-all ${
              formData.selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setFormData(prev => ({ ...prev, selectedProvider: provider }))}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
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
                      {provider.distance}km
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {provider.responseTime}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {provider.specializations.slice(0, 2).map(spec => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
          {pricing.materialsDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Materials Discount</span>
              <span>-R{pricing.materialsDiscount}</span>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <currentConfig.icon className="h-6 w-6" />
            <span>{currentConfig.title}</span>
          </DialogTitle>
          <DialogDescription>
            Complete your booking in {currentConfig.steps} simple steps - Step {step} of {currentConfig.steps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-6">
          {Array.from({ length: currentConfig.steps }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
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

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < currentConfig.steps ? (
            <Button 
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.propertyType || !formData.address)) ||
                (step === 2 && (!formData.preferredDate || !formData.timePreference)) ||
                (step === 4 && !formData.selectedProvider)
              }
            >
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