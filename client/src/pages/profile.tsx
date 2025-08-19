import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ServiceSpecificBooking from "@/components/service-specific-booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Star, Clock } from "lucide-react";

export default function Profile() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const openBooking = () => {
    setIsBookingOpen(true);
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
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
                <p className="text-neutral">Profile management features will be available here.</p>
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
