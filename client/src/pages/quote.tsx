import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  User, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Star,
  Shield,
  CreditCard
} from "lucide-react";
import { useLocation } from "wouter";
import berryLogoPath from "@assets/Untitled (Logo) (2)_1763529143099.png";

interface QuoteDetails {
  quoteId: string;
  service: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerName: string;
  providerRating: number;
  providerCompletedJobs: number;
  serviceDetails: Record<string, any>;
  pricing: {
    baseRate: number;
    additionalCharges: Array<{ description: string; amount: number }>;
    platformFee: number;
    total: number;
  };
  validUntil: string;
  estimatedDuration: string;
}

export default function Quote() {
  const [, setLocation] = useLocation();
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const generateQuote = async () => {
      // Get query parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      
      // Simulate quote generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock quote details
      const mockQuote: QuoteDetails = {
        quoteId: `QT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        service: urlParams.get('service') || 'House Cleaning',
        category: urlParams.get('category') || 'cleaning',
        date: urlParams.get('date') || new Date(Date.now() + 86400000).toLocaleDateString(),
        time: urlParams.get('time') || '10:00 AM',
        duration: urlParams.get('duration') || '2-3 hours',
        location: urlParams.get('location') || '123 Oak Street, Cape Town, 8001',
        customerName: urlParams.get('customerName') || 'John Doe',
        customerEmail: urlParams.get('customerEmail') || 'john.doe@example.com',
        customerPhone: urlParams.get('customerPhone') || '+27 82 123 4567',
        providerName: 'Sarah Johnson',
        providerRating: 4.8,
        providerCompletedJobs: 127,
        serviceDetails: {
          propertySize: urlParams.get('propertySize') || 'Medium (3-4 bedrooms)',
          specialRequests: urlParams.get('specialRequests') || 'Deep cleaning of kitchen and bathrooms',
          frequency: urlParams.get('frequency') || 'One-time'
        },
        pricing: {
          baseRate: parseInt(urlParams.get('baseRate') || '200'),
          additionalCharges: [
            { description: 'Deep cleaning surcharge', amount: 50 },
            { description: 'Supply cleaning materials', amount: 25 }
          ],
          platformFee: Math.round((parseInt(urlParams.get('baseRate') || '200') + 75) * 0.15),
          total: Math.round((parseInt(urlParams.get('baseRate') || '200') + 75) * 1.15)
        },
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('en-ZA', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        estimatedDuration: '2-3 hours'
      };

      setQuoteDetails(mockQuote);
      setIsLoading(false);
    };

    generateQuote();
  }, []);

  const handleAcceptQuote = async () => {
    if (!quoteDetails) return;
    
    setIsAccepting(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to payment with quote details
    const paymentParams = new URLSearchParams({
      quoteId: quoteDetails.quoteId,
      service: quoteDetails.service,
      date: quoteDetails.date,
      time: quoteDetails.time,
      location: quoteDetails.location,
      total: quoteDetails.pricing.total.toString(),
      provider: quoteDetails.providerName
    });
    
    setLocation(`/payment?${paymentParams.toString()}`);
  };

  const handleRequestChanges = () => {
    // Go back to booking form with current details
    setLocation('/booking');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Quote</h2>
              <p className="text-gray-600">Please wait while we calculate pricing and find the best provider...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quoteDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quote Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't generate a quote. Please try booking again.</p>
              <Button onClick={() => setLocation('/')} data-testid="button-back-home">
                Go Back Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4" data-testid="page-quote">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={berryLogoPath} 
            alt="Berry Events Logo" 
            className="h-16 w-auto mx-auto mb-4"
            data-testid="berry-logo"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Service Quote</h1>
          <p className="text-gray-600">Review the details and pricing for your service request</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Quote #{quoteDetails.quoteId}</CardTitle>
                      <p className="text-gray-600">{quoteDetails.service}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800" data-testid="quote-status">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Ready for Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Service Date</p>
                      <p className="text-gray-600">{quoteDetails.date} at {quoteDetails.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-gray-600">{quoteDetails.estimatedDuration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{quoteDetails.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Valid Until</p>
                      <p className="text-gray-600">{quoteDetails.validUntil}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Assigned Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{quoteDetails.providerName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{quoteDetails.providerRating} rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{quoteDetails.providerCompletedJobs} jobs completed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(quoteDetails.serviceDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Pricing Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Rate</span>
                    <span>R{quoteDetails.pricing.baseRate}</span>
                  </div>
                  
                  {quoteDetails.pricing.additionalCharges.map((charge, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{charge.description}</span>
                      <span>R{charge.amount}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (15%)</span>
                    <span>R{quoteDetails.pricing.platformFee}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-green-600" data-testid="quote-total">R{quoteDetails.pricing.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleAcceptQuote}
                disabled={isAccepting}
                data-testid="button-accept-quote"
              >
                {isAccepting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Accept Quote & Pay
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleRequestChanges}
                data-testid="button-request-changes"
              >
                Request Changes
              </Button>
            </div>

            {/* Trust Indicators */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Berry Events Protection</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified providers only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}