import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import EnhancedHeader from "@/components/enhanced-header";
import { RescheduleDialog } from "@/components/reschedule-dialog";
import { CancelBookingDialog } from "@/components/cancel-booking-dialog";
import { ShareBookingDialog } from "@/components/share-booking-dialog";
import { ChatDialog } from "@/components/chat-dialog";
import ModernServiceModal from "@/components/modern-service-modal";
import WhatsAppShareButton from "@/components/whatsapp-share-button";
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
  Share2,
  MessageCircle,
  X
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
  const [shareBooking, setShareBooking] = useState<any>(null);
  const [chatBooking, setChatBooking] = useState<any>(null);
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  
  // EXACT same state management as Profile page for "Book Now"
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [prefillData, setPrefillData] = useState<any>(null);
  
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
      // Provider information for chat feature
      providerId: item.providerId,
      providerName: item.providerName,
      // Additional fields from order
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      // Store order reference for actions
      orderId: order.id,
      // Store full service details for rebooking
      serviceDetails: item.serviceDetails,
      selectedAddOns: item.selectedAddOns || [],
    }));
  });

  // Helper function to check if a booking is in the past
  const isBookingInPast = (booking: any): boolean => {
    if (!booking.scheduledDate || !booking.scheduledTime) {
      return false;
    }
    
    try {
      // Combine date and time to create a datetime
      const [hours, minutes] = booking.scheduledTime.split(':');
      const bookingDateTime = new Date(booking.scheduledDate);
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Compare with current time
      return bookingDateTime < new Date();
    } catch (error) {
      console.error('Error parsing booking date/time:', error);
      return false;
    }
  };

  // Filter bookings based on date/time and status
  const upcomingBookings = bookings.filter((b: any) => {
    // Check status first - completed/cancelled/in-progress always go to past
    const isPastStatus = b.status === "completed" || b.status === "cancelled" || b.status === "in-progress";
    
    // Upcoming = NOT past status AND NOT past date
    return !isPastStatus && !isBookingInPast(b);
  });
  
  const pastBookings = bookings.filter((b: any) => {
    // Past = completed/cancelled/in-progress status OR date/time is in the past
    const isPastStatus = b.status === "completed" || b.status === "cancelled" || b.status === "in-progress";
    return isPastStatus || isBookingInPast(b);
  });

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
              {/* For PAST bookings: Show ONLY "Review your berry" and "Re-book" */}
              {(booking.status === "completed" || isBookingInPast(booking)) && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReviewBooking(booking)}
                    data-testid={`button-review-${booking.id}`}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Review your berry
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-purple-600 hover:text-purple-700"
                    onClick={() => {
                      // EXACT same flow as "Book Now" on Profile page
                      setSelectedServiceId(booking.serviceType);
                      setPrefillData(booking);
                      setIsBookingOpen(true);
                    }}
                    data-testid={`button-rebook-${booking.id}`}
                  >
                    <Repeat className="h-4 w-4 mr-1" />
                    Re-book
                  </Button>
                </>
              )}

              {/* For UPCOMING bookings: Show all action buttons */}
              {!(booking.status === "completed" || isBookingInPast(booking)) && (
                <>
                  {/* Show chat for all active bookings */}
                  {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "in-progress") && (
                    booking.providerId ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setChatBooking({
                          id: booking.id,
                          customerId: user?.id,
                          providerId: booking.providerId,
                          providerName: booking.providerName || 'Provider',
                          customerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer'
                        })}
                        data-testid={`button-chat-${booking.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                        title="Chat will be available once a provider is assigned to your booking"
                        data-testid={`button-chat-disabled-${booking.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat (Provider Pending)
                      </Button>
                    )
                  )}
                  {booking.status === "confirmed" && (
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
                  <WhatsAppShareButton
                    bookingDetails={{
                      serviceName: booking.serviceType,
                      date: format(new Date(booking.scheduledDate), "MMMM d, yyyy"),
                      time: booking.scheduledTime,
                      providerName: booking.providerName,
                      bookingReference: booking.bookingNumber,
                      totalAmount: parseFloat(booking.totalPrice)
                    }}
                    variant="outline"
                    size="sm"
                  />
                </>
              )}
            </div>
            
            {/* Cancel/Receipt button - only show for upcoming bookings */}
            {!(booking.status === "completed" || isBookingInPast(booking)) && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setCancelBooking({
                    id: booking.id,
                    service: booking.serviceType,
                    date: scheduledDate,
                    time: booking.scheduledTime,
                    price: `R${parseFloat(booking.totalPrice).toFixed(2)}`
                  });
                }}
                data-testid={`button-cancel-${booking.id}`}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader 
        onBookingClick={() => {}} 
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

      {/* Re-book Modal - EXACT same pattern as Profile page "Book Now" */}
      <ModernServiceModal 
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedServiceId("");
          setPrefillData(null);
        }}
        serviceId={selectedServiceId}
        onServiceSelect={(serviceId: string, prefillData?: any) => {
          setSelectedServiceId(serviceId);
          setPrefillData(prefillData || null);
        }}
        onBookingComplete={(bookingData: any) => {
          console.log("Booking completed:", bookingData);
          setIsBookingOpen(false);
          setSelectedServiceId("");
          setPrefillData(null);
          queryClient.invalidateQueries({ queryKey: ['/api/orders', user?.id] });
        }}
        recentOrders={orders}
        prefillFromRecent={prefillData}
      />

      {/* Share Booking Dialog - Phase 4.3d */}
      {shareBooking && (
        <ShareBookingDialog
          isOpen={true}
          onClose={() => setShareBooking(null)}
          booking={shareBooking}
        />
      )}

      {/* Chat Dialog */}
      {chatBooking && user && (
        <ChatDialog
          open={true}
          onOpenChange={(open) => !open && setChatBooking(null)}
          bookingId={chatBooking.id}
          customerId={chatBooking.customerId}
          providerId={chatBooking.providerId}
          customerName={chatBooking.customerName}
          providerName={chatBooking.providerName}
          currentUserId={user.id}
        />
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewBerryModal
          isOpen={true}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          user={user}
        />
      )}
    </div>
  );
}

