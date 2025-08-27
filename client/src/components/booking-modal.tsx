import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddressInput from "@/components/address-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { X, Home, Sparkles, Star, Navigation, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Service, ServiceProvider } from "@shared/schema";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: string;
  selectedProvider?: string;
}

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  propertySize: z.string().min(1, "Please select property size"),
  bathrooms: z.string().min(1, "Please select number of bathrooms"),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingModal({ isOpen, onClose, selectedService, selectedProvider: providerId }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  const { toast } = useToast();

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isOpen,
  });

  const { data: providers } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers"],
    enabled: isOpen && currentStep === 4,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: selectedService || "",
      propertySize: "",
      bathrooms: "",
      address: "",
      scheduledDate: "",
      scheduledTime: "",
      specialInstructions: "",
      providerId: providerId || "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "You will receive a confirmation email shortly.",
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
    setCurrentStep(1);
    setSelectedProvider("");
    form.reset({
      serviceId: selectedService || "",
      propertySize: "",
      bathrooms: "",
      address: "",
      scheduledDate: "",
      scheduledTime: "",
      specialInstructions: "",
      providerId: providerId || "",
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (data: BookingFormData) => {
    const bookingData = {
      ...data,
      customerId: "temp-customer-id", // In real app, get from auth
      bathrooms: parseInt(data.bathrooms),
      duration: 3, // Default 3 hours
      totalPrice: selectedServiceData ? (parseFloat(selectedServiceData.basePrice) * 3).toFixed(2) : "1350.00",
      status: "pending",
    };
    
    createBookingMutation.mutate(bookingData);
  };

  const selectedServiceData = services?.find(s => s.id === form.watch("serviceId"));
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-booking">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book Your Service</span>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step {currentStep} of 4</span>
            <span className="text-sm text-neutral">Estimated completion: 2 minutes</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6" data-testid="step-service-selection">
              <h3 className="text-xl font-semibold text-gray-900">Select Your Service</h3>
              <RadioGroup 
                value={form.watch("serviceId")} 
                onValueChange={(value) => form.setValue("serviceId", value)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {services?.map((service) => (
                  <div key={service.id}>
                    <RadioGroupItem value={service.id} id={service.id} className="sr-only" />
                    <Label 
                      htmlFor={service.id}
                      className="cursor-pointer block border-2 border-gray-200 rounded-xl p-6 hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-blue-50 transition-all duration-200"
                      data-testid={`radio-service-${service.id}`}
                    >
                      <div className="flex items-center">
                        {service.category === "house-cleaning" && <Home className="text-primary h-6 w-6 mr-4" />}
                        {service.category === "deep-cleaning" && <Sparkles className="text-primary h-6 w-6 mr-4" />}
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-neutral">{service.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={!form.watch("serviceId")}
                data-testid="button-step1-continue"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="space-y-6" data-testid="step-property-details">
              <h3 className="text-xl font-semibold text-gray-900">Property Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="propertySize">Property Size</Label>
                  <Select onValueChange={(value) => form.setValue("propertySize", value)}>
                    <SelectTrigger data-testid="select-property-size">
                      <SelectValue placeholder="Select property size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2-bedrooms">1-2 Bedrooms</SelectItem>
                      <SelectItem value="3-4-bedrooms">3-4 Bedrooms</SelectItem>
                      <SelectItem value="5+-bedrooms">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                  <Select onValueChange={(value) => form.setValue("bathrooms", value)}>
                    <SelectTrigger data-testid="select-bathrooms">
                      <SelectValue placeholder="Select bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="3">3+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Location</Label>
                  <AddressInput
                    value={form.watch("address") || ""}
                    onChange={(address) => form.setValue("address", address)}
                    placeholder="Enter your address"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={previousStep} data-testid="button-step2-back">
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!form.watch("propertySize") || !form.watch("bathrooms") || !form.watch("address")}
                  data-testid="button-step2-continue"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-6" data-testid="step-schedule">
              <h3 className="text-xl font-semibold text-gray-900">Select Date & Time</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="scheduledDate">Preferred Date</Label>
                  <Input 
                    {...form.register("scheduledDate")}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="input-date"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Preferred Time</Label>
                  <Select onValueChange={(value) => form.setValue("scheduledTime", value)}>
                    <SelectTrigger data-testid="select-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:00-11:00">8:00 AM - 11:00 AM</SelectItem>
                      <SelectItem value="11:00-14:00">11:00 AM - 2:00 PM</SelectItem>
                      <SelectItem value="14:00-17:00">2:00 PM - 5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea 
                  {...form.register("specialInstructions")}
                  placeholder="Any specific requirements or areas of focus..."
                  data-testid="textarea-instructions"
                />
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={previousStep} data-testid="button-step3-back">
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!form.watch("scheduledDate") || !form.watch("scheduledTime")}
                  data-testid="button-step3-continue"
                >
                  Find Professionals
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Provider Selection */}
          {currentStep === 4 && (
            <div className="space-y-6" data-testid="step-provider-selection">
              <h3 className="text-xl font-semibold text-gray-900">Choose Your Professional</h3>
              <div className="space-y-4">
                {providers?.slice(0, 3).map((provider) => (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-colors duration-200 ${
                      selectedProvider === provider.id ? "border-primary bg-blue-50" : "border-gray-200 hover:border-primary"
                    }`}
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      form.setValue("providerId", provider.id);
                    }}
                    data-testid={`card-provider-${provider.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img 
                            src={provider.profileImage || "https://images.unsplash.com/photo-1494790108755-2616b612b588?w=300"} 
                            alt="Professional service provider"
                            className="w-12 h-12 rounded-full object-cover mr-4" 
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">Provider {provider.id.slice(-1)}</h4>
                            <div className="flex items-center text-sm text-neutral">
                              <Star className="h-3 w-3 text-accent fill-current mr-1" />
                              <span>{provider.rating} ({provider.totalReviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">R{provider.hourlyRate}/hour</div>
                          <div className="text-sm text-secondary">Available today</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Booking Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral">Service:</span>
                      <span className="font-medium">{selectedServiceData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral">Estimated Duration:</span>
                      <span className="font-medium">3 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral">Rate:</span>
                      <span className="font-medium">R{selectedServiceData?.basePrice}/hour</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">R{selectedServiceData ? (parseFloat(selectedServiceData.basePrice) * 3).toLocaleString() : '1,350'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={previousStep} data-testid="button-step4-back">
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={!selectedProvider || createBookingMutation.isPending}
                  className="bg-secondary hover:bg-green-700"
                  data-testid="button-confirm-booking"
                >
                  {createBookingMutation.isPending ? "Confirming..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
