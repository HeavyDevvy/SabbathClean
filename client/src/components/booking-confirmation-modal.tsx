import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  CreditCard, 
  Star,
  Phone,
  Mail,
  Download,
  Share2,
  MessageCircle,
  CalendarPlus
} from "lucide-react";
import berryLogoPath from "@assets/PHOTO-2025-08-13-13-21-07_1756439170299.jpg";
import { generateBookingReceipt } from "@/lib/pdfGenerator";
import { downloadCalendarInvite } from "@/lib/calendarGenerator";
import { useToast } from "@/hooks/use-toast";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any | any[];
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  bookingData
}: BookingConfirmationModalProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  
  // Persist booking reference so it doesn't change on re-renders
  // Must be called before any conditional returns to follow Rules of Hooks
  const bookingRef = useMemo(() => {
    return `BE${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  }, []);

  if (!bookingData) return null;

  // Support both single and multi-service bookings
  const bookings = Array.isArray(bookingData) ? bookingData : [bookingData];
  const isMultiService = bookings.length > 1;
  const primaryBooking = bookings[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate total cost across all services
  const totalCost = bookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
  const totalBasePrice = bookings.reduce((sum, booking) => sum + (booking.pricing?.basePrice || 0), 0);
  const totalAddOns = bookings.reduce((sum, booking) => sum + (booking.pricing?.addOnsPrice || 0), 0);
  const totalDiscounts = bookings.reduce((sum, booking) => 
    sum + (booking.pricing?.materialsDiscount || 0) + (booking.pricing?.recurringDiscount || 0), 0
  );

  const handleDownloadReceipt = () => {
    try {
      generateBookingReceipt(bookingData, bookingRef);
      toast({
        title: "Receipt downloaded",
        description: "Your booking receipt has been downloaded successfully."
      });
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Unable to generate receipt. Please try again."
      });
    }
  };

  const handleDownloadCalendar = () => {
    try {
      downloadCalendarInvite(bookingData, bookingRef);
      toast({
        title: "Calendar invite downloaded",
        description: "Add this event to your calendar to never miss your appointment."
      });
    } catch (error) {
      console.error("Error generating calendar invite:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Unable to generate calendar invite. Please try again."
      });
    }
  };

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
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  Service Details
                </span>
                {isMultiService && (
                  <Badge className="bg-green-600">{bookings.length} Services</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMultiService ? (
                <>
                  {bookings.map((booking, index) => (
                    <div key={index} className={`${index > 0 ? 'pt-4 border-t' : ''}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Service {index + 1}</p>
                          <p className="font-semibold">{booking.serviceName}</p>
                          {booking.cleaningType && (
                            <p className="text-sm text-gray-600 capitalize">
                              {booking.cleaningType.replace('-', ' ')} 
                              {booking.propertySize && ` • ${booking.propertySize.charAt(0).toUpperCase() + booking.propertySize.slice(1)} Property`}
                            </p>
                          )}
                          {booking.electricalIssue && (
                            <p className="text-sm text-gray-600">
                              Issue: {booking.electricalIssue.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cost</p>
                          <p className="font-semibold text-primary">R{booking.totalCost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold">{formatDate(primaryBooking.preferredDate)}</p>
                      <p className="text-sm text-gray-600">{primaryBooking.timePreference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Service Address
                      </p>
                      <p className="font-semibold">{primaryBooking.address}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-semibold">{primaryBooking.serviceName}</p>
                      {primaryBooking.cleaningType && (
                        <p className="text-sm text-gray-600 capitalize">
                          {primaryBooking.cleaningType.replace('-', ' ')} 
                          {primaryBooking.propertySize && ` • ${primaryBooking.propertySize.charAt(0).toUpperCase() + primaryBooking.propertySize.slice(1)} Property`}
                        </p>
                      )}
                      {primaryBooking.electricalIssue && (
                        <p className="text-sm text-gray-600">
                          Issue: {primaryBooking.electricalIssue.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold">{formatDate(primaryBooking.preferredDate)}</p>
                      <p className="text-sm text-gray-600">{primaryBooking.timePreference}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Service Address
                    </p>
                    <p className="font-semibold">{primaryBooking.address}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Provider Details */}
          {primaryBooking.selectedProvider && (
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
                      <h4 className="font-semibold text-lg">{primaryBooking.selectedProvider.name}</h4>
                      {primaryBooking.selectedProvider.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{primaryBooking.selectedProvider.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({primaryBooking.selectedProvider.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{primaryBooking.selectedProvider.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {primaryBooking.selectedProvider.specializations?.map((spec: string, index: number) => (
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
                <span>Base Service{isMultiService ? 's' : ''}</span>
                <span>R{totalBasePrice}</span>
              </div>
              {totalAddOns > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons</span>
                  <span>R{totalAddOns}</span>
                </div>
              )}
              {totalDiscounts > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Total Discounts</span>
                  <span>-R{totalDiscounts}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span className="text-primary">R{totalCost}</span>
              </div>
              {isMultiService && (
                <p className="text-xs text-gray-500 italic text-center">
                  Combined total for {bookings.length} services
                </p>
              )}
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
        <div className="flex flex-col gap-3 pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDownloadReceipt}
              data-testid="button-download-receipt"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDownloadCalendar}
              data-testid="button-download-calendar"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Berry Events Booking Confirmation',
                    text: `Booking confirmed: ${isMultiService ? bookings.length + ' services' : primaryBooking.serviceName} on ${primaryBooking.preferredDate}`,
                    url: window.location.href
                  });
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <Button 
            className="w-full bg-primary"
            onClick={onClose}
            data-testid="button-close-confirmation"
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