// Review Modal Component
interface ReviewBerryModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  user: any;
}

function ReviewBerryModal({ isOpen, onClose, booking, user }: ReviewBerryModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Select at least 1 star to submit your review",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: send review to backend when API exists
      // For now, log to console and show success message
      console.log("TODO: send review and comments to backend", {
        bookingId: booking.id,
        providerId: booking.providerId,
        rating: rating,
        comments: comments || null,
        serviceType: booking.serviceType,
      });

      toast({
        title: "Review Submitted",
        description: `Thank you for rating ${booking.providerName || 'your provider'} ${rating} star${rating > 1 ? 's' : ''}!`,
      });

      // Close modal after successful submission
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review your berry</DialogTitle>
          <DialogDescription>
            How was your experience with {booking.providerName || 'your service provider'}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Details */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {booking.providerName || 'Service Provider'}
              </h3>
              <p className="text-sm text-gray-600">{booking.serviceType}</p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="space-y-3 border-t border-b py-4">
            <h4 className="font-semibold text-gray-900">Booking Summary</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{format(new Date(booking.scheduledDate), "MMMM d, yyyy")} at {booking.scheduledTime}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{booking.duration} hour{booking.duration > 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{booking.address}</span>
              </div>

              {booking.selectedAddOns && booking.selectedAddOns.length > 0 && (
                <div className="flex items-start text-gray-600">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Add-ons:</span>
                    <div className="mt-1">
                      {booking.selectedAddOns.map((addon: string, idx: number) => (
                        <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {addon}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="font-semibold text-green-600">
                  R{parseFloat(booking.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-center">Rate Your Experience</h4>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  data-testid={`star-${star}`}
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {rating === 0 ? 'Select a rating' : rating === 1 ? '1 star' : `${rating} stars`}
            </p>
          </div>

          {/* Comments Field */}
          <div className="space-y-2">
            <label htmlFor="review-comments" className="block text-sm font-medium text-gray-900">
              Comments (optional)
            </label>
            <textarea
              id="review-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your experience with this service provider..."
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              data-testid="textarea-review-comments"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting || rating === 0}
              data-testid="button-submit-review"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
