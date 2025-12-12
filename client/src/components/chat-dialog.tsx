import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatInterface } from "./ChatInterface";
import { apiRequest } from "@/lib/queryClient";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingNumber?: string;
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
  bookingNumber,
  customerId,
  providerId,
  customerName,
  providerName,
  currentUserId
}: ChatDialogProps) {
  const [displayName, setDisplayName] = useState<string>(() => {
    const initial = currentUserId === customerId ? (providerName?.trim() || "") : (customerName?.trim() || "");
    return initial || (currentUserId === customerId ? "Service Provider" : "Customer");
  });

  useEffect(() => {
    let cancelled = false;
    const isCustomerView = currentUserId === customerId;
    const initial = isCustomerView ? (providerName?.trim() || "") : (customerName?.trim() || "");
    const isGeneric = !initial || /^(Provider|Service Provider|Customer)$/i.test(initial);
    const resolve = async () => {
      try {
        if (isCustomerView) {
          const res = await apiRequest("GET", `/api/providers/${providerId}`);
          const p = await res.json();
          const name = p?.businessName || p?.name || [p?.firstName, p?.lastName].filter(Boolean).join(" ");
          if (!cancelled) setDisplayName(name || "Service Provider");
        } else {
          const res = await apiRequest("GET", `/api/users/${customerId}`);
          const u = await res.json();
          const name = [u?.firstName, u?.lastName].filter(Boolean).join(" ");
          if (!cancelled) setDisplayName(name || "Customer");
        }
      } catch {
        if (!cancelled) setDisplayName(isCustomerView ? "Service Provider" : "Customer");
      }
    };
    if (isGeneric) resolve();
    return () => { cancelled = true; };
  }, [bookingId, customerId, providerId, providerName, customerName, currentUserId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] max-h-[800px] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>{displayName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterface
            bookingId={bookingId}
            bookingNumber={bookingNumber}
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
