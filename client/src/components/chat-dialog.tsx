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
      <DialogContent className="max-w-2xl h-[90vh] max-h-[800px] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Chat with Provider</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterface
            bookingId={bookingId}
            customerId={customerId}
            providerId={providerId}
            customerName={customerName}
            providerName={providerName}
            currentUserId={currentUserId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
