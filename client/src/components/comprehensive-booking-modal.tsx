import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  CreditCard,
  Shield,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  Home as HomeIcon,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookingStep {
  id: number;
  title: string;
  description: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  estimatedDuration: number;
  description: string;
}

interface Provider {
  id: string;
  name: string;
  rating: number;
  totalReviews: number;
  image: string;
  specialties: string[];
  experience: string;
  distance: string;
  nextAvailable: string;
  hourlyRate: number;
}

interface ComprehensiveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: string;
}

export default function ComprehensiveBookingModal({ 
  isOpen, 
  onClose, 
  preSelectedService 
}: ComprehensiveBookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    duration: 2,
    address: "",
    city: "",
    postalCode: "",
    propertyType: "",
    propertySize: "",
    rooms: 0,
    bathrooms: 0,
    specialInstructions: "",
    contactInfo: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
    paymentMethod: "",
  });

  const steps: BookingStep[] = [
    { id: 1, title: "Service Selection", description: "Choose your service type and requirements" },
    { id: 2, title: "Location & Details", description: "Provide property details and preferences" },
    { id: 3, title: "Provider Selection", description: "Choose from matched professionals" },
    { id: 4, title: "Schedule & Contact", description: "Set appointment time and contact details" },
    { id: 5, title: "Payment & Confirmation", description: "Secure payment and booking confirmation" },
  ];

  const services: Service[] = [
    {
      id: "house-cleaning",
      name: "House Cleaning",
      category: "Indoor Services",
      basePrice: 280,
      estimatedDuration: 180,
      description: "Professional deep cleaning for your entire home"
    },
    {
      id: "garden-maintenance", 
      name: "Garden Maintenance",
      category: "Outdoor Services",
      basePrice: 350,
      estimatedDuration: 240,
      description: "Complete garden care and landscaping services"
    },
    {
      id: "plumbing-services",
      name: "Plumbing Services", 
      category: "Maintenance",
      basePrice: 400,
      estimatedDuration: 120,
      description: "Emergency and general plumbing repairs"
    },
    {
      id: "chef-catering",
      name: "Chef & Catering",
      category: "Specialized Services", 
      basePrice: 550,
      estimatedDuration: 240,
      description: "Professional chefs for events and daily meals"
    },
  ];

  const providers: Provider[] = [
    {
      id: "1",
      name: "Nomsa Mthembu",
      rating: 4.9,
      totalReviews: 127,
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      specialties: ["Deep Cleaning", "Eco-Friendly"],
      experience: "5+ years",
      distance: "2.3 km away",
      nextAvailable: "Today, 2:00 PM",
      hourlyRate: 280,
    },
    {
      id: "2", 
      name: "Thabo Mokoena",
      rating: 4.8,
      totalReviews: 89,
      image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      specialties: ["Emergency Repairs", "Licensed"],
      experience: "7+ years", 
      distance: "1.8 km away",
      nextAvailable: "Tomorrow, 9:00 AM",
      hourlyRate: 400,
    },
  ];

  useEffect(() => {
    if (preSelectedService) {
      const service = services.find(s => s.id === preSelectedService);
      if (service) {
        setSelectedService(service);
        setCurrentStep(2);
      }
    }
  }, [preSelectedService]);

  const calculateTotal = () => {
    if (!selectedService || !selectedProvider) return 0;
    const baseAmount = selectedProvider.hourlyRate * bookingDetails.duration;
    const platformFee = baseAmount * 0.15;
    const paymentFee = baseAmount * 0.035;
    return baseAmount + platformFee + paymentFee;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Book Your Service</h2>
              <p className="text-blue-100 mt-1">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              data-testid="button-close-modal"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{currentStep}/{steps.length}</span>
            </div>
            <div className="bg-blue-800 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Your Service</h3>
                <p className="text-gray-600">Choose the service you need from our professional offerings</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedService?.id === service.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedService(service)}
                    data-testid={`service-option-${service.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">{service.name}</h4>
                          <Badge variant="outline" className="mt-1">{service.category}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">R{service.basePrice}</div>
                          <div className="text-sm text-gray-500">starting from</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.floor(service.estimatedDuration / 60)}h duration
                        </span>
                        <span className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          Insured
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Location & Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Property Details</h3>
                <p className="text-gray-600">Help us match you with the right professional</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street"
                      value={bookingDetails.address}
                      onChange={(e) => setBookingDetails({...bookingDetails, address: e.target.value})}
                      data-testid="input-address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Cape Town"
                        value={bookingDetails.city}
                        onChange={(e) => setBookingDetails({...bookingDetails, city: e.target.value})}
                        data-testid="input-city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="8001"
                        value={bookingDetails.postalCode}
                        onChange={(e) => setBookingDetails({...bookingDetails, postalCode: e.target.value})}
                        data-testid="input-postal-code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingDetails.propertyType}
                      onChange={(e) => setBookingDetails({...bookingDetails, propertyType: e.target.value})}
                      data-testid="select-property-type"
                    >
                      <option value="">Select property type</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="office">Office</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Size
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingDetails.propertySize}
                      onChange={(e) => setBookingDetails({...bookingDetails, propertySize: e.target.value})}
                      data-testid="select-property-size"
                    >
                      <option value="">Select size</option>
                      <option value="small">Small (1-2 bedrooms)</option>
                      <option value="medium">Medium (3-4 bedrooms)</option>
                      <option value="large">Large (5+ bedrooms)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rooms
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bookingDetails.rooms || ''}
                        onChange={(e) => setBookingDetails({...bookingDetails, rooms: parseInt(e.target.value) || 0})}
                        data-testid="input-rooms"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bookingDetails.bathrooms || ''}
                        onChange={(e) => setBookingDetails({...bookingDetails, bathrooms: parseInt(e.target.value) || 0})}
                        data-testid="input-bathrooms"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any specific requirements or instructions..."
                      value={bookingDetails.specialInstructions}
                      onChange={(e) => setBookingDetails({...bookingDetails, specialInstructions: e.target.value})}
                      data-testid="textarea-special-instructions"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Provider Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Provider</h3>
                <p className="text-gray-600">Select from our top-rated professionals in your area</p>
              </div>

              <div className="space-y-4">
                {providers.map((provider) => (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedProvider?.id === provider.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProvider(provider)}
                    data-testid={`provider-option-${provider.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={provider.image} 
                          alt={provider.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg text-gray-900">{provider.name}</h4>
                              <div className="flex items-center mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < Math.floor(provider.rating) 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-600">
                                  {provider.rating} ({provider.totalReviews} reviews)
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">R{provider.hourlyRate}/hr</div>
                              <div className="text-sm text-gray-500">{provider.distance}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {provider.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                            <span>{provider.experience} experience</span>
                            <span className="text-green-600 font-medium">
                              Available: {provider.nextAvailable}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Schedule & Contact */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Schedule & Contact Details</h3>
                <p className="text-gray-600">Choose your preferred time and provide contact information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Scheduling */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Schedule</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingDetails.date}
                      onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                      data-testid="input-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingDetails.time}
                      onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})}
                      data-testid="select-time"
                    >
                      <option value="">Select time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingDetails.duration}
                      onChange={(e) => setBookingDetails({...bookingDetails, duration: parseInt(e.target.value)})}
                      data-testid="select-duration"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={5}>5 hours</option>
                      <option value={6}>6 hours</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Contact Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bookingDetails.contactInfo.firstName}
                        onChange={(e) => setBookingDetails({
                          ...bookingDetails, 
                          contactInfo: {...bookingDetails.contactInfo, firstName: e.target.value}
                        })}
                        data-testid="input-first-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bookingDetails.contactInfo.lastName}
                        onChange={(e) => setBookingDetails({
                          ...bookingDetails, 
                          contactInfo: {...bookingDetails.contactInfo, lastName: e.target.value}
                        })}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+27 12 345 6789"
                      value={bookingDetails.contactInfo.phone}
                      onChange={(e) => setBookingDetails({
                        ...bookingDetails, 
                        contactInfo: {...bookingDetails.contactInfo, phone: e.target.value}
                      })}
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                      value={bookingDetails.contactInfo.email}
                      onChange={(e) => setBookingDetails({
                        ...bookingDetails, 
                        contactInfo: {...bookingDetails.contactInfo, email: e.target.value}
                      })}
                      data-testid="input-email"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment & Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment & Confirmation</h3>
                <p className="text-gray-600">Review your booking and complete payment</p>
              </div>

              {/* Booking Summary */}
              <Card className="border-2 border-blue-100 bg-blue-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4">Booking Summary</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="font-medium">{selectedProvider?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span className="font-medium">{bookingDetails.date} at {bookingDetails.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{bookingDetails.duration} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="font-medium">{bookingDetails.address}, {bookingDetails.city}</span>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service Cost:</span>
                      <span>R{selectedProvider ? (selectedProvider.hourlyRate * bookingDetails.duration).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (15%):</span>
                      <span>R{selectedProvider ? ((selectedProvider.hourlyRate * bookingDetails.duration) * 0.15).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Processing (3.5%):</span>
                      <span>R{selectedProvider ? ((selectedProvider.hourlyRate * bookingDetails.duration) * 0.035).toFixed(2) : '0.00'}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>R{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Payment Method</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      bookingDetails.paymentMethod === 'card' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg hover:bg-gray-50'
                    }`}
                    onClick={() => setBookingDetails({...bookingDetails, paymentMethod: 'card'})}
                  >
                    <CardContent className="p-4 text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-500">Visa, Mastercard, Amex</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      bookingDetails.paymentMethod === 'bank' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg hover:bg-gray-50'
                    }`}
                    onClick={() => setBookingDetails({...bookingDetails, paymentMethod: 'bank'})}
                  >
                    <CardContent className="p-4 text-center">
                      <HomeIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-gray-500">Instant EFT</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">
                      By proceeding with this booking, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                    </p>
                    <p>
                      Your payment is processed securely through Berry Events Bank. 
                      The service provider will receive payment after successful completion of the service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !selectedService) ||
                    (currentStep === 2 && (!bookingDetails.address || !bookingDetails.city)) ||
                    (currentStep === 3 && !selectedProvider) ||
                    (currentStep === 4 && (!bookingDetails.date || !bookingDetails.time || !bookingDetails.contactInfo.firstName || !bookingDetails.contactInfo.phone))
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center"
                  data-testid="button-next"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  disabled={!bookingDetails.paymentMethod}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center"
                  data-testid="button-confirm-booking"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Booking - R{calculateTotal().toFixed(2)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}