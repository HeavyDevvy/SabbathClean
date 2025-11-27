import { useState } from "react";
import { Star, Calendar, MapPin, Clock, Banknote, TrendingUp, Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import CustomerRatingModal from "./customer-rating-modal";

interface ProviderDashboardProps {
  providerId: string;
}

export default function ProviderDashboard({ providerId }: ProviderDashboardProps) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Fetch provider's completed bookings
  interface ProviderBookingsResponse { bookings: any[] }
  const { data: bookings, isLoading: bookingsLoading } = useQuery<ProviderBookingsResponse>({
    queryKey: [`/api/providers/${providerId}/bookings?status=completed`],
  });

  // Fetch provider statistics
  interface ProviderStats {
    completedJobs?: number;
    monthlyEarnings?: number;
    averageRating?: number;
    totalCustomers?: number;
  }
  const { data: stats } = useQuery<ProviderStats>({
    queryKey: [`/api/providers/${providerId}/stats`],
  });

  // Fetch customer reviews submitted by this provider
  interface CustomerReviewsResponse { reviews?: any[] }
  const { data: customerReviews } = useQuery<CustomerReviewsResponse>({
    queryKey: [`/api/providers/${providerId}/customer-reviews`],
  });

  const handleRateCustomer = (booking: any) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  const recentBookings = bookings?.bookings?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider Dashboard</h1>
          <p className="text-gray-600">Manage your services and rate your customers</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {stats?.completedJobs || 0} Jobs Completed
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Banknote className="h-5 w-5 text-[#44062D]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-bold">R{stats?.monthlyEarnings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <p className="text-xl font-bold">{stats?.averageRating || '5.0'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-xl font-bold">{stats?.totalCustomers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reviews Given</p>
                <p className="text-xl font-bold">{customerReviews?.reviews?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Bookings - Rate Your Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading bookings...</p>
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {booking.customer?.firstName?.[0]}{booking.customer?.lastName?.[0]}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {booking.customer?.firstName} {booking.customer?.lastName}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.address}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {booking.serviceType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold text-green-600">R{booking.totalPrice}</p>
                            <p className="text-xs text-gray-500">{booking.bookingNumber}</p>
                          </div>
                          {booking.hasCustomerReview ? (
                            <Badge variant="secondary" className="text-xs">
                              Review Submitted
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleRateCustomer(booking)}
                              data-testid={`rate-customer-${booking.id}`}
                            >
                              Rate Customer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed bookings yet</h3>
                  <p className="text-gray-600">Complete some services to start rating your customers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews You've Submitted</CardTitle>
            </CardHeader>
          <CardContent>
              { (customerReviews?.reviews ?? []).length > 0 ? (
                <div className="space-y-4">
                  {(customerReviews?.reviews ?? []).map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {review.customer?.firstName?.[0]}{review.customer?.lastName?.[0]}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">
                              {review.customer?.firstName} {review.customer?.lastName}
                            </h5>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {review.booking?.serviceType}
                              </Badge>
                              {review.isPrivate && (
                                <Badge variant="secondary" className="text-xs">
                                  Private
                                </Badge>
                              )}
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customer reviews yet</h3>
                  <p className="text-gray-600">Start rating your customers to build your feedback profile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Banknote className="h-12 w-12 text-[#44062D] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Earnings tracking coming soon</h3>
                <p className="text-gray-600">View detailed earnings breakdowns and payment history</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Rating Modal */}
      {showRatingModal && selectedBooking && (
        <CustomerRatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          customer={selectedBooking.customer}
        />
      )}
    </div>
  );
}
