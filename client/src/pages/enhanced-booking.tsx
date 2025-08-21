import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, User, Mail, Phone } from "lucide-react";
import { useLocation } from "wouter";

interface BookingData {
  // User Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Service Details
  service: string;
  date: string;
  time: string;
  duration: string;
  
  // Location
  address: string;
  city: string;
  postalCode: string;
  
  // Additional Details
  requirements: string;
  
  // Payment
  amount: number;
}

interface EnhancedBookingProps {
  selectedService?: string;
  onClose: () => void;
}

export default function EnhancedBooking({ selectedService, onClose }: EnhancedBookingProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: selectedService || "",
    date: "",
    time: "",
    duration: "2",
    address: "",
    city: "",
    postalCode: "",
    requirements: "",
    amount: 0
  });

  const services = [
    { id: "house-cleaning", name: "House Cleaning", price: 280 },
    { id: "plumbing", name: "Plumbing Services", price: 350 },
    { id: "electrical", name: "Electrical Work", price: 400 },
    { id: "chef-catering", name: "Chef & Catering", price: 550 },
    { id: "waitering", name: "Waitering Services", price: 180 },
    { id: "garden-care", name: "Garden Care", price: 250 }
  ];

  const calculateAmount = () => {
    const serviceData = services.find(s => s.id === bookingData.service);
    const basePrice = serviceData?.price || 0;
    const duration = parseInt(bookingData.duration) || 1;
    return basePrice * duration;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      // Update amount when moving to payment step
      if (currentStep === 3) {
        setBookingData({ ...bookingData, amount: calculateAmount() });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Simulate booking submission with payment processing
    toast({
      title: "Booking Confirmed!",
      description: `Your ${bookingData.service} service is booked for ${bookingData.date} at ${bookingData.time}. A confirmation email has been sent to ${bookingData.email}.`,
    });
    
    // Redirect to confirmation page
    setTimeout(() => {
      setLocation("/booking-confirmation");
      onClose();
    }, 2000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">We'll use this information to send booking confirmations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="pl-10"
                    value={bookingData.firstName}
                    onChange={(e) => setBookingData({...bookingData, firstName: e.target.value})}
                    required
                    data-testid="input-first-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={bookingData.lastName}
                  onChange={(e) => setBookingData({...bookingData, lastName: e.target.value})}
                  required
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="pl-10"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 123 456 7890"
                  className="pl-10"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  required
                  data-testid="input-phone"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Details</h3>
              <p className="text-gray-600">Choose your service and schedule</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select value={bookingData.service} onValueChange={(value) => setBookingData({...bookingData, service: value})}>
                <SelectTrigger data-testid="select-service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R{service.price}/hour
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    data-testid="input-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    required
                    data-testid="input-time"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Select value={bookingData.duration} onValueChange={(value) => setBookingData({...bookingData, duration: value})}>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="8">8 hours (full day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Location</h3>
              <p className="text-gray-600">Where should our professional come to?</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="address"
                  placeholder="123 Main Street, Apartment 4B"
                  className="pl-10"
                  value={bookingData.address}
                  onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                  required
                  data-testid="input-address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Cape Town"
                  value={bookingData.city}
                  onChange={(e) => setBookingData({...bookingData, city: e.target.value})}
                  required
                  data-testid="input-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="8001"
                  value={bookingData.postalCode}
                  onChange={(e) => setBookingData({...bookingData, postalCode: e.target.value})}
                  required
                  data-testid="input-postal-code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Special Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific requirements or notes for the service provider..."
                value={bookingData.requirements}
                onChange={(e) => setBookingData({...bookingData, requirements: e.target.value})}
                rows={3}
                data-testid="textarea-requirements"
              />
            </div>
          </div>
        );

      case 4:
        const totalAmount = calculateAmount();
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment & Confirmation</h3>
              <p className="text-gray-600">Review your booking and complete payment</p>
            </div>
            
            {/* Booking Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{services.find(s => s.id === bookingData.service)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">{bookingData.date} at {bookingData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{bookingData.duration} hour(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{bookingData.address}, {bookingData.city}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">R{totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Payment Method</h4>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Secure Payment via Berry Events Bank</p>
                      <p className="text-sm text-green-700">Payment processed securely with escrow protection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p><strong>Confirmation will be sent to:</strong></p>
              <p>Email: {bookingData.email}</p>
              <p>Phone: {bookingData.phone}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Book Your Service
          </CardTitle>
          <div className="flex items-center justify-center space-x-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      currentStep > step ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6 border-t mt-6">
            <div>
              {currentStep > 1 && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  data-testid="button-previous"
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="ghost"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-next"
                  disabled={
                    (currentStep === 1 && (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone)) ||
                    (currentStep === 2 && (!bookingData.service || !bookingData.date || !bookingData.time)) ||
                    (currentStep === 3 && (!bookingData.address || !bookingData.city || !bookingData.postalCode))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-booking"
                >
                  Confirm & Pay R{calculateAmount()}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}