import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedHeader from "@/components/enhanced-header";
import { RescheduleDialog } from "@/components/reschedule-dialog";
import { CancelBookingDialog } from "@/components/cancel-booking-dialog";
import { ShareBookingDialog } from "@/components/share-booking-dialog";
import ModernServiceModal from "@/components/modern-service-modal";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Booking } from "@shared/schema";
import { mapBookingToReceiptData, generateCompletedBookingReceipt } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
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
  MoreVertical,
  Loader2,
  Repeat,
  Share2
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
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [cancelBooking, setCancelBooking] = useState<any>(null);
  const [rebookData, setRebookData] = useState<any>(null);
  const [shareBooking, setShareBooking] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch orders from the new cart-based booking system
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/orders', user?.id],
    queryFn: async () => {
      const accessToken = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      
      const res = await fetch('/api/orders', {
        headers,
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.statusText}`);
      }
      
      return res.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  // Transform orders with items into individual booking cards
  const bookings = orders.flatMap((order: any) => {
    if (!order.items || order.items.length === 0) {
      return [];
    }
    
    // Create a booking card for each order item (service)
    return order.items.map((item: any) => ({
      id: item.id,
      bookingNumber: order.orderNumber,
      serviceType: item.serviceName || item.serviceType,
      scheduledDate: item.scheduledDate,
      scheduledTime: item.scheduledTime,
      duration: item.duration || 2,
      status: order.status, // Use order status (confirmed, pending, completed, cancelled)
      address: item.serviceDetails?.address || "Address not provided",
      totalPrice: item.subtotal,
      specialInstructions: item.comments || item.serviceDetails?.specialRequests || "",
      // Additional fields from order
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      // Store order reference for actions
      orderId: order.id,
    }));
  });

  const upcomingBookings = bookings.filter((b: any) => 
    b.status === "confirmed" || b.status === "pending"
  );
  
  const pastBookings = bookings.filter((b: any) => 
    b.status === "completed" || b.status === "cancelled"
  );

  const renderBookingCard = (booking: any) => {
    const scheduledDate = format(new Date(booking.scheduledDate), "yyyy-MM-dd");
    
    return (
      <Card key={booking.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{booking.serviceType}</h3>
                <Badge className={`${getStatusColor(booking.status)} capitalize`}>
                  {getStatusIcon(booking.status)}
                  <span className="ml-1">{booking.status}</span>
                </Badge>
              </div>
              <p className="text-gray-600 mb-1">Booking #{booking.bookingNumber}</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{format(new Date(booking.scheduledDate), "MMMM d, yyyy")} at {booking.scheduledTime}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{booking.address}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold text-green-600">R{parseFloat(booking.totalPrice).toFixed(2)}</span>
              </div>
              {booking.specialInstructions && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {booking.specialInstructions}
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setRescheduleBooking({
                      id: booking.id,
                      service: booking.serviceType,
                      date: scheduledDate,
                      time: booking.scheduledTime
                    })}
                    data-testid={`button-reschedule-${booking.id}`}
                  >
                    Reschedule
                  </Button>
                </>
              )}
              {booking.status === "completed" && (
                <>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-1" />
                    Rate Service
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-purple-600 hover:text-purple-700"
                    onClick={() => setRebookData({
                      serviceId: booking.serviceType,
                      bookingData: booking
                    })}
                    data-testid={`button-book-again-${booking.id}`}
                  >
                    <Repeat className="h-4 w-4 mr-1" />
                    Book Again
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShareBooking({
                  id: booking.id,
                  bookingNumber: booking.bookingNumber,
                  service: booking.serviceType,
                  date: scheduledDate,
                  time: booking.scheduledTime,
                  address: booking.address,
                  price: `R${parseFloat(booking.totalPrice).toFixed(2)}`
                })}
                data-testid={`button-share-${booking.id}`}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                if (booking.status === "completed") {
                  try {
                    const receiptData = mapBookingToReceiptData(booking);
                    generateCompletedBookingReceipt(receiptData);
                    toast({
                      title: "Receipt Downloaded",
                      description: "Your booking receipt has been downloaded successfully.",
                    });
                  } catch (error) {
                    console.error("Error generating receipt:", error);
                    toast({
                      title: "Error",
                      description: "Failed to generate receipt. Please try again.",
                      variant: "destructive",
                    });
                  }
                } else {
                  setCancelBooking({
                    id: booking.id,
                    service: booking.serviceType,
                    date: scheduledDate,
                    time: booking.scheduledTime,
                    price: `R${parseFloat(booking.totalPrice).toFixed(2)}`
                  });
                }
              }}
              data-testid={`button-cancel-${booking.id}`}
            >
              {booking.status === "completed" ? "View Receipt" : "Cancel Booking"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader 
        onBookingClick={() => {}} 
        isAuthenticated={isAuthenticated}
        user={user || undefined}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your service bookings and appointments</p>
        </div>

        {/* Stats Cards */}
        {!isLoading && bookings.length > 0 && (
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
                  {pastBookings.filter((b: any) => b.status === "completed").length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  R{bookings.reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {bookings.filter((b: any) => b.customerRating).length > 0 
                    ? (bookings.reduce((sum: number, b: any) => sum + (b.customerRating || 0), 0) / bookings.filter((b: any) => b.customerRating).length).toFixed(1)
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tabs */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
        )}
      </div>

      {/* Reschedule Dialog */}
      {rescheduleBooking && (
        <RescheduleDialog
          isOpen={true}
          onClose={() => setRescheduleBooking(null)}
          booking={rescheduleBooking}
        />
      )}

      {/* Cancel Booking Dialog - Phase 4.3b */}
      {cancelBooking && (
        <CancelBookingDialog
          isOpen={true}
          onClose={() => setCancelBooking(null)}
          booking={cancelBooking}
        />
      )}

      {/* Re-book Modal - Phase 4.3c */}
      {rebookData && (
        <ModernServiceModal
          isOpen={true}
          onClose={() => setRebookData(null)}
          serviceId={rebookData.serviceId}
          onBookingComplete={(bookingData) => {
            queryClient.invalidateQueries({ queryKey: ['/api/bookings/customer'] });
            setRebookData(null);
          }}
          editBookingData={{
            propertyType: rebookData.bookingData.propertyType,
            address: rebookData.bookingData.address,
            gateCode: rebookData.bookingData.gateCode,
            preferredDate: rebookData.bookingData.scheduledDate,
            timePreference: rebookData.bookingData.scheduledTime,
            recurringSchedule: rebookData.bookingData.recurringSchedule || "one-time",
            specialRequests: rebookData.bookingData.specialInstructions,
          }}
        />
      )}

      {/* Share Booking Dialog - Phase 4.3d */}
      {shareBooking && (
        <ShareBookingDialog
          isOpen={true}
          onClose={() => setShareBooking(null)}
          booking={shareBooking}
        />
      )}
    </div>
  );
}