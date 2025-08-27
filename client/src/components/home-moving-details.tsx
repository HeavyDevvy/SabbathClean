import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck, Package, Wrench, ArrowUpDown, Archive, Star, User, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OverallRating } from "./star-rating";
import type { ServiceProvider } from "@shared/schema";

interface HomeMovingDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (serviceDetails: any, selectedProvider: ServiceProvider) => void;
}

export default function HomeMovingDetails({
  isOpen,
  onClose,
  onProceedToBooking,
}: HomeMovingDetailsProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [step, setStep] = useState(1); // 1: Service Details, 2: Provider Selection

  const { toast } = useToast();

  const movingServices = [
    {
      id: "packing",
      name: "Professional Packing",
      description: "Complete packing service with quality materials",
      basePrice: 180,
      icon: Package,
    },
    {
      id: "furniture-assembly",
      name: "Furniture Disassembly/Assembly", 
      description: "Safe disassembly and reassembly of furniture",
      basePrice: 220,
      icon: Wrench,
    },
    {
      id: "loading-unloading",
      name: "Loading & Unloading",
      description: "Professional loading and unloading services",
      basePrice: 150,
      icon: ArrowUpDown,
    },
    {
      id: "transportation",
      name: "Transportation",
      description: "Secure transportation with insured vehicles",
      basePrice: 350,
      icon: Truck,
    },
    {
      id: "unpacking",
      name: "Unpacking Service",
      description: "Careful unpacking and item placement",
      basePrice: 160,
      icon: Package,
    },
    {
      id: "storage",
      name: "Temporary Storage",
      description: "Short-term storage solutions (per day)",
      basePrice: 50,
      icon: Archive,
    },
  ];

  // Get moving providers
  const { data: movingProviders = [], isLoading: providersLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers/service", "home-moving"],
    enabled: step === 2,
    queryFn: async () => {
      const response = await fetch("/api/providers/service/home-moving");
      if (!response.ok) throw new Error("Failed to fetch moving providers");
      return response.json();
    },
  });

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = movingServices.find(s => s.id === serviceId);
      return total + (service?.basePrice || 0);
    }, 0);
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedServices.length === 0) {
        toast({
          title: "Select Services",
          description: "Please select at least one moving service.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    }
  };

  const handleProceed = () => {
    if (!selectedProvider) {
      toast({
        title: "Select Provider",
        description: "Please select a moving provider.",
        variant: "destructive",
      });
      return;
    }

    const serviceDetails = {
      selectedServices,
      totalPrice: calculateTotalPrice(),
      serviceCategory: "home-moving",
    };

    onProceedToBooking(serviceDetails, selectedProvider);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Home Moving Services</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 2 && (
                <div
                  className={`h-1 w-12 mx-2 ${
                    step > stepNumber ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-4 text-sm text-gray-600">
            {step === 1 ? "Service Details" : "Select Provider"}
          </span>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Available Moving Services</h3>
              <p className="text-gray-600 mb-4">Select the services you need for your move</p>
              
              <div className="grid gap-4">
                {movingServices.map((service) => {
                  const IconComponent = service.icon;
                  const isSelected = selectedServices.includes(service.id);
                  
                  return (
                    <Card 
                      key={service.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "ring-2 ring-indigo-500 bg-indigo-50" 
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                      data-testid={`moving-service-${service.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleServiceToggle(service.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{service.name}</h4>
                                <p className="text-sm text-gray-600">{service.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">R{service.basePrice}/service</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {selectedServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedServices.map(serviceId => {
                      const service = movingServices.find(s => s.id === serviceId);
                      return (
                        <div key={serviceId} className="flex justify-between">
                          <span>{service?.name}</span>
                          <span>R{service?.basePrice}</span>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Estimate:</span>
                      <span>R{calculateTotalPrice()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Provider Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Available Moving Providers</h3>
              <p className="text-gray-600 mb-4">Choose a verified moving professional</p>
            </div>

            {providersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p>Finding moving providers...</p>
              </div>
            ) : movingProviders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No moving providers available at the moment.</p>
              </div>
            ) : (
              <RadioGroup 
                value={selectedProvider?.id || ""} 
                onValueChange={(value) => {
                  const provider = movingProviders.find(p => p.id === value);
                  setSelectedProvider(provider || null);
                }}
              >
                <div className="space-y-3">
                  {movingProviders.map((provider) => (
                    <Card
                      key={provider.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedProvider?.id === provider.id
                          ? "ring-2 ring-indigo-500 bg-indigo-50"
                          : ""
                      }`}
                      onClick={() => setSelectedProvider(provider)}
                      data-testid={`provider-card-${provider.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <RadioGroupItem value={provider.id} className="mt-2" />
                          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            {provider.profileImage ? (
                              <img
                                src={provider.profileImage}
                                alt={`${provider.firstName} ${provider.lastName}`}
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {provider.firstName} {provider.lastName}
                                </h4>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{provider.bio}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <OverallRating
                                    rating={Number(provider.rating) || 0}
                                    reviewCount={provider.totalReviews || 0}
                                    size="sm"
                                  />
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {provider.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {provider.experience}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-lg">R{provider.hourlyRate}/hour</div>
                                {provider.isVerified && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              data-testid="button-back"
            >
              Back
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          {step < 2 ? (
            <Button
              onClick={handleNext}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={selectedServices.length === 0}
              data-testid="button-next"
            >
              Continue to Providers
            </Button>
          ) : (
            <Button
              onClick={handleProceed}
              disabled={!selectedProvider}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              data-testid="button-proceed-booking"
            >
              Proceed to Booking
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}