import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EnhancedHeader from "@/components/enhanced-header";
import { useAuth } from "@/hooks/useAuth";
import { 
  CheckCircle2,
  CreditCard,
  Calendar,
  MapPin,
  User,
  Clock,
  Phone,
  Mail,
  Home,
  ArrowRight,
  Download,
  Share2
} from "lucide-react";
import berryLogoPath from "@assets/Untitled (Logo) (2)_1763529143099.png";

interface BookingDetails {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  totalPrice: number;
  basePrice: number;
  additionalCharges: Array<{ description: string; amount: number }>;
  status: 'processing' | 'confirmed' | 'failed';
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Simulate payment processing and fetch booking details
    const processPayment = async () => {
      setIsLoading(true);
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock booking details - in real app this would come from API
      const mockBooking: BookingDetails = {
        id: `BK${Date.now()}`,
        service: urlParams.get('service') || 'House Cleaning',
        provider: 'Sarah Johnson',
        date: urlParams.get('date') || '2025-01-15',
        time: urlParams.get('time') || '09:00',
        duration: '3 hours',
        location: urlParams.get('location') || '123 Oak Street, Cape Town',
        basePrice: parseInt(urlParams.get('basePrice') || '225'),
        totalPrice: parseInt(urlParams.get('total') || '225'),
        additionalCharges: urlParams.get('ingredientSource') === 'chef-brings' 
          ? [{ description: 'Chef-sourced ingredients', amount: 150 }]
          : [],
        status: 'confirmed',
        paymentMethod: 'Card ending in ****4567',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+27 82 123 4567'
      };

      setBookingDetails(mockBooking);
      setIsLoading(false);
    };

    processPayment();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader 
          onBookingClick={() => {}} 
          isAuthenticated={isAuthenticated}
          user={user || undefined}
        />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your booking...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader 
          onBookingClick={() => {}} 
          isAuthenticated={isAuthenticated}
          user={user || undefined}
        />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't find the booking details.</p>
              <Button onClick={() => setLocation('/')}>Return Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader 
        onBookingClick={() => {}} 
        isAuthenticated={isAuthenticated}
        user={user || undefined}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          {/* Berry Events Logo */}
          <div className="mx-auto mb-4">
            <img 
              src={berryLogoPath} 
              alt="Berry Events Logo" 
              className="h-20 w-auto mx-auto mb-3"
              data-testid="berry-logo-payment"
            />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Your booking has been confirmed</p>
          <Badge className="bg-green-100 text-green-800 mt-4">
            Booking ID: {bookingDetails.id}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service</label>
                    <p className="text-lg font-semibold text-gray-900">{bookingDetails.service}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Provider</label>
                    <p className="text-lg font-semibold text-gray-900">{bookingDetails.provider}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{bookingDetails.date} at {bookingDetails.time}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <div className="flex items-center text-gray-900">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{bookingDetails.duration}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{bookingDetails.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{bookingDetails.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{bookingDetails.customerEmail}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center text-gray-900">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{bookingDetails.customerPhone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Service</span>
                    <span className="font-medium">R{bookingDetails.basePrice}</span>
                  </div>
                  
                  {bookingDetails.additionalCharges.map((charge, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{charge.description}</span>
                      <span className="font-medium">R{charge.amount}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid</span>
                    <span className="text-green-600">R{bookingDetails.totalPrice}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Payment method: {bookingDetails.paymentMethod}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full hover:opacity-90 text-white"
                style={{ backgroundColor: '#8B4789' }}
                onClick={() => setLocation('/bookings')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View All Bookings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Booking Details
              </Button>
            </div>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• You'll receive a confirmation email shortly</p>
                <p>• Your provider will contact you 24 hours before the appointment</p>
                <p>• You can reschedule or cancel up to 4 hours before the service</p>
                <p>• Rate your experience after completion</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Berry Events Customer Service */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t mt-8">
          <p className="mb-2 font-medium text-gray-700">Berry Events Customer Service</p>
          <p>Need help? Contact us at <strong>customerservice@berryevents.co.za</strong> or <strong>+27 61 279 6476</strong></p>
        </div>
      </div>
    </div>
  );
}