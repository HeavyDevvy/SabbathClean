import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface YocoPaymentButtonProps {
  bookingRef: string;
  amount: number;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function YocoPaymentButton({
  bookingRef,
  amount,
  description,
  onSuccess,
  onError
}: YocoPaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingRef,
          amount: Math.round(amount * 100), // Convert to cents
          description,
          successUrl: `${window.location.origin}/bookings/success?ref=${bookingRef}`,
          cancelUrl: `${window.location.origin}/bookings`,
          failureUrl: `${window.location.origin}/bookings/failure?ref=${bookingRef}`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409 && data.code === "BOOKING_PAID") {
          toast({
            title: "Booking Already Paid",
            description: "This booking has already been paid. Redirecting...",
          });
          if (onSuccess) await onSuccess();
          window.location.href = `/bookings/success?ref=${bookingRef}`;
          return;
        }
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { redirectUrl } = data;
      
      // Call onSuccess callback if provided
      if (onSuccess) await onSuccess();
      
      // Redirect to Yoco checkout
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });

      onError?.(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      size="lg"
      className="w-full bg-primary hover:bg-primary/90"
    >
      {isProcessing ? 'Processing...' : `Pay R${amount.toFixed(2)}`}
    </Button>
  );
}
