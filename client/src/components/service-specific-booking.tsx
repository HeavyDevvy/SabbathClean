import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddressInput from "@/components/address-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Star, ChefHat, ShoppingCart, Utensils, Plus, Minus, CreditCard, Building, Banknote, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Service, ServiceProvider } from "@shared/schema";
import HomeMovingDetails from "./home-moving-details";
import EnhancedChefBooking from "./enhanced-chef-booking";

interface ServiceSpecificBookingProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
}

// Service-specific form schemas
const cleaningSchema = z.object({
  serviceId: z.string(),
  propertySize: z.string().min(1, "Please select property size"),
  bathrooms: z.string().min(1, "Please select number of bathrooms"),
  cleaningType: z.string().min(1, "Please select cleaning type"),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

const maintenanceSchema = z.object({
  serviceId: z.string(),
  problemDescription: z.string().min(1, "Please describe the problem"),
  urgency: z.string().min(1, "Please select urgency level"),
  propertyType: z.string().min(1, "Please select property type"),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

const cateringSchema = z.object({
  serviceId: z.string(),
  eventType: z.string().min(1, "Please select event type"),
  guests: z.string().min(1, "Please enter number of guests"),
  cuisineType: z.string().optional(),
  selectedMenu: z.string().optional(),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

const gardenSchema = z.object({
  serviceId: z.string(),
  gardenSize: z.string().min(1, "Please select garden size"),
  serviceType: z.string().min(1, "Please select service type"),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

type BookingFormData = z.infer<typeof cleaningSchema | typeof maintenanceSchema | typeof cateringSchema | typeof gardenSchema>;

export default function ServiceSpecificBooking({ isOpen, onClose, serviceId }: ServiceSpecificBookingProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedMovingProvider, setSelectedMovingProvider] = useState<ServiceProvider | null>(null);
  const [movingServiceDetails, setMovingServiceDetails] = useState<any>(null);
  const [showMovingDetails, setShowMovingDetails] = useState(false);
  const [showEnhancedChefBooking, setShowEnhancedChefBooking] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [menuType, setMenuType] = useState<"popular" | "custom">("popular");
  const [customMenuItems, setCustomMenuItems] = useState<string[]>([""]);
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "card",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const { toast } = useToast();

  // Reset form when service changes
  useEffect(() => {
    if (isOpen) {
      setSelectedProvider("");
      setSelectedMovingProvider(null);
      setMovingServiceDetails(null);
      setSelectedCuisine("");
      setMenuType("popular");
      setCustomMenuItems([""]);
      setPaymentDetails({
        paymentMethod: "card",
        cardNumber: "",
        cardholderName: "",
        expiryDate: "",
        cvv: "",
      });
    }
  }, [serviceId, isOpen]);

  // Schema selector based on service
  const getSchema = () => {
    switch (serviceId) {
      case "house-cleaning":
        return cleaningSchema;
      case "plumbing":
      case "electrical":
        return maintenanceSchema;
      case "chef-catering":
        return cateringSchema;
      case "garden-care":
        return gardenSchema;
      default:
        return cleaningSchema;
    }
  };

  // Fetch service data
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isOpen,
  });

  // Fetch providers based on service
  const { data: allProviders } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers"],
    enabled: isOpen,
  });

  const currentService = services?.find(s => s.id === serviceId);
  const relevantProviders = allProviders?.filter(p => 
    p.servicesOffered.includes(serviceId) || p.servicesOffered.includes(currentService?.name || "")
  );

  const nearbyProviders = relevantProviders || [];

  const form = useForm<BookingFormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      serviceId: serviceId || "",
      address: "",
      scheduledDate: "",
      scheduledTime: "",
      specialInstructions: "",
      providerId: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate payment processing
      if (paymentDetails.paymentMethod === "card") {
        // Validate card details
        if (!paymentDetails.cardNumber || !paymentDetails.cardholderName || !paymentDetails.expiryDate || !paymentDetails.cvv) {
          throw new Error("Please complete all card details");
        }
      }

      const bookingData = {
        ...data,
        providerId: selectedProvider === "hold" ? null : selectedProvider,
        paymentMethod: paymentDetails.paymentMethod,
        totalAmount: parseFloat(calculateTotalPrice()) + 15,
        status: selectedProvider === "hold" ? "pending_assignment" : "confirmed",
      };

      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: selectedProvider === "hold" 
          ? "We'll find the best provider for you within 24 hours."
          : "You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    form.reset();
    setSelectedProvider("");
    setSelectedMovingProvider(null);
    setMovingServiceDetails(null);
    setSelectedCuisine("");
    setMenuType("popular");
    setCustomMenuItems([""]);
    setPaymentDetails({
      paymentMethod: "card",
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      cvv: "",
    });
  };

  const onSubmit = (data: BookingFormData) => {
    // Generate quote instead of immediate booking
    generateQuote(data);
  };

  const generateQuote = (data: BookingFormData) => {
    const provider = selectedMovingProvider || nearbyProviders.find(p => p.id === selectedProvider) || nearbyProviders[0];
    
    // Prepare quote parameters
    const quoteParams = new URLSearchParams({
      service: currentService?.name || "Service",
      category: serviceId || "",
      date: data.scheduledDate || "",
      time: data.scheduledTime || "",
      location: data.address || "",
      customerName: (data as any).customerName || "",
      customerEmail: (data as any).customerEmail || "",
      customerPhone: (data as any).customerPhone || "",
      baseRate: calculateTotalPrice(),
      duration: serviceId === "waitering" ? `${(data as any).duration || 4} hours` : "2-3 hours",
      // Add service-specific details
      propertySize: (data as any).propertySize || "",
      specialRequests: data.specialInstructions || "",
      frequency: (data as any).frequency || "One-time",
      guestCount: (data as any).guestCount || (data as any).guests || "",
      eventType: (data as any).eventType || "",
      cuisineType: selectedCuisine || "",
      menuType: menuType || ""
    });

    // Close modal and redirect to quote page
    onClose();
    window.location.href = `/quote?${quoteParams.toString()}`;
  };

  const calculateTotalPrice = () => {
    if (movingServiceDetails) {
      return movingServiceDetails.totalPrice;
    }
    
    // Service-specific pricing logic
    switch (serviceId) {
      case "house-cleaning":
        const formValues = form.getValues();
        const propertySize = (formValues as any).propertySize || "100";
        const bathrooms = (formValues as any).bathrooms || "1";
        return (parseInt(propertySize) * 50 + parseInt(bathrooms) * 25).toString();
      case "chef-catering":
        const cateringValues = form.getValues();
        const guests = (cateringValues as any).guests || "1";
        return (parseInt(guests) * 150).toString();
      case "waitering":
        const waiteringValues = form.getValues();
        const guestCount = parseInt((waiteringValues as any).guestCount || "10");
        const duration = parseInt((waiteringValues as any).duration || "4");
        const eventType = (waiteringValues as any).eventType || "private-dinner";
        
        // Base rate per hour (competitive with Sweep South)
        let baseRate = 180;
        
        // Event type multipliers (larger events need more coordination)
        const eventMultipliers = {
          "private-dinner": 1.0,
          "cocktail-party": 1.2,
          "birthday": 1.1,
          "anniversary": 1.1,
          "corporate": 1.4,
          "wedding": 1.6
        };
        
        // Guest count multipliers (more guests = more work)
        let guestMultiplier = 1.0;
        if (guestCount > 50) guestMultiplier = 1.5;
        else if (guestCount > 30) guestMultiplier = 1.3;
        else if (guestCount > 20) guestMultiplier = 1.2;
        else if (guestCount > 10) guestMultiplier = 1.1;
        
        // Duration discount for longer events
        let durationMultiplier = 1.0;
        if (duration >= 8) durationMultiplier = 0.9; // 10% discount for full day
        else if (duration >= 6) durationMultiplier = 0.95; // 5% discount
        
        const totalRate = baseRate * (eventMultipliers[eventType as keyof typeof eventMultipliers] || 1.0) * guestMultiplier * durationMultiplier * duration;
        return Math.round(totalRate).toString();
      case "plumbing":
      case "electrical":
        return "200";
      case "garden-care":
        return "150";
      default:
        return "100";
    }
  };

  const handleMovingBookingProceed = (serviceDetails: any, provider: ServiceProvider) => {
    setMovingServiceDetails(serviceDetails);
    setSelectedMovingProvider(provider);
    setShowMovingDetails(false);
  };

  if (serviceId === "home-moving" && showMovingDetails) {
    return (
      <HomeMovingDetails
        isOpen={showMovingDetails}
        onClose={() => setShowMovingDetails(false)}
        onProceedToBooking={handleMovingBookingProceed}
      />
    );
  }

  if (serviceId === "chef-catering" && showEnhancedChefBooking) {
    return (
      <EnhancedChefBooking
        form={form}
        onNext={() => setShowEnhancedChefBooking(false)}
        onBack={() => setShowEnhancedChefBooking(false)}
      />
    );
  }

  const cuisineTypes = {
    "south-african": { name: "South African", description: "Traditional SA cuisine" },
    "east-african": { name: "East African", description: "Ethiopian, Kenyan flavors" },
    "west-african": { name: "West African", description: "Nigerian, Ghanaian dishes" },
    "italian": { name: "Italian", description: "Classic Italian cuisine" },
    "mediterranean": { name: "Mediterranean", description: "Fresh Mediterranean flavors" },
    "asian": { name: "Asian Fusion", description: "Modern Asian dishes" },
    "indian": { name: "Indian", description: "Authentic Indian spices" },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {serviceId === "chef-catering" && <ChefHat className="h-5 w-5" />}
            {serviceId === "house-cleaning" && <div className="h-5 w-5">🧹</div>}
            {serviceId === "plumbing" && <div className="h-5 w-5">🔧</div>}
            {serviceId === "electrical" && <div className="h-5 w-5">⚡</div>}
            {serviceId === "garden-care" && <div className="h-5 w-5">🌱</div>}
            Book {currentService?.name || "Service"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to book your service
          </DialogDescription>
        </DialogHeader>

        {/* Show enhanced chef booking button for chef service */}
        {serviceId === "chef-catering" && (
          <div className="mb-4">
            <Button 
              onClick={() => setShowEnhancedChefBooking(true)}
              variant="outline" 
              className="w-full"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Use Enhanced Chef Booking Experience
            </Button>
          </div>
        )}

        {/* Show moving details button for moving service */}
        {serviceId === "home-moving" && !movingServiceDetails && (
          <div className="mb-4">
            <Button 
              onClick={() => setShowMovingDetails(true)}
              className="w-full"
            >
              Configure Moving Services
            </Button>
          </div>
        )}

        {/* Regular booking form */}
        {(serviceId !== "home-moving" || movingServiceDetails) && (
          <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Service Specific Fields */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4">Service Details</h4>
                  
                  {/* House Cleaning specific fields */}
                  {serviceId === "house-cleaning" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propertySize">Property Size (sqm)</Label>
                        <Select onValueChange={(value) => form.setValue("propertySize" as any, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50-100 sqm</SelectItem>
                            <SelectItem value="100">100-200 sqm</SelectItem>
                            <SelectItem value="200">200-300 sqm</SelectItem>
                            <SelectItem value="300">300+ sqm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                        <Select onValueChange={(value) => form.setValue("bathrooms" as any, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bathrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Bathroom</SelectItem>
                            <SelectItem value="2">2 Bathrooms</SelectItem>
                            <SelectItem value="3">3 Bathrooms</SelectItem>
                            <SelectItem value="4">4+ Bathrooms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="cleaningType">Cleaning Type</Label>
                        <Select onValueChange={(value) => form.setValue("cleaningType" as any, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cleaning type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular Cleaning</SelectItem>
                            <SelectItem value="deep">Deep Cleaning</SelectItem>
                            <SelectItem value="move-out">Move-out Cleaning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Maintenance specific fields */}
                  {(serviceId === "plumbing" || serviceId === "electrical") && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="problemDescription">Problem Description</Label>
                        <Textarea 
                          placeholder="Describe the issue you're experiencing..."
                          {...form.register("problemDescription" as any)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="urgency">Urgency Level</Label>
                          <Select onValueChange={(value) => form.setValue("urgency" as any, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - Can wait a few days</SelectItem>
                              <SelectItem value="medium">Medium - Within 24 hours</SelectItem>
                              <SelectItem value="high">High - Same day needed</SelectItem>
                              <SelectItem value="emergency">Emergency - Immediate attention</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="propertyType">Property Type</Label>
                          <Select onValueChange={(value) => form.setValue("propertyType" as any, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chef & Catering specific fields */}
                  {serviceId === "chef-catering" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="eventType">Event Type</Label>
                          <Select onValueChange={(value) => form.setValue("eventType" as any, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dinner">Dinner Party</SelectItem>
                              <SelectItem value="birthday">Birthday Party</SelectItem>
                              <SelectItem value="corporate">Corporate Event</SelectItem>
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="guests">Number of Guests</Label>
                          <Input 
                            type="number" 
                            placeholder="e.g., 10"
                            {...form.register("guests" as any)}
                          />
                        </div>
                      </div>
                      
                      {/* Cuisine Selection */}
                      <div>
                        <Label htmlFor="cuisineType">Cuisine Preference (Optional)</Label>
                        <Select 
                          onValueChange={(value) => {
                            setSelectedCuisine(value);
                            form.setValue("cuisineType" as any, value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cuisine preference" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(cuisineTypes).map(([key, cuisine]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center">
                                  <ChefHat className="h-4 w-4 mr-2" />
                                  {cuisine.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Waitering specific fields */}
                  {serviceId === "waitering" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="eventType">Event Type</Label>
                          <Select onValueChange={(value) => form.setValue("eventType" as any, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private-dinner">Private Dinner (1-10 guests)</SelectItem>
                              <SelectItem value="cocktail-party">Cocktail Party (10-30 guests)</SelectItem>
                              <SelectItem value="wedding">Wedding (50+ guests)</SelectItem>
                              <SelectItem value="corporate">Corporate Event (20-100 guests)</SelectItem>
                              <SelectItem value="birthday">Birthday Party (10-50 guests)</SelectItem>
                              <SelectItem value="anniversary">Anniversary (10-30 guests)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="guestCount">Number of Guests</Label>
                          <Input 
                            type="number" 
                            placeholder="e.g., 20"
                            {...form.register("guestCount" as any)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration">Event Duration (Hours)</Label>
                          <Select onValueChange={(value) => form.setValue("duration" as any, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 Hours</SelectItem>
                              <SelectItem value="3">3 Hours</SelectItem>
                              <SelectItem value="4">4 Hours</SelectItem>
                              <SelectItem value="5">5 Hours</SelectItem>
                              <SelectItem value="6">6 Hours</SelectItem>
                              <SelectItem value="8">8 Hours (Full Day)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="serviceStyle">Service Style</Label>
                          <Select onValueChange={(value) => form.setValue("serviceStyle" as any, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="casual">Casual Service</SelectItem>
                              <SelectItem value="formal">Formal Table Service</SelectItem>
                              <SelectItem value="buffet">Buffet Service</SelectItem>
                              <SelectItem value="cocktail">Cocktail Service & Bar</SelectItem>
                              <SelectItem value="fine-dining">Fine Dining Experience</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="additionalServices">Additional Services (Optional)</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Bar Service & Mixology</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Event Setup & Breakdown</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Wine Pairing Expertise</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Table Coordination</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Garden Care specific fields */}
                  {serviceId === "garden-care" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gardenSize">Garden Size</Label>
                        <Select onValueChange={(value) => form.setValue("gardenSize" as any, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select garden size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (0-100 sqm)</SelectItem>
                            <SelectItem value="medium">Medium (100-500 sqm)</SelectItem>
                            <SelectItem value="large">Large (500+ sqm)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select onValueChange={(value) => form.setValue("serviceType" as any, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maintenance">Garden Maintenance</SelectItem>
                            <SelectItem value="landscaping">Landscaping</SelectItem>
                            <SelectItem value="lawn">Lawn Care</SelectItem>
                            <SelectItem value="trimming">Tree Trimming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address and Schedule */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4">Address & Schedule</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Service Address</Label>
                      <AddressInput
                        value={form.watch("address")}
                        onChange={(value) => form.setValue("address", value)}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scheduledDate">Preferred Date</Label>
                        <Input 
                          type="date" 
                          {...form.register("scheduledDate")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduledTime">Preferred Time</Label>
                        <Select onValueChange={(value) => form.setValue("scheduledTime" as any, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                            <SelectItem value="17:00">5:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Selection */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Select Your Provider</h4>
                    {serviceId === "chef-catering" && selectedCuisine && (
                      <Badge variant="secondary" className="ml-2">
                        <ChefHat className="h-3 w-3 mr-1" />
                        {cuisineTypes[selectedCuisine as keyof typeof cuisineTypes]?.name} Specialists
                      </Badge>
                    )}
                  </div>
                  
                  {movingServiceDetails && selectedMovingProvider ? (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800">Selected Moving Provider:</h5>
                      <p className="text-green-700">{selectedMovingProvider.firstName} {selectedMovingProvider.lastName}</p>
                      <p className="text-sm text-green-600">Total Services: {movingServiceDetails.selectedServices.join(', ')}</p>
                      <p className="text-sm text-green-600">Total Cost: R{movingServiceDetails.totalPrice}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Holding Option */}
                      <Card 
                        className={`cursor-pointer transition-all ${
                          selectedProvider === "hold" 
                            ? 'ring-2 ring-orange-500 bg-orange-50' 
                            : 'hover:shadow-lg border-orange-200'
                        }`}
                        onClick={() => setSelectedProvider("hold")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                              <Clock className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-orange-800">Please hold while we find providers</h5>
                              <p className="text-sm text-orange-600 mt-1">
                                We'll match you with the best available provider in your area within 24 hours.
                              </p>
                              <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-800">
                                Auto-Assignment Available
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Available Providers */}
                      {relevantProviders && relevantProviders.length > 0 && (
                        <>
                          <div className="text-center">
                            <span className="text-sm text-gray-500">Or choose from available providers now:</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relevantProviders?.map((provider) => (
                            <Card 
                              key={provider.id} 
                              className={`cursor-pointer transition-all ${
                                selectedProvider === provider.id 
                                  ? 'ring-2 ring-primary bg-primary/5' 
                                  : 'hover:shadow-lg'
                              }`}
                              onClick={() => setSelectedProvider(provider.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                  <img 
                                    src={provider.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
                                    alt={`${provider.firstName} ${provider.lastName}`}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-semibold">{provider.firstName} {provider.lastName}</h5>
                                    <div className="flex items-center space-x-1 mt-1">
                                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                      <span className="text-sm">{provider.rating}</span>
                                      <span className="text-sm text-gray-500">({provider.totalReviews} reviews)</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{provider.bio}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-sm font-medium text-primary">R{provider.hourlyRate}/hour</p>
                                      <Badge variant="outline" className="text-xs">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Nearby
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Special Instructions */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4">Additional Information</h4>
                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea 
                      placeholder="Any special requests or additional information..."
                      {...form.register("specialInstructions" as any)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              {(selectedProvider || selectedMovingProvider) && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-lg mb-4">Payment Information</h4>
                    
                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                      <div>
                        <Label>Choose Payment Method</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <button
                            type="button"
                            className={`p-4 border rounded-lg transition-all ${
                              paymentDetails.paymentMethod === "card" 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setPaymentDetails(prev => ({...prev, paymentMethod: "card"}))}
                          >
                            <div className="text-center">
                              <CreditCard className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-sm">Credit Card</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            className={`p-4 border rounded-lg transition-all ${
                              paymentDetails.paymentMethod === "bank_transfer" 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setPaymentDetails(prev => ({...prev, paymentMethod: "bank_transfer"}))}
                          >
                            <div className="text-center">
                              <Building className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-sm">Bank Transfer</span>
                            </div>
                          </button>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800">
                            <strong>Secure Payment:</strong> All payments go through Berry Events for your protection. 
                            Funds are distributed to service providers after successful completion.
                          </p>
                        </div>
                      </div>

                      {/* Card Details - Only show if card is selected */}
                      {paymentDetails.paymentMethod === "card" && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cardNumber">Card Number *</Label>
                              <Input 
                                placeholder="1234 5678 9012 3456"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => setPaymentDetails(prev => ({
                                  ...prev, 
                                  cardNumber: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
                                }))}
                                maxLength={19}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cardholderName">Cardholder Name *</Label>
                              <Input 
                                placeholder="John Doe"
                                value={paymentDetails.cardholderName}
                                onChange={(e) => setPaymentDetails(prev => ({...prev, cardholderName: e.target.value}))}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">Expiry Date *</Label>
                              <Input 
                                placeholder="MM/YY"
                                value={paymentDetails.expiryDate}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length >= 2) {
                                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                  }
                                  setPaymentDetails(prev => ({...prev, expiryDate: value}));
                                }}
                                maxLength={5}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV *</Label>
                              <Input 
                                placeholder="123"
                                type="password"
                                value={paymentDetails.cvv}
                                onChange={(e) => setPaymentDetails(prev => ({
                                  ...prev, 
                                  cvv: e.target.value.replace(/\D/g, '').substring(0, 3)
                                }))}
                                maxLength={3}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Info */}
                      {paymentDetails.paymentMethod === "bank_transfer" && (
                        <div className="border-t pt-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-semibold text-blue-900 mb-2">Bank Transfer Details</h5>
                            <p className="text-sm text-blue-800">
                              You will receive bank transfer details after booking confirmation. 
                              Service will begin once payment is verified.
                            </p>
                          </div>
                        </div>
                      )}



                      {/* Price Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-2">Payment Summary</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Service Total:</span>
                            <span>R{calculateTotalPrice()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee:</span>
                            <span>R15</span>
                          </div>
                          <div className="border-t border-blue-300 mt-2 pt-2">
                            <div className="flex justify-between font-semibold">
                              <span>Total Amount:</span>
                              <span>R{(parseFloat(calculateTotalPrice()) + 15).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Status - Only show positive feedback */}
              {nearbyProviders.length > 0 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <MapPin className="h-4 w-4" />
                  <span>Showing top providers near you</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBookingMutation.isPending || (!selectedProvider && !selectedMovingProvider)}
                  className="min-w-[120px]"
                >
                  {createBookingMutation.isPending ? "Generating Quote..." : "Get Quote"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}