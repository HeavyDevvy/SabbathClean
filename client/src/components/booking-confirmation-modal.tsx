import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  User, 
  CreditCard, 
  Star,
  Phone,
  Mail,
  Download,
  Share2,
  MessageCircle
} from "lucide-react";
import berryLogoPath from "@assets/PHOTO-2025-08-13-13-21-07_1756439170299.jpg";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any;
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  bookingData
}: BookingConfirmationModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!bookingData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateBookingReference = () => {
    return `BE${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  };

  const bookingRef = generateBookingReference();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          {/* Berry Events Logo */}
          <div className="mx-auto mb-4">
            <img 
              src={berryLogoPath} 
              alt="Berry Events Logo" 
              className="h-16 w-auto mx-auto mb-3"
              data-testid="berry-logo-modal"
            />
          </div>
          <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Booking Confirmed!
          </DialogTitle>
          <p className="text-gray-600">
            Your service has been successfully booked. Here are your booking details:
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Reference */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-1">Booking Reference</p>
                <p className="text-2xl font-bold text-green-800 tracking-wider">{bookingRef}</p>
                <p className="text-xs text-green-600 mt-1">Save this reference for your records</p>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-semibold">{bookingData.serviceName}</p>
                  {bookingData.cleaningType && (
                    <p className="text-sm text-gray-600 capitalize">
                      {bookingData.cleaningType.replace('-', ' ')} 
                      {bookingData.propertySize && ` • ${bookingData.propertySize.charAt(0).toUpperCase() + bookingData.propertySize.slice(1)} Property`}
                    </p>
                  )}
                  {bookingData.electricalIssue && (
                    <p className="text-sm text-gray-600">
                      Issue: {bookingData.electricalIssue.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-semibold">{formatDate(bookingData.preferredDate)}</p>
                  <p className="text-sm text-gray-600">{bookingData.timePreference}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Service Address
                </p>
                <p className="font-semibold">{bookingData.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Provider Details */}
          {bookingData.selectedProvider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Your Service Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">{bookingData.selectedProvider.name}</h4>
                      {bookingData.selectedProvider.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{bookingData.selectedProvider.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({bookingData.selectedProvider.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{bookingData.selectedProvider.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bookingData.selectedProvider.specializations?.map((spec: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Base Service</span>
                <span>R{bookingData.pricing?.basePrice || 0}</span>
              </div>
              {bookingData.pricing?.addOnsPrice > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons</span>
                  <span>R{bookingData.pricing.addOnsPrice}</span>
                </div>
              )}
              {bookingData.pricing?.materialsDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Materials Discount</span>
                  <span>-R{bookingData.pricing.materialsDiscount}</span>
                </div>
              )}
              {bookingData.pricing?.recurringDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Recurring Service Discount</span>
                  <span>-R{bookingData.pricing.recurringDiscount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span className="text-primary">R{bookingData.totalCost}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  <strong>Secured by Berry Events Bank</strong><br />
                  Your payment is protected until service completion
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-sm text-gray-600">You'll receive a detailed confirmation email within 5 minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Provider Contact</p>
                  <p className="text-sm text-gray-600">Your provider will contact you 24 hours before the service</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Service Completion</p>
                  <p className="text-sm text-gray-600">Rate your experience after the service is completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Berry Events Booking Confirmation',
                  text: `Booking confirmed: ${bookingData.serviceName} on ${bookingData.preferredDate}`,
                  url: window.location.href
                });
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Booking
          </Button>
          <Button 
            className="flex-1 bg-primary"
            onClick={onClose}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Got it, Thanks!
          </Button>
        </div>

        {/* Berry Events Customer Service */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t mt-6">
          <p className="mb-2 font-medium text-gray-700">Berry Events Customer Service</p>
          <p>Need help? Contact us at <strong>customerservice@berryevents.co.za</strong> or <strong>+27 61 279 6476</strong></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}