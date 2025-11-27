import { jsPDF } from "jspdf";
// Avoid strict schema typing for runtime payloads
import berryLogoPath from "@assets/Untitled (Logo) (2)_1763529143099.png";

// Helper function to convert image to DataURL for jsPDF
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

interface BookingData {
  serviceName: string;
  preferredDate: string;
  timePreference: string;
  address: string;
  totalCost: number;
  pricing?: {
    basePrice: number;
    addOnsPrice?: number;
    materialsDiscount?: number;
    recurringDiscount?: number;
  };
  selectedProvider?: {
    name: string;
    rating: number;
    reviews: number;
    verified: boolean;
  };
  selectedAddOns?: string[];
  propertyType?: string;
  cleaningType?: string;
  propertySize?: string;
  electricalIssue?: string;
  urgency?: string;
  payment?: {
    paymentMethod: string;
    cardBrand?: string;
    cardLast4?: string;
  };
  commission?: number;
}

export interface BookingReceiptData {
  serviceName: string;
  serviceDate: string;
  serviceTime: string;
  address: string;
  totalCost: number;
  basePrice: number;
  addOnsPrice?: number;
  discounts?: number;
  provider?: {
    name: string;
    rating?: number;
    reviews?: number;
    verified: boolean;
  };
  paymentMethod: string;
  cardBrand?: string;
  cardLast4?: string;
  bankName?: string;
  accountLast4?: string;
  commission?: number;
  bookingStatus?: string;
  bookingNumber?: string;
}

export const mapBookingToReceiptData = (booking: any): BookingReceiptData => {
  const basePrice = parseFloat(booking.basePrice || "0");
  const addOnsPrice = parseFloat(booking.addOnsPrice || "0");
  const totalPrice = parseFloat(booking.totalPrice || "0");
  const platformFee = totalPrice * 0.15;

  const formatServiceName = (type: string): string => {
    const serviceNames: Record<string, string> = {
      'cleaning': 'House Cleaning',
      'garden-care': 'Garden Care & Maintenance',
      'plumbing': 'Plumbing Services',
      'electrical': 'Electrical Services',
      'chef-catering': 'Chef & Catering',
      'event-staff': 'Event Staff & Waitering',
      'moving': 'Moving Services',
      'au-pair': 'Au Pair & Childcare'
    };
    return serviceNames[type] || type;
  };

  return {
    serviceName: formatServiceName(booking.serviceType),
    serviceDate: new Date(booking.scheduledDate).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    serviceTime: booking.scheduledTime,
    address: booking.address,
    totalCost: totalPrice,
    basePrice,
    addOnsPrice: addOnsPrice > 0 ? addOnsPrice : undefined,
    provider: (booking as any).providerName ? {
      name: (booking as any).providerName,
      verified: true
    } : undefined,
    paymentMethod: (booking as any).paymentMethod || 'card',
    cardBrand: (booking as any).cardBrand || undefined,
    cardLast4: (booking as any).cardLast4 || undefined,
    bankName: (booking as any).bankName || undefined,
    accountLast4: (booking as any).accountLast4 || undefined,
    commission: platformFee,
    bookingStatus: booking.status,
    bookingNumber: booking.bookingNumber || undefined
  };
};

