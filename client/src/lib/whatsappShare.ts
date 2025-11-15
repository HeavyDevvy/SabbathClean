// WhatsApp share utility for booking confirmations

export interface WhatsAppBookingDetails {
  serviceName: string;
  date: string;
  time: string;
  providerName?: string;
  bookingReference: string;
  totalAmount: number | string;
}

export const shareViaWhatsApp = (bookingDetails: WhatsAppBookingDetails) => {
  const { 
    serviceName, 
    date, 
    time, 
    providerName, 
    bookingReference,
    totalAmount 
  } = bookingDetails;
  
  const message = `
🎉 *Booking Confirmed with Berry Events*

📋 Service: ${serviceName}
📅 Date: ${date}
⏰ Time: ${time}
${providerName ? `👤 Provider: ${providerName}\n` : ''}🔖 Reference: ${bookingReference}
💰 Total: R${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount}

Booked via Berry Events
  `.trim();
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/?text=${encodedMessage}`;
  
  // Open WhatsApp in new window
  window.open(whatsappURL, '_blank');
};
