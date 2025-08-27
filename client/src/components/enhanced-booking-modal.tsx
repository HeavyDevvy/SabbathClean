import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, MapPin, CreditCard, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PaymentMethodSelector from "./payment-method-selector";
import { OverallRating } from "./star-rating";
import type { ServiceProvider } from "@shared/schema";

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  serviceCategory: string;
  hourlyRate: number;
}

export default function EnhancedBookingModal({
  isOpen,
  onClose,
  serviceName,
  serviceCategory,
  hourlyRate,
}: EnhancedBookingModalProps) {
  const [step, setStep] = useState(1); // 1: Service Details, 2: Provider Selection, 3: Payment & Confirmation
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 2,
    specialRequests: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const { toast } = useToast();

  // Get nearby providers when location is set
  const { data: nearbyProviders = [], isLoading: providersLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers/nearby", formData.latitude, formData.longitude, serviceCategory],
    enabled: !!formData.latitude && !!formData.longitude && step === 2,
    queryFn: async () => {
      const response = await fetch(
        `/api/providers/nearby?lat=${formData.latitude}&lng=${formData.longitude}&service=${serviceCategory}&radius=20`
      );
      if (!response.ok) throw new Error("Failed to fetch nearby providers");
      return response.json();
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProvider) throw new Error("No provider selected");
      
      const response = await apiRequest("POST", "/api/bookings", {
        customerId: "user-1", // In real app, get from auth
        providerId: selectedProvider.id,
        serviceName,
        serviceCategory,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        serviceAddress: formData.address,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        duration: formData.duration,
        totalAmount: (hourlyRate * formData.duration).toFixed(2),
        specialRequests: formData.specialRequests || null,
        paymentMethod: selectedPaymentMethod === "cash" ? "cash" : "card",
        status: "pending",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Confirmed!",
        description: `Your ${serviceName} service has been booked with ${selectedProvider?.firstName} ${selectedProvider?.lastName}.`,
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not available",
        description: "Please enter your address manually.",
      });
      return;
    }

    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Faster location
          timeout: 15000, // Longer timeout
          maximumAge: 600000, // 10 minutes cache
        });
      });

      setFormData(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));

      // Use free geocoding service for address lookup
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1&accept-language=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name,
            }));
          }
        }
      } catch (geocodeError) {
        // Silent fallback - use coordinates only
        setFormData(prev => ({
          ...prev,
          address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        }));
      }
    } catch (error: any) {
      // Only show error for permission denied, fail silently for others
      if (error.code === 1) { // PERMISSION_DENIED
        toast({
          title: "Location access needed",
          description: "Please allow location access or enter your address manually.",
        });
      }
      // For timeouts and other errors, fail silently
      console.warn("Location detection failed:", error.code);
    } finally {
      setLocationLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      scheduledDate: "",
      scheduledTime: "",
      duration: 2,
      specialRequests: "",
      latitude: null,
      longitude: null,
    });
    setSelectedPaymentMethod("");
    setSelectedProvider(null);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.customerName || !formData.customerEmail || !formData.address || !formData.scheduledDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedProvider) {
        toast({
          title: "Select Provider",
          description: "Please select a service provider.",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  const totalCost = hourlyRate * formData.duration;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Book {serviceName} Service</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`h-1 w-12 mx-2 ${
                    step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Service Details */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{serviceName}</span>
                  <Badge variant="secondary">R{hourlyRate}/hour</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-name">Full Name *</Label>
                    <Input
                      id="customer-name"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, customerName: e.target.value }))
                      }
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Email *</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, customerEmail: e.target.value }))
                      }
                      data-testid="input-customer-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, customerPhone: e.target.value }))
                    }
                    data-testid="input-customer-phone"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      data-testid="button-get-location"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {locationLoading ? "Getting Location..." : "Use Current Location"}
                    </Button>
                  </div>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Enter service address"
                    data-testid="input-address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="scheduled-date">Date *</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))
                      }
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-scheduled-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled-time">Time</Label>
                    <Input
                      id="scheduled-time"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))
                      }
                      data-testid="input-scheduled-time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="8"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))
                      }
                      data-testid="input-duration"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="special-requests">Special Requests</Label>
                  <Textarea
                    id="special-requests"
                    value={formData.specialRequests}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, specialRequests: e.target.value }))
                    }
                    placeholder="Any special instructions or requirements..."
                    data-testid="textarea-special-requests"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Provider Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Providers Nearby</CardTitle>
              </CardHeader>
              <CardContent>
                {providersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p>Finding providers near you...</p>
                  </div>
                ) : nearbyProviders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No providers available in your area.</p>
                    <p className="text-sm text-gray-400 mt-2">Try expanding your search radius or selecting a different time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nearbyProviders.map((provider) => (
                      <Card
                        key={provider.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedProvider?.id === provider.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        }`}
                        onClick={() => setSelectedProvider(provider)}
                        data-testid={`provider-card-${provider.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              {provider.profileImage ? (
                                <img
                                  src={provider.profileImage}
                                  alt={`${provider.firstName} ${provider.lastName}`}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {provider.firstName} {provider.lastName}
                              </h4>
                              <p className="text-sm text-gray-600 mb-1">{provider.bio}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <OverallRating
                                  rating={Number(provider.rating) || 0}
                                  reviewCount={provider.totalReviews || 0}
                                  size="sm"
                                />
                                <span>R{provider.hourlyRate}/hour</span>
                                {provider.isVerified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Payment & Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-medium">
                    {selectedProvider?.firstName} {selectedProvider?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">
                    {formData.scheduledDate} {formData.scheduledTime && `at ${formData.scheduledTime}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{formData.duration} hour{formData.duration !== 1 ? 's' : ''}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost:</span>
                  <span>R{totalCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <PaymentMethodSelector
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}
            />
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
          {step < 3 ? (
            <Button
              onClick={handleNext}
              className="flex-1"
              data-testid="button-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => createBookingMutation.mutate()}
              disabled={createBookingMutation.isPending || !selectedPaymentMethod}
              className="flex-1"
              data-testid="button-confirm-booking"
            >
              {createBookingMutation.isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}