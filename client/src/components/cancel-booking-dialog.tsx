import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { AlertTriangle } from "lucide-react";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    orderId?: string; // Order ID for new cart-based system
    service: string;
    date: string;
    time: string;
    price: string;
  };
}

export function CancelBookingDialog({ isOpen, onClose, booking }: CancelBookingDialogProps) {
  const [reason, setReason] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();

  // Calculate refund amount based on timing
  const calculateRefund = () => {
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const hoursUntilBooking = differenceInHours(bookingDateTime, now);
    const daysUntilBooking = differenceInDays(bookingDateTime, now);
    
    const totalAmount = parseFloat(booking.price.replace(/[^0-9.]/g, ''));
    
    if (hoursUntilBooking <= 24) {
      // 24 hours or less: No refund
      return {
        refundAmount: 0,
        deductionAmount: totalAmount,
        deductionPercentage: 100,
        message: "No refund will be issued (cancellation within 24 hours)"
      };
    } else if (daysUntilBooking <= 4) {
      // 4 days or less: 50% deduction
      const deduction = totalAmount * 0.50;
      return {
        refundAmount: totalAmount - deduction,
        deductionAmount: deduction,
        deductionPercentage: 50,
        message: "50% will be deducted (cancellation 4 days or less before booking)"
      };
    } else {
      // More than 4 days: 10% deduction
      const deduction = totalAmount * 0.10;
      return {
        refundAmount: totalAmount - deduction,
        deductionAmount: deduction,
        deductionPercentage: 10,
        message: "10% will be deducted and paid to the service provider"
      };
    }
  };

  const refundInfo = calculateRefund();

  const cancelMutation = useMutation({
    mutationFn: async ({ orderId, cancelReason }: { orderId: string; cancelReason: string }) => {
      // Use orders API for new cart-based system
      const endpoint = booking.orderId ? `/api/orders/${orderId}/cancel` : `/api/bookings/${orderId}/cancel`;
      const res = await apiRequest('PATCH', endpoint, { 
        reason: cancelReason,
        refundAmount: refundInfo.refundAmount,
        deductionAmount: refundInfo.deductionAmount
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to cancel booking' }));
        throw new Error(errorData.message || `Cancellation failed: ${res.status}`);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate both queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/customer'] });
      
      const refundMessage = refundInfo.refundAmount > 0 
        ? `Refund of R${refundInfo.refundAmount.toFixed(2)} will be processed within 5-7 business days.`
        : "No refund will be issued as per the cancellation policy.";
      
      toast({
        title: "Booking cancelled",
        description: refundMessage,
      });
      onClose();
      setReason("");
      setAgreedToTerms(false);
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
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Consent required",
        description: "Please agree to the cancellation terms to proceed",
        variant: "destructive",
      });
      return;
    }

    cancelMutation.mutate({
      orderId: booking.orderId || booking.id,
      cancelReason: reason.trim()
    });
  };

  const isConfirmDisabled = !reason.trim() || !agreedToTerms || cancelMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Booking?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please read the refund policy carefully before proceeding with cancellation.
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

          {/* Refund Policy - Bold Red Text */}
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-bold text-red-600 uppercase">Cancellation & Refund Policy</p>
            </div>
            <div className="space-y-2 text-sm text-red-700">
              <p className="font-bold">• Any cancellation: 10% will be deducted from the amount paid and will be paid to the service provider</p>
              <p className="font-bold">• Cancellations made 4 days or less before the booking: 50% will be deducted from the amount paid</p>
              <p className="font-bold">• Cancellations made 24 hours or less before the booking: No refund will be issued</p>
            </div>
            
            {/* Show calculated refund for this booking */}
            <div className="mt-4 pt-3 border-t border-red-300">
              <p className="text-sm font-bold text-red-800">
                Your refund: R{refundInfo.refundAmount.toFixed(2)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                ({refundInfo.message})
              </p>
            </div>
          </div>

          {/* Cancellation reason (REQUIRED) */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for cancellation <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for cancelling this booking (required)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              disabled={cancelMutation.isPending}
              data-testid="textarea-cancel-reason"
              required
            />
            {!reason.trim() && (
              <p className="text-xs text-red-600">This field is required</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Checkbox
              id="agree-terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              disabled={cancelMutation.isPending}
              data-testid="checkbox-agree-terms"
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor="agree-terms"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I agree to the cancellation terms and refund policy
                <span className="text-red-600 ml-1">*</span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                You must accept the terms to proceed with cancellation
              </p>
            </div>
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
            disabled={isConfirmDisabled}
            data-testid="button-confirm-cancel"
          >
            {cancelMutation.isPending ? "Processing Cancellation..." : "Confirm Cancellation"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
