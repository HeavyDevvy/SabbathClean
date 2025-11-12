import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Copy, Mail, Share2, Check } from "lucide-react";

interface ShareBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    bookingNumber: string;
    service: string;
    date: string;
    time: string;
    address: string;
    price: string;
  };
}

export function ShareBookingDialog({ isOpen, onClose, booking }: ShareBookingDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareableLink = `${window.location.origin}/booking/${booking.id}`;
  
  const bookingDetails = `
Berry Events Booking Confirmation

Booking Number: ${booking.bookingNumber}
Service: ${booking.service}
Date: ${format(new Date(booking.date), "MMMM d, yyyy")}
Time: ${booking.time}
Location: ${booking.address}
Total: ${booking.price}

View full details: ${shareableLink}
  `.trim();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Booking link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try manually selecting and copying.",
        variant: "destructive",
      });
    }
  };

  const handleCopyDetails = async () => {
    try {
      await navigator.clipboard.writeText(bookingDetails);
      toast({
        title: "Details copied!",
        description: "Booking details have been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy details. Please try manually selecting and copying.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Berry Events Booking - ${booking.service}`);
    const body = encodeURIComponent(bookingDetails);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Share Booking
          </DialogTitle>
          <DialogDescription>
            Share your booking details with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Booking #{booking.bookingNumber}</p>
            <p className="text-base font-semibold text-gray-900">{booking.service}</p>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(booking.date), "MMMM d, yyyy")} at {booking.time}
            </p>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* Copy Link */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Shareable Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={shareableLink} 
                  readOnly 
                  className="flex-1"
                  data-testid="input-shareable-link"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  data-testid="button-copy-link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyDetails}
                data-testid="button-copy-details"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Details
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleEmailShare}
                data-testid="button-email-share"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Recipients can view booking details using the shared link. Sensitive information like payment details is not included.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
