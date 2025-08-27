import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedHeader from "@/components/enhanced-header";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Star,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  MoreVertical
} from "lucide-react";

// Mock booking data
const mockBookings = [
  {
    id: "1",
    service: "House Cleaning",
    provider: "Sarah Johnson",
    date: "2025-01-15",
    time: "09:00",
    duration: "3 hours",
    status: "confirmed",
    location: "123 Oak Street, Cape Town",
    price: 225,
    rating: 4.8,
    notes: "Deep cleaning, focus on kitchen and bathrooms"
  },
  {
    id: "2", 
    service: "Plumbing Services",
    provider: "Mike Williams",
    date: "2025-01-18",
    time: "14:00",
    duration: "2 hours",
    status: "pending",
    location: "456 Pine Avenue, Johannesburg", 
    price: 240,
    rating: 4.9,
    notes: "Fix leaking tap in main bathroom"
  },
  {
    id: "3",
    service: "Chef & Catering",
    provider: "Amara Okafor",
    date: "2025-01-12",
    time: "18:00", 
    duration: "4 hours",
    status: "completed",
    location: "789 Elm Drive, Durban",
    price: 650,
    rating: 5.0,
    notes: "Nigerian cuisine for 15 guests, halaal requirements"
  },
  {
    id: "4",
    service: "Garden Care",
    provider: "David Smith",
    date: "2025-01-20",
    time: "08:00",
    duration: "5 hours", 
    status: "confirmed",
    location: "321 Maple Road, Pretoria",
    price: 450,
    rating: 4.7,
    notes: "Lawn maintenance and hedge trimming"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-blue-100 text-blue-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "completed": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed": return <CheckCircle2 className="h-4 w-4" />;
    case "pending": return <Clock className="h-4 w-4" />;
    case "completed": return <CheckCircle2 className="h-4 w-4" />;
    case "cancelled": return <AlertCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingBookings = mockBookings.filter(b => 
    b.status === "confirmed" || b.status === "pending"
  );
  
  const pastBookings = mockBookings.filter(b => 
    b.status === "completed" || b.status === "cancelled"
  );

  const renderBookingCard = (booking: any) => (
    <Card key={booking.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{booking.service}</h3>
              <Badge className={`${getStatusColor(booking.status)} capitalize`}>
                {getStatusIcon(booking.status)}
                <span className="ml-1">{booking.status}</span>
              </Badge>
            </div>
            <p className="text-gray-600 mb-1">with {booking.provider}</p>
            <div className="flex items-center text-yellow-500 mb-2">
              <Star className="h-4 w-4 fill-current mr-1" />
              <span className="text-sm font-medium">{booking.rating}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">{booking.date} at {booking.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">{booking.duration}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{booking.location}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="text-sm font-semibold text-green-600">R{booking.price}</span>
            </div>
            {booking.notes && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {booking.notes}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            {booking.status === "confirmed" && (
              <>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  Reschedule
                </Button>
              </>
            )}
            {booking.status === "completed" && (
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-1" />
                Rate Service
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            {booking.status === "completed" ? "View Receipt" : "Cancel Booking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader onBookingClick={() => {}} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your service bookings and appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {upcomingBookings.length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {pastBookings.filter(b => b.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                R{mockBookings.reduce((sum, b) => sum + b.price, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {(mockBookings.reduce((sum, b) => sum + b.rating, 0) / mockBookings.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
            <TabsTrigger value="past">Past Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {upcomingBookings.length > 0 ? (
              <div>
                {upcomingBookings.map(renderBookingCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No upcoming bookings
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Ready to book your next service? Browse our available services.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white">
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            {pastBookings.length > 0 ? (
              <div>
                {pastBookings.map(renderBookingCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No past bookings
                  </h3>
                  <p className="text-gray-600">
                    Your completed bookings will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}