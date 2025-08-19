import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BookingModal from "@/components/booking-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, MapPin } from "lucide-react";

export default function Booking() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const openBooking = () => {
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBookingClick={openBooking} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Service</h1>
          <p className="text-lg text-neutral">Complete your booking in just 2 minutes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Ready to Book?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-neutral mb-6">Start your 2-minute booking process now to get matched with verified professionals in your area.</p>
                <Button 
                  onClick={openBooking}
                  size="lg"
                  className="bg-primary text-white hover:bg-blue-700"
                  data-testid="button-start-booking"
                >
                  Start Booking Process
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sample Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral">Service:</span>
                  <span className="font-medium">House Cleaning</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Duration:</span>
                  <span className="font-medium">3 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Rate:</span>
                  <span className="font-medium">R450/hour</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">R1,350</span>
                </div>
                <Button 
                  onClick={openBooking}
                  className="w-full" 
                  data-testid="button-confirm-booking"
                >
                  Start Booking
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Choose Sabboath?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Background verified professionals
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Full insurance coverage
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Satisfaction guarantee
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Same-day booking available
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
