import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, Phone, Mail, ArrowLeft, Download, Share2, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import berryLogoPath from "@assets/PHOTO-2025-08-13-13-21-07_1756439170299.jpg";

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // In a real app, this would come from the booking data
  const bookingDetails = {
    bookingId: "BE-" + Date.now().toString().slice(-6),
    service: "House Cleaning",
    date: new Date(Date.now() + 86400000).toLocaleDateString('en-ZA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: "10:00 AM",
    duration: "2 hours",
    address: "123 Main Street, Cape Town, 8001",
    amount: 560,
    providerName: "Sarah Johnson",
    providerPhone: "+27 82 123 4567",
    customerEmail: "john.doe@example.com",
    customerPhone: "+27 123 456 7890"
  };

  // Clean, single-page receipt generation
  const generateCleanReceipt = () => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Berry Events Booking Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
          .booking-id { font-size: 24px; color: #2563eb; font-weight: bold; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .section h3 { margin: 0 0 10px 0; color: #374151; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .total { font-size: 20px; font-weight: bold; color: #059669; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Berry Events</h1>
          <h2>Booking Receipt</h2>
          <div class="booking-id">Reference: ${bookingDetails.bookingId}</div>
        </div>
        
        <div class="section">
          <h3>Service Details</h3>
          <div class="detail-row"><span>Service:</span><span>${bookingDetails.service}</span></div>
          <div class="detail-row"><span>Date:</span><span>${bookingDetails.date}</span></div>
          <div class="detail-row"><span>Time:</span><span>${bookingDetails.time} (${bookingDetails.duration})</span></div>
          <div class="detail-row"><span>Location:</span><span>${bookingDetails.address}</span></div>
        </div>
        
        <div class="section">
          <h3>Service Provider</h3>
          <div class="detail-row"><span>Provider:</span><span>${bookingDetails.providerName}</span></div>
          <div class="detail-row"><span>Contact:</span><span>${bookingDetails.providerPhone}</span></div>
        </div>
        
        <div class="section">
          <h3>Payment Summary</h3>
          <div class="detail-row total"><span>Total Paid:</span><span>R${bookingDetails.amount}</span></div>
          <div style="margin-top: 10px; font-size: 12px; color: #059669;">✓ Payment processed securely</div>
        </div>
        
        <div class="footer">
          <p><strong>Berry Events</strong> - Your trusted home services platform</p>
          <p>Customer Service: customercare@berryevents.co.za | +27 61 279 6476</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `berry-events-receipt-${bookingDetails.bookingId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded!",
      description: "Clean booking receipt saved to your downloads folder.",
    });
  };

  // WhatsApp sharing functionality
  const shareViaWhatsApp = () => {
    const message = `🏡 Berry Events Booking Confirmed!

📋 Reference: ${bookingDetails.bookingId}
🛠️ Service: ${bookingDetails.service}
📅 Date: ${bookingDetails.date}
⏰ Time: ${bookingDetails.time}
📍 Location: ${bookingDetails.address}
👤 Provider: ${bookingDetails.providerName}
💰 Amount: R${bookingDetails.amount}

✅ Booking confirmed and payment processed securely!`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "WhatsApp Opened!",
      description: "Share your booking details with friends and family.",
    });
  };

  // Email sharing functionality
  const shareViaEmail = () => {
    const subject = `Berry Events Booking Confirmation - ${bookingDetails.bookingId}`;
    const body = `Dear Friend,

I wanted to share my Berry Events booking details with you:

Booking Reference: ${bookingDetails.bookingId}
Service: ${bookingDetails.service}
Date & Time: ${bookingDetails.date} at ${bookingDetails.time}
Location: ${bookingDetails.address}
Provider: ${bookingDetails.providerName}
Amount Paid: R${bookingDetails.amount}

Berry Events made it so easy to book reliable home services!

Best regards`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    toast({
      title: "Email App Opened!",
      description: "Share your booking confirmation via email.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </CardTitle>
          <p className="text-gray-600">
            Your service has been successfully booked and payment processed.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Booking Reference */}
          <div className="text-center bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-xl font-bold text-blue-600" data-testid="booking-id">
              {bookingDetails.bookingId}
            </p>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">{bookingDetails.service}</p>
                <p className="text-sm text-gray-600">{bookingDetails.date}</p>
                <p className="text-sm text-gray-600">{bookingDetails.time} ({bookingDetails.duration})</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{bookingDetails.address}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">{bookingDetails.providerName}</p>
                <p className="text-sm text-gray-600">{bookingDetails.providerPhone}</p>
                <p className="text-sm text-gray-500">⭐ 4.8 rating • Your service provider</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Total Paid</p>
                <p className="text-xs text-green-700">✓ Secured by Berry Events Bank</p>
              </div>
              <p className="text-2xl font-bold text-green-600">R{bookingDetails.amount}</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>1. Confirmation email sent to {bookingDetails.customerEmail}</p>
              <p>2. Provider will contact you 24 hours before service</p>
              <p>3. Rate your experience after completion</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="flex-1"
                data-testid="button-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
              
              <Button
                onClick={generateCleanReceipt}
                variant="outline"
                className="flex-1"
                data-testid="button-download"
              >
                <Download className="h-4 w-4 mr-2" />
                Receipt
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={shareViaWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-share-whatsapp"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="flex-1"
                data-testid="button-share-email"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Customer Service */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>Need help? <strong>customercare@berryevents.co.za</strong> • <strong>+27 61 279 6476</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}