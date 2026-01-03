import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, Phone, Mail, ArrowLeft, Download, MessageCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import jsPDF from 'jspdf';
import berryLogoPath from "@assets/Untitled (Logo) (2)_1763529143099.png";
import { formatCurrency } from "@/lib/currency";

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get order_id from URL query params
  const [orderId, setOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Support both booking_id (new standard) and order_id/ref (legacy)
    const id = params.get("booking_id") || params.get("order_id") || params.get("ref");
    console.log('📄 CONFIRMATION PAGE - BOOKING ID FROM URL:', id);
    if (id) setOrderId(id);
  }, []);

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
    refetchInterval: (data) => {
      // Poll if booking is not yet confirmed (e.g. webhook delay)
      return data?.state?.status === 'PENDING' ? 2000 : false;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the booking details you're looking for.</p>
          <Button onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  // Map order data to display format
  // Note: API order items structure might vary, taking first item for main display
  const mainItem = order.items?.[0] || {};
  
  const bookingDetails = {
    bookingId: order.orderNumber || order.id,
    service: mainItem.serviceName || "Service",
    date: mainItem.scheduledDate ? new Date(mainItem.scheduledDate).toLocaleDateString('en-ZA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : "Date not set",
    time: mainItem.scheduledTime || "Time not set",
    duration: mainItem.duration ? `${mainItem.duration} hours` : "Duration not set",
    address: mainItem.serviceDetails?.address || order.eventLocation || "Location pending",
    amount: order.totalAmount,
    providerName: order.providerName || "Assigned Provider", // API might need to return this
    providerPhone: order.providerPhone || "Contact via App",
    customerEmail: order.userEmail || "your email", // API might need to return this
    customerPhone: order.userPhone || "your phone"
  };

  // Generate PDF receipt
  const generateCleanReceipt = () => {
    const pdf = new jsPDF();
    
    // Set up the PDF
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = 20;
    
    // Add Berry Events logo
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        
        // Add logo to PDF (centered, 30x30 size)
        const logoSize = 30;
        pdf.addImage(dataURL, 'JPEG', (pageWidth - logoSize) / 2, currentY, logoSize, logoSize);
      }
      
      currentY += 45; // logoSize + 15
      
      // Header - Berry Events branding
      pdf.setFontSize(20);
      pdf.setTextColor(124, 58, 237); // Purple color matching logo
      pdf.text('BERRY EVENTS', pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 12;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Booking Receipt', pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 20;
      
      // Continue with the rest of the PDF generation
      generatePDFContent(pdf, pageWidth, margin, currentY);
    };
    
    img.src = berryLogoPath;
  };
  
  // Separate function for PDF content generation
  const generatePDFContent = (pdf: jsPDF, pageWidth: number, margin: number, startY: number) => {
    let currentY = startY;
    
    // Booking Reference
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Booking Reference: ${bookingDetails.bookingId}`, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 25;
    
    // Service Details Section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Service Details', margin, currentY);
    
    currentY += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Service: ${bookingDetails.service}`, margin, currentY);
    
    currentY += 8;
    pdf.text(`Date: ${bookingDetails.date}`, margin, currentY);
    
    currentY += 8;
    pdf.text(`Time: ${bookingDetails.time} (${bookingDetails.duration})`, margin, currentY);
    
    currentY += 8;
    pdf.text(`Location: ${bookingDetails.address}`, margin, currentY);
    
    currentY += 20;
    
    // Service Provider Section
    pdf.setFont('helvetica', 'bold');
    pdf.text('Service Provider', margin, currentY);
    
    currentY += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Provider: ${bookingDetails.providerName}`, margin, currentY);
    
    currentY += 8;
    pdf.text(`Contact: ${bookingDetails.providerPhone}`, margin, currentY);
    
    currentY += 20;
    
    // Payment Summary Section
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Summary', margin, currentY);
    
    currentY += 15;
    pdf.setFontSize(16);
    pdf.setTextColor(5, 150, 105); // Green color
    pdf.text(`Total Paid: ${formatCurrency(bookingDetails.amount)}`, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('✓ Payment processed securely via Berry Events Bank', pageWidth / 2, currentY, { align: 'center' });
    
    // Footer
    currentY = pdf.internal.pageSize.getHeight() - 40;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Berry Events - Your trusted home services platform', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Customer Service: customercare@berryevents.co.za | +27 61 279 6476', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 8;
    pdf.text('Terms & Conditions apply. All services backed by Berry Events guarantee.', pageWidth / 2, currentY, { align: 'center' });
    
    // Save the PDF
    pdf.save(`berry-events-receipt-${bookingDetails.bookingId}.pdf`);
    
    toast({
      title: "PDF Receipt Downloaded!",
      description: "Your booking receipt has been saved as a PDF with logo.",
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
💰 Amount: ${formatCurrency(bookingDetails.amount)}

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
Amount Paid: ${formatCurrency(bookingDetails.amount)}

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
          {/* Berry Events Logo */}
          <div className="mx-auto mb-4">
            <img 
              src={berryLogoPath} 
              alt="Berry Events Logo" 
              className="h-20 w-auto mx-auto rounded-lg"
              data-testid="berry-logo"
            />
          </div>
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
              <p className="text-2xl font-bold text-green-600">{formatCurrency(bookingDetails.amount)}</p>
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
