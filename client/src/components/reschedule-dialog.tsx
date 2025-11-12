import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    service: string;
    date: string;
    time: string;
  };
}

// Generate time slots from 7am to 8pm
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export function RescheduleDialog({ isOpen, onClose, booking }: RescheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date(booking.date));
  const [time, setTime] = useState<string>(booking.time);
  const { toast } = useToast();

  const rescheduleMutation = useMutation({
    mutationFn: async ({ bookingId, scheduledDate, scheduledTime }: { bookingId: string; scheduledDate: string; scheduledTime: string }) => {
      const res = await apiRequest('PATCH', `/api/bookings/${bookingId}/reschedule`, { scheduledDate, scheduledTime });
      return await res.json();
    },
    onSuccess: () => {
      // Phase 4.3a: Invalidate customer bookings query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/customer'] });
      toast({
        title: "Booking rescheduled",
        description: "Your booking has been successfully rescheduled.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule booking",
        variant: "destructive",
      });
    }
  });

  const handleReschedule = () => {
    if (!date || !time) {
      toast({
        title: "Missing information",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    rescheduleMutation.mutate({
      bookingId: booking.id,
      scheduledDate: format(date, "yyyy-MM-dd"),
      scheduledTime: time
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Select a new date and time for your {booking.service} booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current booking info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Current Schedule</p>
            <p className="text-sm text-gray-600">
              {format(new Date(booking.date), "MMMM d, yyyy")} at {booking.time}
            </p>
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-select-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Time</label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-full" data-testid="select-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={rescheduleMutation.isPending}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={rescheduleMutation.isPending || !date || !time}
            data-testid="button-confirm-reschedule"
          >
            {rescheduleMutation.isPending ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
