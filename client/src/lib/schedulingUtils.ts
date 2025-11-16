/**
 * Shared scheduling utilities for service booking forms
 * Handles date/time validation, slot filtering, and booking window enforcement
 */

import { addDays, addHours, format, parse, isBefore, isToday, setHours, setMinutes } from "date-fns";

/**
 * Get minimum selectable date based on urgency or service requirements
 */
export function getMinSelectableDate(urgency?: string, minimumHoursNotice?: number): Date {
  const now = new Date();
  
  if (urgency === "emergency") {
    return now; // Can book immediately
  }
  
  if (urgency === "urgent") {
    return addHours(now, 4); // Minimum 4 hours notice
  }
  
  if (urgency === "next-day") {
    return addDays(now, 1); // Tomorrow only
  }
  
  if (minimumHoursNotice) {
    return addHours(now, minimumHoursNotice);
  }
  
  return now; // Default: can book anytime
}

/**
 * Check if a date is selectable based on urgency
 */
export function isDateSelectable(
  date: Date,
  urgency?: string,
  minimumHoursNotice?: number
): boolean {
  const minDate = getMinSelectableDate(urgency, minimumHoursNotice);
  return !isBefore(date, minDate);
}

/**
 * Check if recurring schedule should be disabled
 */
export function shouldDisableRecurring(urgency?: string): boolean {
  // Recurring not available for emergency, urgent, or next-day bookings
  return urgency === "emergency" || urgency === "urgent" || urgency === "next-day";
}

/**
 * Check if date picker should be disabled
 */
export function shouldDisableDatePicker(urgency?: string): boolean {
  // For next-day, date is fixed to tomorrow
  return urgency === "next-day";
}

/**
 * Get default date based on urgency
 */
export function getDefaultDate(urgency?: string): string {
  const now = new Date();
  
  if (urgency === "next-day") {
    return format(addDays(now, 1), "yyyy-MM-dd");
  }
  
  if (urgency === "emergency" || urgency === "urgent") {
    return format(now, "yyyy-MM-dd");
  }
  
  return ""; // No default for standard bookings
}

/**
 * Filter time slots to disable past times when booking for today
 */
export interface TimeSlot {
  value: string; // HH:mm format (24-hour)
  label: string; // Display format
  disabled?: boolean;
}

export function filterTimeSlots(
  selectedDate: string,
  allTimeSlots: TimeSlot[]
): TimeSlot[] {
  if (!selectedDate) return allTimeSlots;
  
  const selected = parse(selectedDate, "yyyy-MM-dd", new Date());
  
  // If not today, all slots are available
  if (!isToday(selected)) {
    return allTimeSlots.map(slot => ({ ...slot, disabled: false }));
  }
  
  // For today, disable past time slots
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return allTimeSlots.map(slot => {
    const [hours, minutes] = slot.value.split(":").map(Number);
    const slotTime = setMinutes(setHours(selected, hours), minutes);
    const isPast = isBefore(slotTime, now);
    
    return {
      ...slot,
      disabled: isPast
    };
  });
}

/**
 * Validate if a booking datetime meets minimum notice requirement
 */
export function validateMinimumNotice(
  selectedDate: string,
  selectedTime: string,
  minimumHours: number
): { valid: boolean; message?: string } {
  if (!selectedDate || !selectedTime) {
    return { valid: false, message: "Please select both date and time" };
  }
  
  const [hours, minutes] = selectedTime.split(":").map(Number);
  const bookingDateTime = setMinutes(
    setHours(parse(selectedDate, "yyyy-MM-dd", new Date()), hours),
    minutes
  );
  
  const minDateTime = addHours(new Date(), minimumHours);
  
  if (isBefore(bookingDateTime, minDateTime)) {
    return {
      valid: false,
      message: `Booking requires at least ${minimumHours} hours notice. Please select a later time.`
    };
  }
  
  return { valid: true };
}

/**
 * Standard time slots for service bookings
 */
export const STANDARD_TIME_SLOTS: TimeSlot[] = [
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
];
