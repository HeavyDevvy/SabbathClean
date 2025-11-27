import { useEffect, useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, Calendar, Clock, MapPin, Home, Shield, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { parseDecimal, formatCurrency } from "@/lib/currency";
import type { Order, OrderItem } from "@shared/schema";
import WhatsAppShareButton from "@/components/whatsapp-share-button";
import berryLogoPath from "@assets/Untitled (Logo) (2)_1763529143099.png";

// Helper to convert logo to DataURL for jsPDF
const loadImageAsDataURL = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function OrderConfirmation() {
  const [, params] = useRoute("/order-confirmation/:orderId");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const orderId = params?.orderId;
  
  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: ['/api/orders', orderId],
    enabled: !!orderId,
  });
  
  const bookingReference = useMemo(() => {
    if (!order) return "";
    return order.orderNumber || `BE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }, [order]);
  
  const generatePDF = async () => {
    if (!order) return;
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Header - Berry Events Branding (matching app header exactly)
      // Background color: #44062D (deep plum - same as app header)
      doc.setFillColor(68, 6, 45);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Add Berry Events Logo (left side, matching app header position)
      try {
        const logoDataURL = await loadImageAsDataURL(berryLogoPath);
        doc.addImage(logoDataURL, 'PNG', 15, 10, 20, 20);
      } catch (error) {
        console.warn('Failed to load logo for PDF, using text fallback:', error);
      }
      
      // "Berry Events" text next to logo (matching app header style)
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Berry Events', 38, 18);
      
      // Tagline below "Berry Events" in light beige (#EED1C4)
      doc.setTextColor(238, 209, 196);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('All your home services', 38, 24);
      
      doc.setTextColor(0, 0, 0);
      yPos = 50;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Booking Confirmation', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Booking Reference: ${bookingReference}`, 20, yPos);
      yPos += 6;
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
      doc.text(`Order Date: ${orderDate}`, 20, yPos);
      yPos += 15;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Service Details', 20, yPos);
      yPos += 8;
      
      order.items.forEach((item, index) => {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${item.serviceName}`, 20, yPos);
        yPos += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Date: ${new Date(item.scheduledDate).toLocaleDateString()} at ${item.scheduledTime}`, 25, yPos);
        yPos += 5;
        
        if (item.duration) {
          doc.text(`Duration: ${item.duration}`, 25, yPos);
          yPos += 5;
        }
        
        const serviceDetails = item.serviceDetails ? 
          (typeof item.serviceDetails === 'string' ? JSON.parse(item.serviceDetails) : item.serviceDetails) 
          : {};
        
        if (serviceDetails.address) {
          const locationText = `Location: ${serviceDetails.address}`;
          const splitLocation = doc.splitTextToSize(locationText, pageWidth - 50);
          doc.text(splitLocation, 25, yPos);
          yPos += splitLocation.length * 5;
        }
        
        yPos += 3;
        doc.setDrawColor(220, 220, 220);
        doc.line(25, yPos, pageWidth - 20, yPos);
        yPos += 5;
        
        // Price Breakdown
        const basePrice = parseDecimal(item.basePrice);
        const addOnsPrice = parseDecimal(item.addOnsPrice);
        const itemSubtotal = parseDecimal(item.subtotal);
        
        doc.setTextColor(0, 0, 0);
        doc.text('Base Service Price:', 25, yPos);
        doc.text(`R${basePrice.toFixed(2)}`, pageWidth - 40, yPos, { align: 'right' });
        yPos += 5;
        
        if (addOnsPrice > 0) {
          doc.text('Add-ons:', 25, yPos);
          doc.text(`R${addOnsPrice.toFixed(2)}`, pageWidth - 40, yPos, { align: 'right' });
          yPos += 5;
          
          // List add-ons
          if (item.selectedAddOns && Array.isArray(item.selectedAddOns) && item.selectedAddOns.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            item.selectedAddOns.forEach((addon: string) => {
              doc.text(`\u2022 ${addon}`, 30, yPos);
              yPos += 4;
            });
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
          }
        }
        
        doc.setDrawColor(220, 220, 220);
        doc.line(25, yPos, pageWidth - 20, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(197, 107, 134); // Berry Events accent color #C56B86
        doc.text('Service Subtotal:', 25, yPos);
        doc.text(`R${itemSubtotal.toFixed(2)}`, pageWidth - 40, yPos, { align: 'right' });
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      });
      
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Summary', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 20, yPos);
      doc.text(`R${parseDecimal(order.subtotal).toFixed(2)}`, pageWidth - 40, yPos, { align: 'right' });
      yPos += 6;
      
      doc.text('Platform Fee (15%):', 20, yPos);
      doc.text(`R${parseDecimal(order.platformFee).toFixed(2)}`, pageWidth - 40, yPos, { align: 'right' });
      yPos += 6;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', 20, yPos);
      doc.text(`R${parseDecimal(order.totalAmount).toFixed(2)}`, pageWidth - 40, yPos, { align: 'right' });
      yPos += 12;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const paymentInfo = order.paymentMethod === 'card' 
        ? `Card ending in ****${(order as any).cardLast4 || 'XXXX'}`
        : `Bank account ending in ****${(order as any).accountLast4 || 'XXXX'}`;
      doc.text(`Payment Method: ${paymentInfo}`, 20, yPos);
      yPos += 5;
      doc.text(`Payment Status: ${order.paymentStatus}`, 20, yPos);
      yPos += 15;
      
      doc.setFillColor(240, 235, 255);
      doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F');
      yPos += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 107, 134); // Berry Events accent color #C56B86
      doc.text('Berry Events Bank Protection', 25, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const protectionText = 'Your payment is held securely until all services are completed. Full refund guaranteed if services are not delivered as promised.';
      const splitText = doc.splitTextToSize(protectionText, pageWidth - 50);
      doc.text(splitText, 25, yPos);
      yPos += splitText.length * 4 + 10;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      yPos = pageHeight - 30;
      doc.text('Berry Events - All Your Home Services In One', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      doc.text('Email: support@berryevents.co.za | Phone: +27 (0) 123 456 789', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      doc.text('www.berryevents.co.za', pageWidth / 2, yPos, { align: 'center' });
      
      doc.save(`Berry-Events-Booking-${bookingReference}.pdf`);
      
      toast({
        title: "Receipt downloaded",
        description: "Your booking receipt has been saved",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download failed",
        description: "Failed to generate PDF receipt",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist</p>
          <Button onClick={() => navigate("/")} data-testid="button-back-home">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="confirmation-title">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your services have been successfully booked
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground" data-testid="booking-reference">
              Ref: {bookingReference}
            </span>
          </div>
        </div>
        
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Booked Services ({order.items.length})</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const serviceDetails = item.serviceDetails ? 
                (typeof item.serviceDetails === 'string' ? JSON.parse(item.serviceDetails) : item.serviceDetails) 
                : {};
              
              const basePrice = parseDecimal(item.basePrice);
              const addOnsPrice = parseDecimal(item.addOnsPrice);
              const itemSubtotal = parseDecimal(item.subtotal);
              
              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                  data-testid={`confirmed-service-${idx}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg" data-testid={`confirmed-service-name-${idx}`}>
                        {item.serviceName}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(item.scheduledDate).toLocaleDateString()}</span>
                          <Clock className="w-4 h-4 ml-4 mr-2" />
                          <span>{item.scheduledTime}</span>
                        </div>
                        {serviceDetails.address && (
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                            <span className="line-clamp-2">{serviceDetails.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <Badge className="bg-success/10 text-success hover:bg-success/10">
                          {item.status || 'Confirmed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>Base Service Price</span>
                      <span>R{basePrice.toFixed(2)}</span>
                    </div>
                    
                    {addOnsPrice > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Add-ons</span>
                        <span>R{addOnsPrice.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {item.selectedAddOns && Array.isArray(item.selectedAddOns) && item.selectedAddOns.length > 0 ? (
                      <div className="ml-4 space-y-1">
                        {(item.selectedAddOns as string[]).map((addon, addonIdx) => (
                          <div key={addonIdx} className="flex items-center text-xs text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            {addon}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    
                    {/* HOUSE CLEANING ONLY: Show tip if present */}
                    {parseDecimal(item.tipAmount || "0") > 0 && (
                      <div className="flex justify-between text-success text-sm">
                        <span>Provider Tip</span>
                        <span>R{parseDecimal(item.tipAmount || "0").toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-semibold text-primary">
                      <span>Service Subtotal</span>
                      <span>R{itemSubtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-3">
            {/* Use authoritative order values from backend, not recomputed */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Base Services ({order.items.length} {order.items.length === 1 ? 'service' : 'services'})</span>
              <span className="font-medium" data-testid="payment-base-services">
                {formatCurrency(order.items.reduce((sum, item) => sum + parseDecimal(item.basePrice), 0))}
              </span>
            </div>
            {(() => {
              const totalAddOns = order.items.reduce((sum, item) => sum + parseDecimal(item.addOnsPrice || "0"), 0);
              return totalAddOns > 0 ? (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Add-ons & Extras</span>
                  <span className="font-medium" data-testid="payment-add-ons">
                    {formatCurrency(totalAddOns)}
                  </span>
                </div>
              ) : null;
            })()}
            {(() => {
              // Calculate total discounts: (basePrice + addOns) - subtotal
              const totalDiscounts = order.items.reduce((sum, item) => {
                const itemBeforeDiscount = parseDecimal(item.basePrice) + parseDecimal(item.addOnsPrice || "0");
                const itemAfterDiscount = parseDecimal(item.subtotal);
                return sum + (itemBeforeDiscount - itemAfterDiscount);
              }, 0);
              return totalDiscounts > 0 ? (
                <div className="flex justify-between text-sm text-success">
                  <span>Discounts</span>
                  <span className="font-medium" data-testid="payment-discounts">-{formatCurrency(totalDiscounts)}</span>
                </div>
              ) : null;
            })()}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Services Subtotal</span>
              <span className="font-medium text-gray-900" data-testid="payment-services-subtotal">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Platform Fee (15%)</span>
              <span className="font-medium" data-testid="payment-platform-fee">
                {formatCurrency(order.platformFee)}
              </span>
            </div>
            {/* HOUSE CLEANING ONLY: Show total tips using backend-stored values */}
            {(() => {
              const totalTips = order.items.reduce((sum, item) => sum + parseDecimal(item.tipAmount || "0"), 0);
              return totalTips > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-success font-medium">Provider Tips</span>
                  <span className="font-medium text-success" data-testid="payment-tips">
                    {formatCurrency(totalTips)}
                  </span>
                </div>
              ) : null;
            })()}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Paid</span>
              <span className="text-primary" data-testid="payment-total">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="mt-4 text-sm text-gray-600 flex items-center">
              <span>Payment Status:</span>
              <Badge className="ml-2">{order.paymentStatus}</Badge>
            </div>
          </div>
        </Card>
        
        <Card className="mb-6 p-6" style={{ backgroundColor: '#F7F2EF', borderColor: '#EED1C4' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#44062D' }}>What's Next?</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#C56B86' }}></div>
              <p className="text-sm" style={{ color: '#3C0920' }}>
                <strong>Provider Assignment:</strong> Your service provider will be assigned within 24 hours. You'll receive their profile and contact details via email and SMS.
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#C56B86' }}></div>
              <p className="text-sm" style={{ color: '#3C0920' }}>
                <strong>Pre-Service Confirmation:</strong> Your provider will contact you 24 hours before your scheduled service to confirm details and answer any questions.
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#C56B86' }}></div>
              <p className="text-sm" style={{ color: '#3C0920' }}>
                <strong>Service Day:</strong> Your provider will arrive at the scheduled time with all necessary equipment and supplies to complete your service professionally.
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#C56B86' }}></div>
              <p className="text-sm" style={{ color: '#3C0920' }}>
                <strong>Post-Service Review:</strong> After completion, you'll receive a request to rate your experience and provide feedback to help us maintain our high-quality standards.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="mb-6 p-6 bg-muted border-border">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Berry Events Bank Protection</h3>
              <p className="text-sm text-muted-foreground">
                Your payment is held securely until all services are completed. 
                You'll receive a full refund if services are not delivered as promised.
                Our 15% platform fee ensures quality service and customer protection.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={generatePDF}
            variant="outline"
            className="flex-1"
            data-testid="button-download-receipt"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <WhatsAppShareButton
            bookingDetails={{
              serviceName: order.items.map(item => item.serviceName).join(', '),
              date: order.items[0]?.scheduledDate ? new Date(order.items[0].scheduledDate).toLocaleDateString() : '',
              time: order.items[0]?.scheduledTime || '',
              providerName: (order.items[0] as any)?.providerName,
              bookingReference: bookingReference,
              totalAmount: parseDecimal(order.totalAmount)
            }}
            variant="outline"
            className="flex-1"
          />
          <Button
            onClick={() => navigate("/")}
            className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
            data-testid="button-back-to-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
