import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddressInput from "@/components/address-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Service, ServiceProvider } from "@shared/schema";

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
  cuisineType: z.string().min(1, "Please select cuisine type"),
  numberOfPeople: z.string().min(1, "Please enter number of people"),
  dietaryRequirements: z.string().optional(),
  menuPreferences: z.string().optional(),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

const gardeningSchema = z.object({
  serviceId: z.string(),
  gardenSize: z.string().min(1, "Please select garden size"),
  serviceNeeded: z.string().min(1, "Please select service needed"),
  gardenType: z.string().min(1, "Please select garden type"),
  equipmentProvided: z.string().min(1, "Please specify equipment"),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

export default function ServiceSpecificBooking({ isOpen, onClose, serviceId }: ServiceSpecificBookingProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const { toast } = useToast();

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isOpen,
  });

  const { data: providers } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers"],
    enabled: isOpen,
  });

  const service = services?.find(s => s.id === serviceId || s.category === serviceId);
  const relevantProviders = providers?.filter(p => 
    p.servicesOffered.includes(serviceId) || 
    p.servicesOffered.includes(service?.category || "")
  );

  // Determine which schema to use based on service type
  const getFormSchema = () => {
    if (!service) return cleaningSchema;
    
    if (service.category.includes('cleaning')) return cleaningSchema;
    if (service.category.includes('plumbing') || service.category.includes('electrical')) return maintenanceSchema;
    if (service.category.includes('chef') || service.category.includes('waitering')) return cateringSchema;
    if (service.category.includes('gardening')) return gardeningSchema;
    
    return cleaningSchema;
  };

  const form = useForm({
    defaultValues: {
      serviceId: serviceId,
      providerId: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Your service has been booked successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createBookingMutation.mutate({
      ...data,
      providerId: selectedProvider,
      totalAmount: parseFloat(service?.basePrice || "0"),
      status: "pending",
    });
  };

  const renderServiceSpecificFields = () => {
    if (!service) return null;

    // Cleaning Services
    if (service.category.includes('cleaning')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertySize">Property Size</Label>
              <Select onValueChange={(value) => form.setValue("propertySize" as any, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (1-2 bedrooms)</SelectItem>
                  <SelectItem value="medium">Medium (3-4 bedrooms)</SelectItem>
                  <SelectItem value="large">Large (5+ bedrooms)</SelectItem>
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
                  <SelectItem value="4+">4+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="cleaningType">Cleaning Type</Label>
            <Select onValueChange={(value) => form.setValue("cleaningType" as any, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cleaning type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Cleaning</SelectItem>
                <SelectItem value="deep">Deep Cleaning</SelectItem>
                <SelectItem value="move-in">Move-in Cleaning</SelectItem>
                <SelectItem value="move-out">Move-out Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );
    }

    // Maintenance & Repairs
    if (service.category.includes('plumbing') || service.category.includes('electrical')) {
      return (
        <>
          <div>
            <Label htmlFor="problemDescription">Problem Description</Label>
            <Textarea 
              placeholder="Please describe the issue you're experiencing..."
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
                  <SelectItem value="medium">Medium - Need this week</SelectItem>
                  <SelectItem value="high">High - Need within 24 hours</SelectItem>
                  <SelectItem value="emergency">Emergency - ASAP</SelectItem>
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
        </>
      );
    }

    // Food & Event Services
    if (service.category.includes('chef') || service.category.includes('waitering')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select onValueChange={(value) => form.setValue("eventType" as any, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday Party</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="dinner-party">Dinner Party</SelectItem>
                  <SelectItem value="family-gathering">Family Gathering</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numberOfPeople">Number of People</Label>
              <Input 
                type="number"
                placeholder="e.g. 10"
                {...form.register("numberOfPeople" as any)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cuisineType">Cuisine Type</Label>
            <Select onValueChange={(value) => form.setValue("cuisineType" as any, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="south-african">South African</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
                <SelectItem value="continental">Continental</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dietaryRequirements">Dietary Requirements</Label>
            <Textarea 
              placeholder="Any allergies, special diets, or dietary restrictions..."
              {...form.register("dietaryRequirements" as any)}
            />
          </div>
          <div>
            <Label htmlFor="menuPreferences">Menu Preferences</Label>
            <Textarea 
              placeholder="Any specific dishes or menu requests..."
              {...form.register("menuPreferences" as any)}
            />
          </div>
        </>
      );
    }

    // Garden Care
    if (service.category.includes('gardening')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gardenSize">Garden Size</Label>
              <Select onValueChange={(value) => form.setValue("gardenSize" as any, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select garden size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (under 100m²)</SelectItem>
                  <SelectItem value="medium">Medium (100-500m²)</SelectItem>
                  <SelectItem value="large">Large (over 500m²)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="serviceNeeded">Service Needed</Label>
              <Select onValueChange={(value) => form.setValue("serviceNeeded" as any, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lawn-mowing">Lawn Mowing</SelectItem>
                  <SelectItem value="pruning">Pruning & Trimming</SelectItem>
                  <SelectItem value="weeding">Weeding</SelectItem>
                  <SelectItem value="planting">Planting</SelectItem>
                  <SelectItem value="maintenance">General Maintenance</SelectItem>
                  <SelectItem value="design">Landscape Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gardenType">Garden Type</Label>
              <Select onValueChange={(value) => form.setValue("gardenType" as any, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select garden type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flower">Flower Garden</SelectItem>
                  <SelectItem value="vegetable">Vegetable Garden</SelectItem>
                  <SelectItem value="lawn">Lawn Only</SelectItem>
                  <SelectItem value="mixed">Mixed Garden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="equipmentProvided">Equipment</Label>
              <Select onValueChange={(value) => form.setValue("equipmentProvided" as any, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Equipment provided" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="provider">Provider brings equipment</SelectItem>
                  <SelectItem value="client">I have my own equipment</SelectItem>
                  <SelectItem value="shared">Mix of both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Book {service?.name}
          </DialogTitle>
        </DialogHeader>

        {service && (
          <div className="space-y-6">
            {/* Service Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">{service.category}</Badge>
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <p className="text-gray-600 mt-2">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">R{service.basePrice}</p>
                    <p className="text-sm text-gray-500">per hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Service-Specific Fields */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h4 className="font-semibold text-lg">Service Details</h4>
                  {renderServiceSpecificFields()}
                </CardContent>
              </Card>

              {/* Address & Scheduling */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h4 className="font-semibold text-lg">Address & Scheduling</h4>
                  <div>
                    <Label htmlFor="address">Service Address</Label>
                    <AddressInput
                      value={form.watch("address" as any) || ""}
                      onChange={(address) => form.setValue("address" as any, address)}
                      placeholder="Enter full address where service is needed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduledDate">Preferred Date</Label>
                      <Input 
                        type="date"
                        {...form.register("scheduledDate" as any)}
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
                </CardContent>
              </Card>

              {/* Provider Selection */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4">Select Your Provider</h4>
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
                              src={provider.profileImage || ""} 
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
                              <p className="text-sm font-medium text-primary mt-2">R{provider.hourlyRate}/hour</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBookingMutation.isPending || !selectedProvider}
                  className="min-w-[120px]"
                >
                  {createBookingMutation.isPending ? "Booking..." : "Book Service"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}