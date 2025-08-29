import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomerLiveTracking from "@/components/customer-live-tracking";
import { Search, MapPin, ArrowLeft } from "lucide-react";

export default function TrackingPage() {
  const [, params] = useRoute("/tracking/:bookingId");
  const [location, setLocation] = useLocation();
  const [manualBookingId, setManualBookingId] = useState("");
  
  const bookingId = params?.bookingId;

  const handleManualTracking = () => {
    if (manualBookingId.trim()) {
      setLocation(`/tracking/${encodeURIComponent(manualBookingId.trim())}`);
    }
  };

  const handleGoBack = () => {
    setLocation("/");
  };

  // If no booking ID provided, show search interface
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Track Your Service Provider</h1>
            <p className="text-gray-600">
              Enter your booking ID to see your provider's live location and estimated arrival time
            </p>
          </div>

          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Find Your Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-id">Booking ID</Label>
                <Input
                  id="booking-id"
                  placeholder="Enter your booking ID (e.g., BK-12345)"
                  value={manualBookingId}
                  onChange={(e) => setManualBookingId(e.target.value)}
                  data-testid="booking-id-input"
                />
                <p className="text-sm text-gray-600">
                  You can find your booking ID in your confirmation email or SMS
                </p>
              </div>
              
              <Button 
                onClick={handleManualTracking}
                className="w-full"
                disabled={!manualBookingId.trim()}
                data-testid="track-booking"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Track My Provider
              </Button>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto" />
                  <h3 className="font-medium text-blue-900">Real-Time Tracking</h3>
                  <p className="text-sm text-blue-700">
                    See your provider's live location and get accurate arrival estimates
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Search className="h-8 w-8 text-green-600 mx-auto" />
                  <h3 className="font-medium text-green-900">Easy to Use</h3>
                  <p className="text-sm text-green-700">
                    Simply enter your booking ID to start tracking immediately
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Button variant="outline" onClick={handleGoBack} data-testid="back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If booking ID provided, show tracking interface
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header with booking info */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
            <p className="text-gray-600">Booking ID: <span className="font-mono">{bookingId}</span></p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleGoBack} data-testid="back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation("/tracking")}
              data-testid="track-different"
            >
              <Search className="h-4 w-4 mr-2" />
              Track Different Booking
            </Button>
          </div>
        </div>

        {/* Live Tracking Component */}
        <CustomerLiveTracking bookingId={bookingId} />
      </div>
    </div>
  );
}