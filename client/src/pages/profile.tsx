import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ModernServiceModal from "@/components/modern-service-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Star, Clock, Save, MapPin, Settings as SettingsIcon, Moon, Sun, Monitor, CheckCircle2, Loader2, Heart, X, Home } from "lucide-react";
import { parseDecimal, formatCurrency } from "@/lib/currency";
import type { Order, OrderItem } from "@shared/schema";

// South African Provinces and Cities Data
const SOUTH_AFRICAN_PROVINCES = {
  "Western Cape": [
    "Cape Town", "Stellenbosch", "Paarl", "George", "Mossel Bay", "Hermanus", 
    "Knysna", "Worcester", "Oudtshoorn", "Swellendam", "Caledon", "Robertson"
  ],
  "Gauteng": [
    "Johannesburg", "Pretoria", "Soweto", "Sandton", "Randburg", "Centurion", 
    "Midrand", "Roodepoort", "Germiston", "Benoni", "Boksburg", "Springs"
  ],
  "KwaZulu-Natal": [
    "Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ladysmith", 
    "Pinetown", "Chatsworth", "Umlazi", "Port Shepstone", "Empangeni", "Scottburgh"
  ],
  "Eastern Cape": [
    "Port Elizabeth", "East London", "Uitenhage", "King William's Town", 
    "Mthatha", "Grahamstown", "Queenstown", "Jeffreys Bay", "Port Alfred", "Cradock"
  ],
  "Limpopo": [
    "Polokwane", "Tzaneen", "Thohoyandou", "Phalaborwa", "Louis Trichardt", 
    "Musina", "Giyani", "Mokopane", "Bela-Bela", "Thabazimbi"
  ],
  "Mpumalanga": [
    "Nelspruit", "Witbank", "Secunda", "Standerton", "Middelburg", "Ermelo", 
    "Barberton", "White River", "Sabie", "Hazyview"
  ],
  "North West": [
    "Rustenburg", "Mahikeng", "Potchefstroom", "Klerksdorp", "Brits", 
    "Vryburg", "Lichtenburg", "Zeerust", "Stilfontein", "Hartbeespoort"
  ],
  "Free State": [
    "Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", 
    "Virginia", "Phuthaditjhaba", "Odendaalsrus", "Parys", "Heilbron"
  ],
  "Northern Cape": [
    "Kimberley", "Upington", "Kuruman", "De Aar", "Springbok", "Alexander Bay", 
    "Calvinia", "Carnarvon", "Fraserburg", "Sutherland"
  ]
};

const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  province: z.string().min(1, "Please select a province"),
  city: z.string().min(1, "Please select a city"),
  address: z.string().min(5, "Please enter your full address")
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const SERVICES = [
  { id: "house-cleaning", label: "House Cleaning", icon: "🏠" },
  { id: "garden-care", label: "Garden Care", icon: "🌿" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "chef-catering", label: "Chef & Catering", icon: "👨‍🍳" },
  { id: "event-staff", label: "Event Staff", icon: "🎉" },
  { id: "moving", label: "Moving & Relocation", icon: "📦" },
  { id: "au-pair", label: "Au Pair Services", icon: "👶" },
];

