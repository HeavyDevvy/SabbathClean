import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HomeHeader from "@/components/home-header";
import { 
  ArrowLeft, Calendar, Clock, MapPin, User, CreditCard,
  Plus, Minus, Check, Star, Shield, Phone, MessageCircle
} from "lucide-react";
import { formatCurrency, calculateServiceTime } from "@/lib/utils";
import type { Service, ServiceProvider, CreateBookingInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function BookingPage() {
  const { serviceId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Booking flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>(serviceId || '');
  const [selectedAddons, setSelectedAddons] = useState<{ [addonId: string]: number }>({});
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<Partial<CreateBookingInput>>({
    scheduledDate: '',
    scheduledTime: '09:00',
    address: {
      street: '',
      city: 'Cape Town',
      state: 'Western Cape',
      zipCode: '',
      country: 'South Africa',
      propertyType: 'apartment' as const
    },
    description: '',
    specialInstructions: ''
  });
  const [recurringSettings, setRecurringSettings] = useState<{ enabled: boolean; frequency: 'weekly' | 'bi-weekly' | 'monthly' }>({
    enabled: false,
    frequency: 'weekly'
  });

  // Mock customer - in real app, this would come from auth
  const customerId = 'customer-1';

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  // Fetch selected service details
  const { data: serviceDetails } = useQuery({
    queryKey: [`/api/services/${selectedService}`],
    enabled: !!selectedService,
  });

  // Fetch matched providers
  const { data: matchedProviders = [] } = useQuery({
    queryKey: [`/api/search/providers`],
    queryFn: async () => {
      if (!selectedService || !bookingDetails.address?.city) return [];
      
      const response = await apiRequest('POST', '/api/search/providers', {
        serviceId: selectedService,
        location: bookingDetails.address.city,
        date: bookingDetails.scheduledDate,
        time: bookingDetails.scheduledTime
      });
      return response.json();
    },
    enabled: currentStep >= 3 && !!selectedService && !!bookingDetails.address?.city,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: CreateBookingInput & { customerId: string }) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setLocation(`/dashboard/bookings`);
    },
  });

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!serviceDetails) return 0;
    
    let total = serviceDetails.basePrice;
    
    // Add addons
    Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
      const addon = serviceDetails.addons.find(a => a.id === addonId);
      if (addon && quantity > 0) {
        total += addon.price * quantity;
      }
    });
    
    return total;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service.id);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setCurrentStep(4);
  };

  const handleBookingConfirm = () => {
    if (!serviceDetails || !selectedProvider) return;

    const bookingData = {
      customerId,
      serviceId: selectedService,
      ...bookingDetails,
      addons: Object.entries(selectedAddons)
        .filter(([, quantity]) => quantity > 0)
        .map(([addonId, quantity]) => ({ addonId, quantity })),
      recurringSettings: recurringSettings.enabled ? {
        frequency: recurringSettings.frequency
      } : undefined
    } as CreateBookingInput & { customerId: string };

    createBookingMutation.mutate(bookingData);
  };

  const steps = [
    { number: 1, title: 'Select Service', description: 'Choose your service type' },
    { number: 2, title: 'Service Details', description: 'Add details and addons' },
    { number: 3, title: 'Location & Time', description: 'When and where' },
    { number: 4, title: 'Choose Provider', description: 'Select your professional' },
    { number: 5, title: 'Confirm & Pay', description: 'Review and book' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader isAuthenticated={true} onBookService={() => setLocation('/book')} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 text-sm">
                  <p className={`font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>
                    {step.title}
                  </p>
                  <p className="text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {steps[currentStep - 1].title}
                    </CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {steps[currentStep - 1].description}
                    </CardDescription>
                  </div>
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handlePreviousStep} data-testid="button-back">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Step 1: Service Selection */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service: Service) => (
                      <Card 
                        key={service.id}
                        className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                          selectedService === service.id ? 'border-blue-500 ring-2 ring-blue-200' : ''
                        }`}
                        onClick={() => handleServiceSelect(service)}
                        data-testid={`service-option-${service.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <CardDescription className="mt-2">
                                {service.description}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-blue-600">
                                {formatCurrency(service.basePrice)}
                              </div>
                              <div className="text-sm text-gray-500">per {service.priceUnit}</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {calculateServiceTime(service.duration)}
                            </span>
                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                              {service.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Step 2: Service Details & Addons */}
                {currentStep === 2 && serviceDetails && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Service Requirements</h3>
                      <ul className="space-y-2">
                        {serviceDetails.requirements.map((req, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mr-3" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Add-on Services</h3>
                      <div className="space-y-4">
                        {serviceDetails.addons.map((addon) => (
                          <div key={addon.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{addon.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-semibold">
                                {addon.price > 0 ? formatCurrency(addon.price) : 'Quote'}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const current = selectedAddons[addon.id] || 0;
                                    if (current > 0) {
                                      setSelectedAddons(prev => ({ ...prev, [addon.id]: current - 1 }));
                                    }
                                  }}
                                  data-testid={`addon-decrease-${addon.id}`}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center" data-testid={`addon-count-${addon.id}`}>
                                  {selectedAddons[addon.id] || 0}
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const current = selectedAddons[addon.id] || 0;
                                    setSelectedAddons(prev => ({ ...prev, [addon.id]: current + 1 }));
                                  }}
                                  data-testid={`addon-increase-${addon.id}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recurring Service</h3>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={recurringSettings.enabled}
                            onChange={(e) => setRecurringSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                            className="w-4 h-4 text-blue-600"
                            data-testid="recurring-checkbox"
                          />
                          <span className="font-medium">Make this a recurring service</span>
                        </label>
                        {recurringSettings.enabled && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Frequency
                            </label>
                            <select
                              value={recurringSettings.frequency}
                              onChange={(e) => setRecurringSettings(prev => ({ ...prev, frequency: e.target.value as any }))}
                              className="w-full p-2 border border-gray-300 rounded-md"
                              data-testid="recurring-frequency"
                            >
                              <option value="weekly">Weekly</option>
                              <option value="bi-weekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={handleNextStep} 
                      className="w-full"
                      data-testid="button-continue-details"
                    >
                      Continue to Location & Time
                    </Button>
                  </div>
                )}

                {/* Step 3: Location & Time */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Service Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={bookingDetails.address?.street || ''}
                            onChange={(e) => setBookingDetails(prev => ({
                              ...prev,
                              address: { ...prev.address!, street: e.target.value }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            placeholder="123 Main Street"
                            data-testid="input-street"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={bookingDetails.address?.city || ''}
                            onChange={(e) => setBookingDetails(prev => ({
                              ...prev,
                              address: { ...prev.address!, city: e.target.value }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            placeholder="Cape Town"
                            data-testid="input-city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={bookingDetails.address?.zipCode || ''}
                            onChange={(e) => setBookingDetails(prev => ({
                              ...prev,
                              address: { ...prev.address!, zipCode: e.target.value }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            placeholder="8001"
                            data-testid="input-zipcode"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Property Type
                          </label>
                          <select
                            value={bookingDetails.address?.propertyType || 'apartment'}
                            onChange={(e) => setBookingDetails(prev => ({
                              ...prev,
                              address: { ...prev.address!, propertyType: e.target.value as any }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            data-testid="select-property-type"
                          >
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="office">Office</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Preferred Date & Time</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            value={bookingDetails.scheduledDate}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            data-testid="input-date"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time
                          </label>
                          <select
                            value={bookingDetails.scheduledTime}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, scheduledTime: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            data-testid="select-time"
                          >
                            {Array.from({ length: 10 }, (_, i) => {
                              const hour = 8 + i;
                              const time = `${hour.toString().padStart(2, '0')}:00`;
                              return (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        value={bookingDetails.specialInstructions || ''}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-md"
                        placeholder="Any specific requirements or access instructions..."
                        data-testid="textarea-instructions"
                      />
                    </div>

                    <Button 
                      onClick={handleNextStep}
                      disabled={!bookingDetails.scheduledDate || !bookingDetails.address?.street || !bookingDetails.address?.city}
                      className="w-full"
                      data-testid="button-continue-location"
                    >
                      Find Available Providers
                    </Button>
                  </div>
                )}

                {/* Step 4: Provider Selection */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {matchedProviders.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">Finding available providers...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matchedProviders.map((provider: any) => (
                          <Card 
                            key={provider.id}
                            className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                              selectedProvider === provider.id ? 'border-blue-500 ring-2 ring-blue-200' : ''
                            }`}
                            onClick={() => handleProviderSelect(provider.id)}
                            data-testid={`provider-option-${provider.id}`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                                  <img 
                                    src={provider.profileImages[0] || "/api/placeholder/64/64"}
                                    alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="text-lg font-semibold">
                                        {provider.user?.firstName} {provider.user?.lastName}
                                      </h3>
                                      <p className="text-gray-600">
                                        {provider.businessName || 'Independent Professional'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-blue-600">
                                        {formatCurrency(provider.hourlyRates[selectedService] || serviceDetails?.basePrice || 0)}
                                      </div>
                                      <div className="text-sm text-gray-500">per {serviceDetails?.priceUnit}</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                      <span>{provider.rating} ({provider.totalReviews} reviews)</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Shield className="w-4 h-4 mr-1" />
                                      <span>{provider.completedJobs} jobs completed</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      <span>{provider.responseTime} min response</span>
                                    </div>
                                  </div>

                                  <p className="text-gray-700 mt-3 line-clamp-2">
                                    {provider.bio}
                                  </p>

                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex space-x-2">
                                      <Button variant="outline" size="sm" data-testid={`provider-contact-${provider.id}`}>
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Message
                                      </Button>
                                      <Button variant="outline" size="sm" data-testid={`provider-call-${provider.id}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call
                                      </Button>
                                    </div>
                                    {provider.isVerified && (
                                      <div className="flex items-center text-green-600 text-sm">
                                        <Check className="w-4 h-4 mr-1" />
                                        Verified & Insured
                                      </div>
                                    )}
                                  </div>

                                  {provider.recentReviews && provider.recentReviews.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <div className="text-sm">
                                        <p className="font-medium text-gray-900">Recent review:</p>
                                        <p className="text-gray-600 italic mt-1">
                                          "{provider.recentReviews[0].comment}"
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Confirmation */}
                {currentStep === 5 && serviceDetails && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-medium">{serviceDetails.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date & Time:</span>
                          <span className="font-medium">
                            {new Date(bookingDetails.scheduledDate!).toLocaleDateString()} at {bookingDetails.scheduledTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium">
                            {bookingDetails.address?.street}, {bookingDetails.address?.city}
                          </span>
                        </div>
                        {recurringSettings.enabled && (
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span className="font-medium capitalize">{recurringSettings.frequency}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Service Base Price:</span>
                        <span>{formatCurrency(serviceDetails.basePrice)}</span>
                      </div>
                      {Object.entries(selectedAddons).map(([addonId, quantity]) => {
                        if (quantity === 0) return null;
                        const addon = serviceDetails.addons.find(a => a.id === addonId);
                        return addon ? (
                          <div key={addonId} className="flex justify-between">
                            <span>{addon.name} x {quantity}:</span>
                            <span>{formatCurrency(addon.price * quantity)}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatCurrency(calculateTotalPrice())}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleBookingConfirm}
                      disabled={createBookingMutation.isPending}
                      className="w-full"
                      size="lg"
                      data-testid="button-confirm-booking"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {createBookingMutation.isPending ? 'Processing...' : 'Confirm & Pay'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceDetails && (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{serviceDetails.name}</p>
                        <p className="text-sm text-gray-600">{calculateServiceTime(serviceDetails.duration)}</p>
                      </div>
                    </div>

                    {bookingDetails.scheduledDate && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(bookingDetails.scheduledDate).toLocaleDateString()} at {bookingDetails.scheduledTime}
                        </span>
                      </div>
                    )}

                    {bookingDetails.address?.city && (
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{bookingDetails.address.city}</span>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Service:</span>
                        <span>{formatCurrency(serviceDetails.basePrice)}</span>
                      </div>
                      {Object.entries(selectedAddons).map(([addonId, quantity]) => {
                        if (quantity === 0) return null;
                        const addon = serviceDetails.addons.find(a => a.id === addonId);
                        return addon ? (
                          <div key={addonId} className="flex justify-between text-sm">
                            <span>{addon.name} x{quantity}:</span>
                            <span>{formatCurrency(addon.price * quantity)}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatCurrency(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedProvider && currentStep >= 4 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Your Provider</h4>
                    {(() => {
                      const provider = matchedProviders.find((p: any) => p.id === selectedProvider);
                      return provider ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                            <img 
                              src={provider.profileImages[0] || "/api/placeholder/40/40"}
                              alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {provider.user?.firstName} {provider.user?.lastName}
                            </p>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                              <span className="text-xs text-gray-600">{provider.rating}</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}