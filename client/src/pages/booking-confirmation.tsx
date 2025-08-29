import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, Phone, Mail, ArrowLeft, Download, Navigation } from "lucide-react";
import { Link, useLocation } from "wouter";
import berryLogoPath from "@assets/PHOTO-2025-08-13-13-21-07_1756439170299.jpg";

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();

  // In a real app, this would come from the booking data
  const bookingDetails = {
    bookingId: "BE-" + Date.now().toString().slice(-6),
    service: "House Cleaning",
    date: new Date(Date.now() + 86400000).toLocaleDateString('en-ZA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: "10:00 AM",
    duration: "2 hours",
    address: "123 Main Street, Cape Town, 8001",
    amount: 560,
    providerName: "Sarah Johnson",
    providerPhone: "+27 82 123 4567",
    customerEmail: "john.doe@example.com",
    customerPhone: "+27 123 456 7890"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          {/* Berry Events Logo */}
          <div className="mx-auto mb-4">
            <img 
              src={berryLogoPath} 
              alt="Berry Events Logo" 
              className="h-20 w-auto mx-auto mb-3"
              data-testid="berry-logo"
            />
          </div>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </CardTitle>
          <p className="text-gray-600">
            Your service has been successfully booked and payment processed.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Booking ID */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="text-2xl font-bold text-blue-600" data-testid="booking-id">
              {bookingDetails.bookingId}
            </p>
          </div>

          {/* Service Details */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Service Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Service</p>
                    <p className="text-gray-600">{bookingDetails.service}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-gray-600">{bookingDetails.date}</p>
                    <p className="text-gray-600">{bookingDetails.time} ({bookingDetails.duration})</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 md:col-span-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{bookingDetails.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Service Provider</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {bookingDetails.providerName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{bookingDetails.providerName}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{bookingDetails.providerPhone}</span>
                  </div>
                  <p className="text-sm text-gray-600">⭐ 4.8 rating • 127 reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Amount Paid</p>
                  <p className="text-sm text-green-700">✓ Payment processed securely via Berry Events Bank</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">R{bookingDetails.amount}</p>
                  <p className="text-sm text-gray-600">Escrow Protected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Details */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Confirmation Sent</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-yellow-600" />
                  <span>Email confirmation sent to: <strong>{bookingDetails.customerEmail}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-yellow-600" />
                  <span>SMS confirmation sent to: <strong>{bookingDetails.customerPhone}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">What Happens Next?</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-semibold">1.</span>
                <span>Your service provider will contact you 24 hours before the appointment to confirm details.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-semibold">2.</span>
                <span>They will arrive on time with all necessary tools and equipment.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-semibold">3.</span>
                <span>After service completion, you can rate and review your experience.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-semibold">4.</span>
                <span>Payment will be released to the provider after service completion.</span>
              </div>
            </div>
          </div>

          {/* Live Tracking Banner */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Live Provider Tracking</h3>
                    <p className="text-sm text-blue-700">Track your provider's location when they're en route</p>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation(`/tracking/${bookingDetails.bookingId}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-track-provider"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Track Provider
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => setLocation("/")}
              className="flex-1 bg-gray-600 hover:bg-gray-700"
              data-testid="button-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 border-gray-300"
              data-testid="button-download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          {/* Berry Events Customer Service */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p className="mb-2 font-medium text-gray-700">Berry Events Customer Service</p>
            <p>Need help? Contact us at <strong>customerservice@berryevents.co.za</strong> or <strong>+27 61 279 6476</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}