// Preferred Services Selector Component
function PreferredServicesSelector({ userId, userData }: { userId: string | undefined, userData: any }) {
  const { toast } = useToast();

  const updateServicesMutation = useMutation({
    mutationFn: async (preferredServices: string[]) => {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers,
        credentials: "include",
        body: JSON.stringify({ preferredServices }),
      });
      
      if (!res.ok) throw new Error('Failed to update preferences');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Success",
        description: "Service preferences updated!",
      });
    },
  });

  const handleServiceToggle = (serviceId: string) => {
    const currentPreferences = userData?.preferredServices || [];
    const newPreferences = currentPreferences.includes(serviceId)
      ? currentPreferences.filter((id: string) => id !== serviceId)
      : [...currentPreferences, serviceId];

    updateServicesMutation.mutate(newPreferences);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {SERVICES.map((service) => {
        const isSelected = userData?.preferredServices?.includes(service.id);
        return (
          <div
            key={service.id}
            onClick={() => handleServiceToggle(service.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            data-testid={`service-option-${service.id}`}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-2xl">{service.icon}</span>
              <span className="text-sm font-medium">{service.label}</span>
              {isSelected && (
                <Badge
                  className="bg-primary text-white"
                  data-testid={`badge-selected-${service.id}`}
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Selected
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Preferred Providers List Component  
function PreferredProvidersList({ userId, userData }: { userId: string | undefined, userData: any }) {
  const { toast } = useToast();

  const updateProvidersMutation = useMutation({
    mutationFn: async (preferredProviders: string[]) => {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers,
        credentials: "include",
        body: JSON.stringify({ preferredProviders }),
      });
      
      if (!res.ok) throw new Error('Failed to update preferences');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Success",
        description: "Provider preferences updated!",
      });
    },
  });

  const handleRemoveProvider = (providerId: string) => {
    const currentProviders = userData?.preferredProviders || [];
    const newProviders = currentProviders.filter((id: string) => id !== providerId);
    updateProvidersMutation.mutate(newProviders);
  };

  if (!userData?.preferredProviders || userData.preferredProviders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No saved providers yet</p>
        <p className="text-sm mt-1">
          After completing a booking, you can add providers to your favorites
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {userData.preferredProviders.map((providerId: string) => (
        <div
          key={providerId}
          className="flex items-center justify-between p-3 rounded-lg border"
          data-testid={`provider-item-${providerId}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Provider #{providerId.slice(0, 8)}</p>
              <p className="text-sm text-gray-600">Saved provider</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveProvider(providerId)}
            data-testid={`button-remove-provider-${providerId}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  const userId = user?.id;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      province: "",
      city: "",
      address: ""
    }
  });

  // Load existing user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    retry: false,
    enabled: !!userId,
  });

  // Fetch user's orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders', userId],
    queryFn: async () => {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      
      const res = await fetch('/api/orders', {
        headers,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      
      return res.json();
    },
    enabled: !!userId && isAuthenticated,
  });

  // Update form when user data loads
  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        province: userData.province || "",
        city: userData.city || "",
        address: userData.address || ""
      });
      
      // Set selected province for the city dropdown
      if (userData.province) {
        setSelectedProvince(userData.province);
      }
    }
  }, [userData, form]);

  // Mutation to update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileFormData) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully.",
      });
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const openBooking = () => {
    setIsBookingOpen(true);
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    form.setValue("province", province);
    form.setValue("city", ""); // Reset city when province changes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBookingClick={openBooking} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Profile</h1>
          <p className="text-lg text-neutral mb-6">Manage your bookings and account settings</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            className="inline-flex items-center gap-2"
            data-testid="button-back-home"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile Preferences</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Upcoming Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.filter(o => o.status === "confirmed" || o.status === "pending").length > 0 ? (
                      <div className="space-y-4">
                        {orders
                          .filter(o => o.status === "confirmed" || o.status === "pending")
                          .map((order) => (
                            <div
                              key={order.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              data-testid={`order-${order.id}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                                  <p className="text-sm text-gray-500">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                                  </p>
                                </div>
                                <Badge className="bg-primary/10 text-primary">
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Total Amount:</span>
                                  <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Payment Status:</span>
                                  <Badge variant="outline">{order.paymentStatus}</Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                                onClick={() => window.location.href = `/order-confirmation/${order.id}`}
                                data-testid={`button-view-order-${order.id}`}
                              >
                                View Details
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-neutral mx-auto mb-4" />
                        <p className="text-neutral">No upcoming bookings found.</p>
                        <Button 
                          onClick={openBooking}
                          className="mt-4" 
                          data-testid="button-book-service"
                        >
                          Book a Service
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.filter(o => o.status === "completed" || o.status === "cancelled").length > 0 ? (
                      <div className="space-y-4">
                        {orders
                          .filter(o => o.status === "completed" || o.status === "cancelled")
                          .map((order) => (
                            <div
                              key={order.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              data-testid={`order-history-${order.id}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                                  <p className="text-sm text-gray-500">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                                  </p>
                                </div>
                                <Badge className={order.status === "completed" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                                  {order.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Total Amount:</span>
                                  <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Payment Status:</span>
                                  <Badge variant="outline">{order.paymentStatus}</Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                                onClick={() => window.location.href = `/order-confirmation/${order.id}`}
                                data-testid={`button-view-order-history-${order.id}`}
                              >
                                View Details
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-neutral mx-auto mb-4" />
                        <p className="text-neutral">No previous bookings found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+27 12 345 6789" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              Province
                            </FormLabel>
                            <Select onValueChange={handleProvinceChange} value={field.value} data-testid="select-province">
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your province" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.keys(SOUTH_AFRICAN_PROVINCES).map((province) => (
                                  <SelectItem key={province} value={province}>
                                    {province}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              City
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={!selectedProvince}
                              data-testid="select-city"
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedProvince ? "Select your city" : "Select province first"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedProvince && SOUTH_AFRICAN_PROVINCES[selectedProvince as keyof typeof SOUTH_AFRICAN_PROVINCES]?.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street, Suburb, Postal Code" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => form.reset()}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700" 
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Preferred Services Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" style={{ color: "#C56B86" }} />
                  Preferred Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Select the services you frequently use to get personalized recommendations
                </p>
                
                <PreferredServicesSelector userId={userId} userData={userData} />
              </CardContent>
            </Card>

            {/* Preferred Providers Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" style={{ color: "#C56B86" }} />
                  Saved Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your favorite service providers for quick rebooking
                </p>
                
                <PreferredProvidersList userId={userId} userData={userData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Application Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Theme</h3>
                    <p className="text-sm text-gray-500">Choose your preferred color scheme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setTheme("light");
                        toast({
                          title: "Theme Changed",
                          description: "Light theme activated",
                        });
                      }}
                      data-testid="button-theme-light"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setTheme("dark");
                        toast({
                          title: "Theme Changed",
                          description: "Dark theme activated",
                        });
                      }}
                      data-testid="button-theme-dark"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setTheme("system");
                        toast({
                          title: "Theme Changed",
                          description: "System theme will be used",
                        });
                      }}
                      data-testid="button-theme-system"
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 italic">
                  Additional settings coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  My Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-neutral mx-auto mb-4" />
                  <p className="text-neutral">No reviews yet. Book a service to leave your first review!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      
      <ModernServiceModal 
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedServiceId("");
        }}
        serviceId={selectedServiceId}
        onServiceSelect={(serviceId: string) => setSelectedServiceId(serviceId)}
        onBookingComplete={(bookingData: any) => {
          console.log("Booking completed:", bookingData);
          setIsBookingOpen(false);
          setSelectedServiceId("");
          queryClient.invalidateQueries({ queryKey: ['/api/orders', userId] });
        }}
        recentOrders={orders}
      />
    </div>
  );
}
