import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatInterface } from "./ChatInterface";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  customerId: string;
  providerId: string;
  customerName: string;
  providerName: string;
  currentUserId: string;
}

export function ChatDialog({
  open,
  onOpenChange,
  bookingId,
  customerId,
  providerId,
  customerName,
  providerName,
  currentUserId
}: ChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Chat with Provider</DialogTitle>
        </DialogHeader>
        <ChatInterface
          bookingId={bookingId}
          customerId={customerId}
          providerId={providerId}
          customerName={customerName}
          providerName={providerName}
          currentUserId={currentUserId}
        />
      </DialogContent>
    </Dialog>
  );
}