export const generateBookingReceipt = async (bookingData: BookingData, bookingRef: string) => {
  const doc = new jsPDF();
  
  // Berry Events Brand Colors (from design system)
  const berryPrimary = [68, 6, 45]; // #44062D - Deep plum
  const berryLight = [247, 242, 239]; // #F7F2EF - Light beige
  const berryAccent = [197, 107, 134]; // #C56B86 - Berry pink
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246]; // Gray-100
  
  let yPosition = 20;
  
  // Header - Berry Events Branding (matching app header exactly)
  // Background color: #44062D (same as app header)
  doc.setFillColor(berryPrimary[0], berryPrimary[1], berryPrimary[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add Berry Events Logo (left side, matching app header position)
  try {
    // Convert logo to DataURL for jsPDF
    const logoDataURL = await loadImageAsDataURL(berryLogoPath);
    // Logo size similar to header (20x20mm in PDF)
    doc.addImage(logoDataURL, 'PNG', 15, 10, 20, 20);
  } catch (error) {
    // Fallback to text-based logo if image fails
    console.warn('Failed to load logo for PDF, using fallback:', error);
    doc.setTextColor(berryAccent[0], berryAccent[1], berryAccent[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BE', 25, 22, { align: 'center' });
  }
  
  // "Berry Events" text next to logo (matching app header style)
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Berry Events', 38, 18);
  
  // Tagline below "Berry Events" in light beige (#EED1C4 = RGB 238, 209, 196)
  doc.setTextColor(238, 209, 196);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('All your home services', 38, 24);
  
  yPosition = 50;
  
  // Receipt Title
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING RECEIPT', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  
  // Booking Reference with Berry Accent Color
  doc.setFillColor(berryAccent[0], berryAccent[1], berryAccent[2]);
  doc.roundedRect(15, yPosition, 180, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Booking Reference: ${bookingRef}`, 105, yPosition + 8, { align: 'center' });
  
  yPosition += 20;
  
  // Date & Time Section
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Receipt Date: ${currentDate}`, 15, yPosition);
  
  yPosition += 15;
  
  // Service Details Section
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SERVICE DETAILS', 20, yPosition + 6);
  
  yPosition += 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Service Name
  doc.setFont('helvetica', 'bold');
  doc.text('Service:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(bookingData.serviceName, 55, yPosition);
  yPosition += 7;
  
  // Additional service details
  if (bookingData.cleaningType) {
    doc.setFont('helvetica', 'bold');
    doc.text('Type:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const cleaningType = bookingData.cleaningType.replace('-', ' ');
    const typeText = cleaningType.charAt(0).toUpperCase() + cleaningType.slice(1);
    doc.text(typeText + (bookingData.propertySize ? ` (${bookingData.propertySize})` : ''), 55, yPosition);
    yPosition += 7;
  }
  
  if (bookingData.electricalIssue) {
    doc.setFont('helvetica', 'bold');
    doc.text('Issue:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingData.electricalIssue.replace('-', ' '), 55, yPosition);
    yPosition += 7;
  }
  
  // Date & Time
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  const serviceDate = new Date(bookingData.preferredDate).toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(serviceDate, 55, yPosition);
  yPosition += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Time:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(bookingData.timePreference, 55, yPosition);
  yPosition += 7;
  
  // Address
  doc.setFont('helvetica', 'bold');
  doc.text('Address:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(bookingData.address, 120);
  doc.text(addressLines, 55, yPosition);
  yPosition += (addressLines.length * 5) + 5;
  
  // Provider Details (if available)
  if (bookingData.selectedProvider) {
    yPosition += 5;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SERVICE PROVIDER', 20, yPosition + 6);
    
    yPosition += 15;
    doc.setFontSize(10);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Provider:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingData.selectedProvider.name + (bookingData.selectedProvider.verified ? ' ✓' : ''), 55, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Rating:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${bookingData.selectedProvider.rating} ★ (${bookingData.selectedProvider.reviews} reviews)`, 55, yPosition);
    yPosition += 10;
  }
  
  // Payment Summary
  yPosition += 5;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT SUMMARY', 20, yPosition + 6);
  
  yPosition += 15;
  doc.setFontSize(10);
  
  // Base Price
  doc.setFont('helvetica', 'normal');
  doc.text('Base Service', 20, yPosition);
  doc.text(`R${bookingData.pricing?.basePrice || 0}`, 175, yPosition, { align: 'right' });
  yPosition += 7;
  
  // Add-ons
  if (bookingData.pricing?.addOnsPrice && bookingData.pricing.addOnsPrice > 0) {
    doc.text('Add-ons', 20, yPosition);
    doc.text(`R${bookingData.pricing.addOnsPrice}`, 175, yPosition, { align: 'right' });
    yPosition += 7;
  }
  
  // Materials Discount
  if (bookingData.pricing?.materialsDiscount && bookingData.pricing.materialsDiscount > 0) {
    doc.setTextColor(34, 197, 94); // Green
    doc.text('Materials Discount', 20, yPosition);
    doc.text(`-R${bookingData.pricing.materialsDiscount}`, 175, yPosition, { align: 'right' });
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    yPosition += 7;
  }
  
  // Recurring Discount
  if (bookingData.pricing?.recurringDiscount && bookingData.pricing.recurringDiscount > 0) {
    doc.setTextColor(34, 197, 94); // Green
    doc.text('Recurring Service Discount', 20, yPosition);
    doc.text(`-R${bookingData.pricing.recurringDiscount}`, 175, yPosition, { align: 'right' });
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    yPosition += 7;
  }
  
  // Total Line
  yPosition += 3;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 175, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL PAID', 20, yPosition);
  doc.setTextColor(berryPrimary[0], berryPrimary[1], berryPrimary[2]);
  doc.text(`R${bookingData.totalCost}`, 175, yPosition, { align: 'right' });
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  yPosition += 10;
  
  // Payment Method
  if (bookingData.payment) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (bookingData.payment.paymentMethod === 'card') {
      const cardBrand = bookingData.payment.cardBrand || 'Card';
      const cardLast4 = bookingData.payment.cardLast4 || '****';
      doc.text(`Paid with ${cardBrand} ending in ${cardLast4}`, 20, yPosition);
    } else {
      doc.text('Payment Method: Bank Transfer', 20, yPosition);
    }
    yPosition += 10;
  } else {
    // Fallback if payment info is missing
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Method: Confirmed', 20, yPosition);
    yPosition += 10;
  }
  
  // Berry Events Bank Protection
  yPosition += 5;
  doc.setFillColor(59, 130, 246); // Blue
  doc.roundedRect(15, yPosition, 180, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SECURED BY BERRY EVENTS BANK', 105, yPosition + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Your payment is protected until service completion', 105, yPosition + 9, { align: 'center' });
  
  yPosition += 20;
  
  // Platform Fee Notice
  if (bookingData.commission) {
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(8);
    doc.text(`Platform fee (15%): R${bookingData.commission}`, 20, yPosition);
    yPosition += 8;
  }
  
  // Footer
  yPosition = 270;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text('Berry Events - All Your Home Services In One', 105, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('customerservice@berryevents.co.za | +27 61 279 6476', 105, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('www.berryevents.co.za', 105, yPosition, { align: 'center' });
  
  // Save the PDF
  doc.save(`Berry-Events-Receipt-${bookingRef}.pdf`);
};

export const generateCompletedBookingReceipt = (receiptData: BookingReceiptData) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [139, 92, 246]; // Purple
  const secondaryColor = [34, 197, 94]; // Green
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246]; // Gray-100
  
  let yPosition = 20;
  
  // Header - Berry Events Branding
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BERRY EVENTS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('All Your Home Services In One', 105, 28, { align: 'center' });
  
  yPosition = 50;
  
  // Receipt Title
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE RECEIPT', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  
  // Booking Reference
  const bookingRef = receiptData.bookingNumber || `BE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.roundedRect(15, yPosition, 180, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Booking Reference: ${bookingRef}`, 105, yPosition + 8, { align: 'center' });
  
  yPosition += 20;
  
  // Receipt Date
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Receipt Date: ${currentDate}`, 15, yPosition);
  
  yPosition += 15;
  
  // Service Details Section
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SERVICE DETAILS', 20, yPosition + 6);
  
  yPosition += 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Service Name
  doc.setFont('helvetica', 'bold');
  doc.text('Service:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptData.serviceName, 55, yPosition);
  yPosition += 7;
  
  // Service Date
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptData.serviceDate, 55, yPosition);
  yPosition += 7;
  
  // Service Time
  doc.setFont('helvetica', 'bold');
  doc.text('Time:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptData.serviceTime, 55, yPosition);
  yPosition += 7;
  
  // Address
  doc.setFont('helvetica', 'bold');
  doc.text('Address:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(receiptData.address, 120);
  doc.text(addressLines, 55, yPosition);
  yPosition += (addressLines.length * 5) + 5;
  
  // Status
  if (receiptData.bookingStatus) {
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const statusText = receiptData.bookingStatus.charAt(0).toUpperCase() + receiptData.bookingStatus.slice(1);
    doc.text(statusText, 55, yPosition);
    yPosition += 10;
  }
  
  // Provider Details (if available)
  if (receiptData.provider) {
    yPosition += 5;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SERVICE PROVIDER', 20, yPosition + 6);
    
    yPosition += 15;
    doc.setFontSize(10);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Provider:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.provider.name + (receiptData.provider.verified ? ' ✓' : ''), 55, yPosition);
    yPosition += 10;
  }
  
  // Payment Summary
  yPosition += 5;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, yPosition, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT SUMMARY', 20, yPosition + 6);
  
  yPosition += 15;
  doc.setFontSize(10);
  
  // Base Price
  doc.setFont('helvetica', 'normal');
  doc.text('Base Service', 20, yPosition);
  doc.text(`R${receiptData.basePrice.toFixed(2)}`, 175, yPosition, { align: 'right' });
  yPosition += 7;
  
  // Add-ons
  if (receiptData.addOnsPrice && receiptData.addOnsPrice > 0) {
    doc.text('Add-ons', 20, yPosition);
    doc.text(`R${receiptData.addOnsPrice.toFixed(2)}`, 175, yPosition, { align: 'right' });
    yPosition += 7;
  }
  
  // Total Line
  yPosition += 3;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 175, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL PAID', 20, yPosition);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`R${receiptData.totalCost.toFixed(2)}`, 175, yPosition, { align: 'right' });
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  yPosition += 10;
  
  // Payment Method
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (receiptData.paymentMethod === 'card' && receiptData.cardLast4) {
    const cardBrand = receiptData.cardBrand || 'Card';
    doc.text(`Paid with ${cardBrand} ending in ${receiptData.cardLast4}`, 20, yPosition);
  } else if (receiptData.paymentMethod === 'bank' && receiptData.accountLast4) {
    const bankName = receiptData.bankName || 'Bank Transfer';
    doc.text(`Paid via ${bankName} ending in ${receiptData.accountLast4}`, 20, yPosition);
  } else {
    doc.text('Payment Method: Confirmed', 20, yPosition);
  }
  yPosition += 10;
  
  // Berry Events Bank Protection
  yPosition += 5;
  doc.setFillColor(59, 130, 246); // Blue
  doc.roundedRect(15, yPosition, 180, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SECURED BY BERRY EVENTS BANK', 105, yPosition + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Your payment is protected until service completion', 105, yPosition + 9, { align: 'center' });
  
  yPosition += 20;
  
  // Platform Fee Notice
  if (receiptData.commission) {
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(8);
    doc.text(`Platform fee (15%): R${receiptData.commission.toFixed(2)}`, 20, yPosition);
    yPosition += 8;
  }
  
  // Footer
  yPosition = 270;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text('Berry Events - All Your Home Services In One', 105, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('customerservice@berryevents.co.za | +27 61 279 6476', 105, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('www.berryevents.co.za', 105, yPosition, { align: 'center' });
  
  // Save the PDF
  doc.save(`Berry-Events-Receipt-${bookingRef}.pdf`);
};
