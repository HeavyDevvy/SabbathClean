import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ServiceSpecificBooking from "@/components/service-specific-booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Star, Clock, Save, MapPin, Settings as SettingsIcon, Moon, Sun } from "lucide-react";

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

export default function Profile() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, using a demo user ID. In a real app, this would come from authentication
  const userId = "demo-user-123";

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
          <p className="text-lg text-neutral">Manage your bookings and account settings</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile Preferences</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-neutral mx-auto mb-4" />
                  <p className="text-neutral">No previous bookings found.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
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
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        toast({
                          title: "Theme Changed",
                          description: "Light theme will be applied in the next update",
                        });
                      }}
                      data-testid="button-theme-light"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        toast({
                          title: "Theme Changed",
                          description: "Dark theme will be applied in the next update",
                        });
                      }}
                      data-testid="button-theme-dark"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
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
      
      <ServiceSpecificBooking 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        serviceId=""
      />
    </div>
  );
}
