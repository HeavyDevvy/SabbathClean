import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Edit, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  Star,
  Phone,
  Mail,
  Building,
  ChefHat,
  Sparkles
} from "lucide-react";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onEditBooking: () => void;
  bookingData: any;
}

export default function BookingConfirmation({
  isOpen,
  onClose,
  onEditBooking,
  bookingData
}: BookingConfirmationProps) {
  const [showProviderDetails, setShowProviderDetails] = useState(false);

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'house-cleaning': return <Sparkles className="h-5 w-5" />;
      case 'garden-services': return <div className="h-5 w-5">🌿</div>;
      case 'chef-catering': return <ChefHat className="h-5 w-5" />;
      case 'plumbing': return <div className="h-5 w-5">🔧</div>;
      case 'electrical': return <div className="h-5 w-5">⚡</div>;
      case 'handyman': return <div className="h-5 w-5">🔨</div>;
      case 'painting': return <div className="h-5 w-5">🎨</div>;
      case 'waitering': return <User className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getServiceName = (serviceId: string) => {
    const services: { [key: string]: string } = {
      'house-cleaning': 'House Cleaning',
      'garden-services': 'Garden Services',
      'chef-catering': 'Chef & Catering',
      'plumbing': 'Plumbing',
      'electrical': 'Electrical',
      'handyman': 'Handyman',
      'painting': 'Painting',
      'waitering': 'Waitering'
    };
    return services[serviceId] || 'Service';
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return 'Not specified';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `${formattedDate} at ${time || 'Time TBD'}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <span>Booking Confirmed!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Your booking has been confirmed!
                </h3>
                <p className="text-green-700">
                  Booking Reference: <span className="font-mono font-bold">#{bookingData.bookingId}</span>
                </p>
                <p className="text-green-600 text-sm mt-2">
                  You'll receive a confirmation email shortly with all the details.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                {getServiceIcon(bookingData.serviceId)}
                <span>{getServiceName(bookingData.serviceId)}</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onEditBooking}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Booking
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Service Address</p>
                      <p className="text-gray-600">{bookingData.address || 'Not specified'}</p>
                      <p className="text-sm text-gray-500">Property Type: {bookingData.propertyType || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Date & Time</p>
                      <p className="text-gray-600">{formatDateTime(bookingData.preferredDate, bookingData.timePreference)}</p>
                      {bookingData.recurringSchedule !== 'one-time' && (
                        <Badge variant="secondary" className="mt-1">
                          {bookingData.recurringSchedule}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Total Cost</p>
                      <p className="text-2xl font-bold text-green-600">R{bookingData.totalCost}</p>
                      {bookingData.commission && (
                        <p className="text-sm text-gray-500">Platform fee: R{bookingData.commission}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Payment Method</p>
                      <p className="text-gray-600">Berry Events Bank</p>
                      <p className="text-sm text-gray-500">Secure escrow protection</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service-Specific Details */}
              {bookingData.serviceId === 'chef-catering' && (
                <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                    <ChefHat className="h-4 w-4 mr-2" />
                    Catering Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {bookingData.cuisineType && (
                      <div>
                        <span className="font-medium">Cuisine:</span> {bookingData.cuisineType}
                      </div>
                    )}
                    {bookingData.eventSize && (
                      <div>
                        <span className="font-medium">Event Size:</span> {bookingData.eventSize}
                      </div>
                    )}
                    {bookingData.selectedMenu && (
                      <div>
                        <span className="font-medium">Menu:</span> {bookingData.selectedMenu}
                      </div>
                    )}
                    {bookingData.dietaryRequirements?.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Dietary Requirements:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bookingData.dietaryRequirements.map((req: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {bookingData.selectedAddOns?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Selected Add-ons</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.selectedAddOns.map((addon: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {addon}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Details */}
          {bookingData.selectedProvider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Service Provider</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowProviderDetails(!showProviderDetails)}
                  >
                    {showProviderDetails ? 'Hide Details' : 'View Details'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <img
                    src={bookingData.selectedProvider.profileImage || '/placeholder-avatar.png'}
                    alt={bookingData.selectedProvider.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{bookingData.selectedProvider.name}</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold ml-1">{bookingData.selectedProvider.rating}</span>
                      </div>
                      <span className="text-gray-500">({bookingData.selectedProvider.reviews} reviews)</span>
                      <Badge variant="secondary">{bookingData.selectedProvider.experience}</Badge>
                    </div>
                    
                    {showProviderDetails && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{bookingData.selectedProvider.phone || 'Will be shared closer to service date'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{bookingData.selectedProvider.email || 'Contact through Berry Events'}</span>
                        </div>
                        {bookingData.selectedProvider.bio && (
                          <p className="text-sm text-gray-600 mt-2">{bookingData.selectedProvider.bio}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-semibold">Provider Confirmation</p>
                  <p className="text-sm text-gray-600">Your provider will confirm availability within 2 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-semibold">Service Preparation</p>
                  <p className="text-sm text-gray-600">Provider will contact you 24 hours before to confirm details</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-semibold">Service Completion</p>
                  <p className="text-sm text-gray-600">Payment is released after you confirm service completion</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={onClose}
            >
              Continue Browsing
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onEditBooking}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit This Booking
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.print()}
            >
              Print Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}