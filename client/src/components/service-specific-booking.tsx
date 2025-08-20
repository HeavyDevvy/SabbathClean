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
import { Calendar, Clock, MapPin, User, Star, ChefHat, ShoppingCart, Utensils, Plus, Minus } from "lucide-react";
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
  cuisineType: z.string().min(1, "Please select cuisine type"),
  menuType: z.enum(["popular", "custom"]).default("popular"),
  selectedMenu: z.string().optional(),
  customMenuItems: z.array(z.string()).optional(),
  ingredientOption: z.enum(["chef-brings", "customer-provides"]).default("chef-brings"),
  utensilsOption: z.enum(["chef-brings", "customer-provides"]).default("chef-brings"),
  numberOfPeople: z.string().min(1, "Please enter number of people"),
  dietaryRequirements: z.string().optional(),
  address: z.string().min(1, "Please enter your address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  specialInstructions: z.string().optional(),
  providerId: z.string().min(1, "Please select a provider"),
});

const waiteringSchema = z.object({
  serviceId: z.string(),
  eventType: z.string().min(1, "Please select event type"),
  serviceType: z.string().min(1, "Please select service type"),
  numberOfPeople: z.string().min(1, "Please enter number of people"),
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
  const [showMovingDetails, setShowMovingDetails] = useState(false);
  const [movingServiceDetails, setMovingServiceDetails] = useState<any>(null);
  const [selectedMovingProvider, setSelectedMovingProvider] = useState<ServiceProvider | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [menuType, setMenuType] = useState<"popular" | "custom">("popular");
  const [customMenuItems, setCustomMenuItems] = useState<string[]>([""]);
  const [ingredientOption, setIngredientOption] = useState<"chef-brings" | "customer-provides">("chef-brings");
  const [utensilsOption, setUtensilsOption] = useState<"chef-brings" | "customer-provides">("chef-brings");
  const { toast } = useToast();

  const { data: services } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const { data: providers } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers"],
    enabled: isOpen,
  });

  const currentService = services?.find(s => s.id === serviceId || s.category === serviceId);
  
  // Determine which schema to use based on service type
  const getFormSchema = () => {
    if (!currentService) return cleaningSchema;
    
    if (currentService.category.includes('cleaning')) return cleaningSchema;
    if (currentService.category.includes('plumbing') || currentService.category.includes('electrical')) return maintenanceSchema;
    if (currentService.category.includes('chef') || currentService.category.includes('catering')) return cateringSchema;
    if (currentService.category.includes('waitering')) return waiteringSchema;
    if (currentService.category.includes('gardening')) return gardeningSchema;
    
    return cleaningSchema;
  };

  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      serviceId: serviceId,
      providerId: "",
      numberOfPeople: "",
      menuType: "popular" as const,
      selectedMenu: "",
      customMenuItems: [],
      ingredientOption: "chef-brings" as const,
      utensilsOption: "chef-brings" as const,
      // Cleaning service fields
      propertySize: "",
      bathrooms: "",
      cleaningType: "",
      // Maintenance service fields
      problemDescription: "",
      urgency: "",
      propertyType: "",
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

  const handleMovingBookingProceed = (serviceDetails: any, provider: ServiceProvider) => {
    setMovingServiceDetails(serviceDetails);
    setSelectedMovingProvider(provider);
    setShowMovingDetails(false);
    // Continue with regular booking flow with pre-filled data
  };

  // Handle Home Moving service with detailed flow
  useEffect(() => {
    if (serviceId === "home-moving" && isOpen && !showMovingDetails && !movingServiceDetails) {
      setShowMovingDetails(true);
    }
  }, [serviceId, isOpen, showMovingDetails, movingServiceDetails]);

  // Show Home Moving Details component for moving service
  if (showMovingDetails) {
    return (
      <HomeMovingDetails
        isOpen={showMovingDetails}
        onClose={() => {
          setShowMovingDetails(false);
          onClose();
        }}
        onProceedToBooking={handleMovingBookingProceed}
      />
    );
  }

  // Cuisine types and popular menus data
  const cuisineTypes = {
    italian: {
      name: "Italian",
      specialization: "italian",
      popularMenus: [
        {
          id: "classic-italian",
          name: "Classic Italian Feast",
          description: "Traditional pasta, risotto, and authentic Italian flavors",
          items: ["Antipasto Platter", "Spaghetti Carbonara", "Chicken Parmigiana", "Tiramisu"],
          basePrice: 650
        },
        {
          id: "gourmet-italian",
          name: "Gourmet Italian Experience",
          description: "Premium ingredients with contemporary Italian cuisine",
          items: ["Burrata with Truffle Oil", "Osso Buco", "Seafood Risotto", "Panna Cotta"],
          basePrice: 850
        }
      ]
    },
    asian: {
      name: "Asian Fusion",
      specialization: "asian",
      popularMenus: [
        {
          id: "thai-delight",
          name: "Thai Delight",
          description: "Authentic Thai flavors with fresh herbs and spices",
          items: ["Thai Green Curry", "Pad Thai", "Tom Yum Soup", "Mango Sticky Rice"],
          basePrice: 580
        },
        {
          id: "japanese-zen",
          name: "Japanese Zen",
          description: "Traditional Japanese cuisine with fresh ingredients",
          items: ["Miso Soup", "Chicken Teriyaki", "Sushi Platter", "Mochi Ice Cream"],
          basePrice: 720
        }
      ]
    },
    african: {
      name: "African Traditional",
      specialization: "african",
      popularMenus: [
        {
          id: "heritage-feast",
          name: "Heritage Feast",
          description: "Traditional South African flavors and comfort food",
          items: ["Bobotie", "Potjiekos", "Boerewors", "Malva Pudding"],
          basePrice: 520
        },
        {
          id: "modern-african",
          name: "Modern African",
          description: "Contemporary take on African cuisine",
          items: ["Springbok Carpaccio", "Ostrich Fillet", "Amaranth Salad", "Rooibos Panna Cotta"],
          basePrice: 680
        }
      ]
    },
    indian: {
      name: "Indian Cuisine",
      specialization: "indian",
      popularMenus: [
        {
          id: "curry-house",
          name: "Curry House Special",
          description: "Rich curries and aromatic spices",
          items: ["Chicken Tikka Masala", "Lamb Biryani", "Naan Bread", "Gulab Jamun"],
          basePrice: 590
        },
        {
          id: "vegetarian-indian",
          name: "Vegetarian Indian",
          description: "Plant-based Indian delicacies",
          items: ["Dal Makhani", "Palak Paneer", "Vegetable Biryani", "Kulfi"],
          basePrice: 520
        }
      ]
    },
    mediterranean: {
      name: "Mediterranean",
      specialization: "mediterranean",
      popularMenus: [
        {
          id: "greek-island",
          name: "Greek Island",
          description: "Fresh Mediterranean flavors with olive oil and herbs",
          items: ["Greek Salad", "Moussaka", "Grilled Lamb", "Baklava"],
          basePrice: 620
        },
        {
          id: "healthy-med",
          name: "Healthy Mediterranean",
          description: "Light and nutritious Mediterranean dishes",
          items: ["Hummus Platter", "Grilled Fish", "Quinoa Tabbouleh", "Fresh Fruit"],
          basePrice: 580
        }
      ]
    }
  };

  // Filter chefs based on cuisine specialization and location
  const getRelevantChefs = () => {
    if (serviceId !== "chef-catering") {
      return providers?.filter(p => 
        p.servicesOffered.includes(serviceId) || 
        p.servicesOffered.includes(currentService?.category || "")
      );
    }

    // For chef & catering, filter by cuisine specialization
    let filteredChefs = providers?.filter(p => 
      p.servicesOffered.includes("chef-catering") || 
      p.servicesOffered.includes("chef") ||
      p.servicesOffered.includes("catering")
    );

    // If cuisine is selected, filter by specialization
    if (selectedCuisine && filteredChefs) {
      const cuisineData = cuisineTypes[selectedCuisine as keyof typeof cuisineTypes];
      if (cuisineData) {
        filteredChefs = filteredChefs.filter(chef => 
          chef.bio?.toLowerCase().includes(cuisineData.name.toLowerCase()) ||
          chef.bio?.toLowerCase().includes(cuisineData.specialization)
        );
      }
    }

    return filteredChefs;
  };

  const relevantProviders = getRelevantChefs();

  // Calculate total price based on selections
  const calculateTotalPrice = () => {
    let basePrice = parseFloat(currentService?.basePrice || "550");
    const numberOfPeopleStr = form.getValues().numberOfPeople || "1";
    const numberOfPeople = parseInt(numberOfPeopleStr);
    
    // House Cleaning Dynamic Pricing
    if (currentService?.category.includes('cleaning')) {
      const propertySize = form.getValues().propertySize;
      const bathrooms = form.getValues().bathrooms;
      const cleaningType = form.getValues().cleaningType;
      
      // Base price starts at R150 for small properties
      basePrice = 150;
      
      // Property size multiplier
      const sizeMultipliers = {
        'small': 1.0,      // R150 base
        'medium': 1.5,     // R225 
        'large': 2.0       // R300
      };
      
      if (propertySize && sizeMultipliers[propertySize as keyof typeof sizeMultipliers]) {
        basePrice *= sizeMultipliers[propertySize as keyof typeof sizeMultipliers];
      }
      
      // Additional cost per bathroom (beyond the first)
      const bathroomCosts = {
        '1': 0,
        '2': 50,
        '3': 100,
        '4+': 150
      };
      
      if (bathrooms && bathroomCosts[bathrooms as keyof typeof bathroomCosts]) {
        basePrice += bathroomCosts[bathrooms as keyof typeof bathroomCosts];
      }
      
      // Cleaning type multiplier
      const cleaningTypeMultipliers = {
        'regular': 1.0,        // No additional cost
        'deep': 1.8,          // 80% more expensive
        'move-in': 1.6,       // 60% more expensive  
        'move-out': 1.7       // 70% more expensive
      };
      
      if (cleaningType && cleaningTypeMultipliers[cleaningType as keyof typeof cleaningTypeMultipliers]) {
        basePrice *= cleaningTypeMultipliers[cleaningType as keyof typeof cleaningTypeMultipliers];
      }
    }
    
    // Chef & Catering Dynamic Pricing
    if (serviceId === "chef-catering") {
      // Menu pricing
      const selectedMenuValue = form.getValues().selectedMenu;
      if (menuType === "popular" && selectedCuisine && selectedMenuValue) {
        const cuisineData = cuisineTypes[selectedCuisine as keyof typeof cuisineTypes];
        const selectedMenuData = cuisineData?.popularMenus.find(m => m.id === selectedMenuValue);
        if (selectedMenuData) {
          basePrice = selectedMenuData.basePrice;
        }
      }
      
      // Ingredient and utensil pricing
      if (ingredientOption === "chef-brings") {
        basePrice += 80; // Additional cost for ingredients
      }
      if (utensilsOption === "chef-brings") {
        basePrice += 50; // Additional cost for utensils
      }
      
      // Per person pricing
      basePrice = basePrice * numberOfPeople;
    }
    
    return basePrice.toFixed(2);
  };

  const onSubmit = (data: any) => {
    const bookingData = {
      ...data,
      providerId: selectedMovingProvider?.id || selectedProvider,
      totalAmount: movingServiceDetails?.totalPrice || parseFloat(currentService?.basePrice || "0"),
      status: "pending",
    };
    
    if (movingServiceDetails) {
      bookingData.serviceDetails = movingServiceDetails;
    }
    
    createBookingMutation.mutate(bookingData);
  };

  const renderServiceSpecificFields = () => {
    if (!currentService) return null;

    // Cleaning Services
    if (currentService.category.includes('cleaning')) {
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
          
          {/* Price Breakdown for Cleaning Services */}
          {form.watch("propertySize") && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Price Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base price ({form.watch("propertySize")} property):</span>
                  <span>R{(() => {
                    const size = form.watch("propertySize");
                    const multipliers = { 'small': 150, 'medium': 225, 'large': 300 };
                    return multipliers[size as keyof typeof multipliers] || 150;
                  })()}</span>
                </div>
                {form.watch("bathrooms") && form.watch("bathrooms") !== "1" && (
                  <div className="flex justify-between">
                    <span>Additional bathrooms:</span>
                    <span>R{(() => {
                      const bathrooms = form.watch("bathrooms");
                      const costs = { '2': 50, '3': 100, '4+': 150 };
                      return costs[bathrooms as keyof typeof costs] || 0;
                    })()}</span>
                  </div>
                )}
                {form.watch("cleaningType") && form.watch("cleaningType") !== "regular" && (
                  <div className="flex justify-between">
                    <span>{form.watch("cleaningType")} cleaning premium:</span>
                    <span>
                      {(() => {
                        const type = form.watch("cleaningType");
                        const multipliers = { 'deep': '+80%', 'move-in': '+60%', 'move-out': '+70%' };
                        return multipliers[type as keyof typeof multipliers] || '';
                      })()}
                    </span>
                  </div>
                )}
                <div className="border-t pt-1 font-semibold flex justify-between">
                  <span>Total:</span>
                  <span>R{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    // Maintenance & Repairs
    if (currentService.category.includes('plumbing') || currentService.category.includes('electrical')) {
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

    // Chef & Catering Services
    if (currentService.category.includes('chef') || currentService.category.includes('catering')) {
      const selectedCuisineData = selectedCuisine ? cuisineTypes[selectedCuisine as keyof typeof cuisineTypes] : null;
      
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
                {...form.register("numberOfPeople")}
              />
            </div>
          </div>
          
          {/* Cuisine Selection */}
          <div>
            <Label htmlFor="cuisineType">Cuisine Type</Label>
            <Select 
              onValueChange={(value) => {
                setSelectedCuisine(value);
                form.setValue("cuisineType" as any, value);
                form.setValue("selectedMenu", ""); // Reset menu selection
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

          {/* Menu Selection - Only show after cuisine is selected */}
          {selectedCuisine && selectedCuisineData && (
            <div className="space-y-4">
              <div>
                <Label>Menu Options</Label>
                <div className="flex space-x-4 mt-2">
                  <Button
                    type="button"
                    variant={menuType === "popular" ? "default" : "outline"}
                    onClick={() => setMenuType("popular")}
                    className="flex-1"
                  >
                    Popular Menus
                  </Button>
                  <Button
                    type="button"
                    variant={menuType === "custom" ? "default" : "outline"}
                    onClick={() => setMenuType("custom")}
                    className="flex-1"
                  >
                    Custom Menu
                  </Button>
                </div>
              </div>

              {/* Popular Menus */}
              {menuType === "popular" && (
                <div className="space-y-3">
                  <Label>Choose from our popular {selectedCuisineData.name} menus:</Label>
                  {selectedCuisineData.popularMenus.map((menu) => (
                    <Card 
                      key={menu.id}
                      className={`cursor-pointer transition-all ${
                        form.getValues().selectedMenu === menu.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => form.setValue("selectedMenu", menu.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg">{menu.name}</h5>
                            <p className="text-gray-600 text-sm mb-2">{menu.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {menu.items.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-primary">R{menu.basePrice}</p>
                            <p className="text-xs text-gray-500">per person</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Custom Menu */}
              {menuType === "custom" && (
                <div className="space-y-3">
                  <Label>Configure your custom menu:</Label>
                  {customMenuItems.map((item, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newItems = [...customMenuItems];
                          newItems[index] = e.target.value;
                          setCustomMenuItems(newItems);
                        }}
                        placeholder="Enter dish name..."
                        className="flex-1"
                      />
                      {customMenuItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItems = customMenuItems.filter((_, i) => i !== index);
                            setCustomMenuItems(newItems);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCustomMenuItems([...customMenuItems, ""])}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Dish
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Ingredient and Utensil Options */}
          {selectedCuisine && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Ingredient Sourcing</Label>
                <div className="space-y-2 mt-2">
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      ingredientOption === "chef-brings" ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setIngredientOption("chef-brings");
                      form.setValue("ingredientOption", "chef-brings");
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Chef Brings Ingredients</p>
                        <p className="text-sm text-gray-600">+R80 per person</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      ingredientOption === "customer-provides" ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setIngredientOption("customer-provides");
                      // Ingredient option set
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">I'll Provide Ingredients</p>
                        <p className="text-sm text-gray-600">Shopping list will be provided</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Cooking Utensils</Label>
                <div className="space-y-2 mt-2">
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      utensilsOption === "chef-brings" ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setUtensilsOption("chef-brings");
                      form.setValue("utensilsOption", "chef-brings");
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Utensils className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Chef Brings Utensils</p>
                        <p className="text-sm text-gray-600">+R50 per person</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      utensilsOption === "customer-provides" ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setUtensilsOption("customer-provides");
                      // Utensils option set
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Use My Kitchen Utensils</p>
                        <p className="text-sm text-gray-600">Chef will use your equipment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price Summary */}
          {selectedCuisine && form.getValues().numberOfPeople && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Price Estimate</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base rate ({form.getValues().numberOfPeople} people):</span>
                  <span>R{calculateTotalPrice()}</span>
                </div>
                {ingredientOption === "chef-brings" && (
                  <div className="flex justify-between text-blue-700">
                    <span>• Ingredients included</span>
                    <span>✓</span>
                  </div>
                )}
                {utensilsOption === "chef-brings" && (
                  <div className="flex justify-between text-blue-700">
                    <span>• Professional utensils included</span>
                    <span>✓</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="dietaryRequirements">Dietary Requirements</Label>
            <Textarea 
              placeholder="Any allergies, special diets, or dietary restrictions..."
              {...form.register("specialInstructions" as any)}
            />
          </div>
        </>
      );
    }

    // Waitering Services
    if (currentService.category.includes('waitering')) {
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
                {...form.register("numberOfPeople")}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select onValueChange={(value) => form.setValue("serviceType" as any, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table-service">Table Service</SelectItem>
                <SelectItem value="bar-service">Bar Service</SelectItem>
                <SelectItem value="both">Table & Bar Service</SelectItem>
                <SelectItem value="event-coordination">Event Coordination</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );
    }

    // Garden Care
    if (currentService.category.includes('gardening')) {
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
            Book {currentService?.name}
          </DialogTitle>
          <DialogDescription>
            Complete your booking in just a few simple steps
          </DialogDescription>
        </DialogHeader>

        {currentService && (
          <div className="space-y-6">
            {/* Service Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">{currentService.category}</Badge>
                    <h3 className="text-xl font-semibold">{currentService.name}</h3>
                    <p className="text-gray-600 mt-2">{currentService.description}</p>
                  </div>
                  <div className="text-right">
                    {serviceId === "chef-catering" && selectedCuisine && form.getValues().numberOfPeople ? (
                      <div>
                        <p className="text-2xl font-bold text-primary">R{calculateTotalPrice()}</p>
                        <p className="text-sm text-gray-500">total estimate</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold text-primary">R{currentService.basePrice}</p>
                        <p className="text-sm text-gray-500">starting from</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Service-Specific Fields */}
              {currentService.category === "chef-catering" ? (
                <EnhancedChefBooking 
                  form={form}
                  onNext={() => {}}
                  onBack={() => {}}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="font-semibold text-lg">Service Details</h4>
                    {renderServiceSpecificFields()}
                  </CardContent>
                </Card>
              )}

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
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Select Your Provider</h4>
                    {serviceId === "chef-catering" && selectedCuisine && (
                      <Badge variant="secondary" className="ml-2">
                        <ChefHat className="h-3 w-3 mr-1" />
                        {cuisineTypes[selectedCuisine as keyof typeof cuisineTypes]?.name} Specialists
                      </Badge>
                    )}
                  </div>
                  {serviceId === "chef-catering" && selectedCuisine && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">Cuisine-specific matching:</span> Showing chefs who specialize in {cuisineTypes[selectedCuisine as keyof typeof cuisineTypes]?.name} cuisine within your radius.
                      </p>
                    </div>
                  )}
                  {movingServiceDetails && selectedMovingProvider ? (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800">Selected Moving Provider:</h5>
                      <p className="text-green-700">{selectedMovingProvider.firstName} {selectedMovingProvider.lastName}</p>
                      <p className="text-sm text-green-600">Total Services: {movingServiceDetails.selectedServices.join(', ')}</p>
                      <p className="text-sm text-green-600">Total Cost: R{movingServiceDetails.totalPrice}</p>
                    </div>
                  ) : (
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