// Calendar invite (.ics) generation utility
// Creates downloadable calendar events for booking confirmations

interface BookingData {
  serviceName: string;
  preferredDate: string;
  timePreference: string;
  address: string;
  selectedProvider?: {
    name: string;
    phone?: string;
  };
  selectedAddOns?: string[];
  specialRequests?: string;
  totalCost?: number;
}

export const generateCalendarInvite = (
  bookingData: BookingData | BookingData[],
  bookingRef: string
): string => {
  const bookings = Array.isArray(bookingData) ? bookingData : [bookingData];
  
  // Use first booking's date/time for the event
  const firstBooking = bookings[0];
  const eventDate = new Date(firstBooking.preferredDate);
  
  // Parse time preference to set event time
  const timeMatch = firstBooking.timePreference.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    eventDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
  } else if (firstBooking.timePreference.toLowerCase().includes('morning')) {
    eventDate.setHours(9, 0);
  } else if (firstBooking.timePreference.toLowerCase().includes('afternoon')) {
    eventDate.setHours(14, 0);
  } else {
    eventDate.setHours(10, 0); // Default 10 AM
  }
  
  const startDate = formatICSDate(eventDate);
  const endDate = formatICSDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000)); // 2 hours default
  
  // Build description with all services
  let description = `Berry Events Booking Confirmation\\n\\n`;
  description += `Booking Reference: ${bookingRef}\\n\\n`;
  
  bookings.forEach((booking, index) => {
    if (bookings.length > 1) {
      description += `Service ${index + 1}:\\n`;
    }
    description += `${booking.serviceName}\\n`;
    
    if (booking.selectedProvider) {
      description += `Provider: ${booking.selectedProvider.name}\\n`;
    }
    
    if (booking.selectedAddOns && booking.selectedAddOns.length > 0) {
      description += `Add-ons: ${booking.selectedAddOns.join(', ')}\\n`;
    }
    
    if (booking.specialRequests) {
      description += `Special Requests: ${booking.specialRequests}\\n`;
    }
    
    if (booking.totalCost) {
      description += `Cost: R${booking.totalCost}\\n`;
    }
    
    description += `\\n`;
  });
  
  description += `Address: ${firstBooking.address}\\n`;
  description += `Time: ${firstBooking.timePreference}\\n\\n`;
  description += `For questions, contact: customerservice@berryevents.co.za or +27 61 279 6476`;
  
  // Build summary
  const summary = bookings.length === 1
    ? `Berry Events - ${bookings[0].serviceName}`
    : `Berry Events - ${bookings.length} Services`;
  
  // Generate ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Berry Events//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${bookingRef}@berryevents.co.za`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${firstBooking.address}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'DESCRIPTION:Berry Events Service Reminder',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icsContent;
};

// Format date for ICS format (YYYYMMDDTHHmmssZ)
const formatICSDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

// Download calendar invite file
export const downloadCalendarInvite = (
  bookingData: BookingData | BookingData[],
  bookingRef: string
): void => {
  try {
    const icsContent = generateCalendarInvite(bookingData, bookingRef);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Berry-Events-Booking-${bookingRef}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error generating calendar invite:', error);
    throw error;
  }
};

// Email calendar invite (placeholder - requires backend integration)
export const emailCalendarInvite = async (
  email: string,
  bookingData: BookingData | BookingData[],
  bookingRef: string
): Promise<{ success: boolean; message: string }> => {
  // TODO: Implement backend email integration
  // For now, provide fallback download
  try {
    downloadCalendarInvite(bookingData, bookingRef);
    return {
      success: true,
      message: 'Calendar invite downloaded. Email integration coming soon!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate calendar invite'
    };
  }
};
