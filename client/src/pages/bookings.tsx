import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, Phone, Star, MessageSquare } from "lucide-react";
import MobileNavigation from "@/components/mobile-navigation";

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  providerRating: number;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
  providerPhone?: string;
  notes?: string;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock data - replace with actual API calls
  const mockBookings: Booking[] = [
    {
      id: "1",
      serviceName: "House Cleaning",
      providerName: "Nomsa Mbeki",
      providerRating: 4.8,
      date: "2025-08-25",
      time: "10:00",
      duration: "3 hours",
      location: "123 Sandton Drive, Sandton, Johannesburg",
      status: "upcoming",
      price: 840,
      providerPhone: "+27 82 123 4567",
      notes: "Deep clean kitchen and bathrooms"
    },
    {
      id: "2", 
      serviceName: "Chef & Catering",
      providerName: "Chef Thabo Mthembu",
      providerRating: 4.9,
      date: "2025-08-22",
      time: "18:00",
      duration: "4 hours",
      location: "456 Rosebank Ave, Rosebank, Johannesburg",
      status: "completed",
      price: 2200,
      notes: "Traditional South African braai for 15 guests"
    },
    {
      id: "3",
      serviceName: "Plumbing",
      providerName: "Mike van der Merwe",
      providerRating: 4.7,
      date: "2025-08-18",
      time: "14:00",
      duration: "2 hours",
      location: "789 Hyde Park Lane, Hyde Park, Johannesburg", 
      status: "cancelled",
      price: 560
    }
  ];

  const { data: bookings = mockBookings, isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      // In production, this would make an actual API call
      return mockBookings;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'completed': return <Star className="h-4 w-4" />;
      case 'cancelled': return <MessageSquare className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => 
    activeTab === 'all' || booking.status === activeTab
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage your service appointments and track their status
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any {activeTab !== 'all' ? activeTab : ''} bookings yet.
                  </p>
                  <Button>
                    Book a Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{booking.serviceName}</CardTitle>
                        <div className="flex items-center mt-2">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{booking.providerName}</span>
                          <div className="flex items-center ml-3">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{booking.providerRating}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">{new Date(booking.date).toLocaleDateString('en-ZA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</p>
                          <p className="text-sm text-gray-600">{booking.time} ({booking.duration})</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium text-sm">{booking.location}</p>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xl font-bold text-blue-600">
                        R{booking.price.toLocaleString()}
                      </div>
                      
                      <div className="flex gap-2">
                        {booking.status === 'upcoming' && (
                          <>
                            {booking.providerPhone && (
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-2" />
                                Contact
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {booking.status === 'completed' && (
                          <Button size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Rate Service
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'upcoming').length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                R{bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}