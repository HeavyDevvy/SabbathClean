import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    service: string;
    date: string;
    time: string;
    price: string;
  };
}

export function CancelBookingDialog({ isOpen, onClose, booking }: CancelBookingDialogProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const cancelMutation = useMutation({
    mutationFn: async ({ bookingId, cancelReason }: { bookingId: string; cancelReason?: string }) => {
      const res = await apiRequest('PATCH', `/api/bookings/${bookingId}/cancel`, { reason: cancelReason });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to cancel booking' }));
        throw new Error(errorData.message || `Cancellation failed: ${res.status}`);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Phase 4.3b: Invalidate customer bookings query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/customer'] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled. Refund will be processed within 5-7 business days.",
      });
      onClose();
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    }
  });

  const handleCancel = () => {
    cancelMutation.mutate({
      bookingId: booking.id,
      cancelReason: reason.trim() || undefined
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Booking Details</p>
            <p className="text-sm text-gray-600">{booking.service}</p>
            <p className="text-sm text-gray-600">
              {format(new Date(booking.date), "MMMM d, yyyy")} at {booking.time}
            </p>
            <p className="text-sm font-semibold text-green-600 mt-1">{booking.price}</p>
          </div>

          {/* Cancellation reason (optional) */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for cancellation (optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              disabled={cancelMutation.isPending}
              data-testid="textarea-cancel-reason"
            />
          </div>

          {/* Refund notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Refund Policy:</strong> Full refund will be processed to your original payment method within 5-7 business days.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={cancelMutation.isPending}
            data-testid="button-keep-booking"
          >
            Keep Booking
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            data-testid="button-confirm-cancel"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
