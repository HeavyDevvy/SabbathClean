import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Banknote, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PaymentMethod } from "@shared/schema";

interface PaymentMethodSelectorProps {
  selectedPaymentMethod?: string;
  onPaymentMethodChange: (paymentMethodId: string) => void;
  showAddButton?: boolean;
}

export default function PaymentMethodSelector({
  selectedPaymentMethod,
  onPaymentMethodChange,
  showAddButton = true,
}: PaymentMethodSelectorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "card",
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    cardType: "",
    bankName: "",
  });
  
  const { toast } = useToast();

  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/payment-methods", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setShowAddDialog(false);
      setNewPaymentMethod({
        type: "card",
        cardNumber: "",
        cardHolderName: "",
        expiryMonth: "",
        expiryYear: "",
        cardType: "",
        bankName: "",
      });
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/payment-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
    },
  });

  const handleAddPaymentMethod = () => {
    // Mask card number for storage (keep only last 4 digits)
    const maskedCardNumber = newPaymentMethod.cardNumber.replace(/\d(?=\d{4})/g, "*");
    
    // Detect card type from number
    const cardType = detectCardType(newPaymentMethod.cardNumber);
    
    addPaymentMethodMutation.mutate({
      ...newPaymentMethod,
      cardNumber: maskedCardNumber,
      cardType,
    });
  };

  const detectCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, "");
    if (number.match(/^4/)) return "visa";
    if (number.match(/^5[1-5]/) || number.match(/^2[2-7]/)) return "mastercard";
    if (number.match(/^3[47]/)) return "amex";
    return "unknown";
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return <div className="text-blue-600 font-bold text-xs">VISA</div>;
      case "mastercard":
        return <div className="text-red-600 font-bold text-xs">MC</div>;
      case "amex":
        return <div className="text-green-600 font-bold text-xs">AMEX</div>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment Method</h3>
        {showAddButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
            data-testid="button-add-payment-method"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        )}
      </div>

      <RadioGroup
        value={selectedPaymentMethod}
        onValueChange={onPaymentMethodChange}
        className="space-y-3"
      >
        {/* Cash Option */}
        <div className="flex items-center space-x-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RadioGroupItem value="cash" id="cash" data-testid="payment-cash" />
          <Label htmlFor="cash" className="flex items-center space-x-3 cursor-pointer flex-1">
            <Banknote className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Cash Payment</p>
              <p className="text-sm text-gray-500">Pay the service provider directly</p>
            </div>
          </Label>
        </div>

        {/* Saved Payment Methods */}
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center space-x-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <RadioGroupItem
              value={method.id}
              id={method.id}
              data-testid={`payment-method-${method.id}`}
            />
            <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
              {method.type === "card" ? (
                <>
                  {getCardIcon(method.cardType || "")}
                  <div className="flex-1">
                    <p className="font-medium">
                      {method.cardHolderName} •••• {method.cardNumber?.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires {method.expiryMonth?.toString().padStart(2, "0")}/{method.expiryYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </>
              ) : (
                <>
                  <Building className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{method.bankName}</p>
                    <p className="text-sm text-gray-500">Bank Transfer</p>
                  </div>
                </>
              )}
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deletePaymentMethodMutation.mutate(method.id)}
              disabled={deletePaymentMethodMutation.isPending}
              data-testid={`delete-payment-${method.id}`}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </RadioGroup>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select
                value={newPaymentMethod.type}
                onValueChange={(value) => 
                  setNewPaymentMethod(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger data-testid="select-payment-type">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newPaymentMethod.type === "card" && (
              <>
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={formatCardNumber(newPaymentMethod.cardNumber)}
                    onChange={(e) =>
                      setNewPaymentMethod(prev => ({
                        ...prev,
                        cardNumber: e.target.value.replace(/\s/g, "")
                      }))
                    }
                    maxLength={19}
                    data-testid="input-card-number"
                  />
                </div>

                <div>
                  <Label htmlFor="card-holder">Card Holder Name</Label>
                  <Input
                    id="card-holder"
                    placeholder="John Doe"
                    value={newPaymentMethod.cardHolderName}
                    onChange={(e) =>
                      setNewPaymentMethod(prev => ({
                        ...prev,
                        cardHolderName: e.target.value
                      }))
                    }
                    data-testid="input-card-holder"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry-month">Month</Label>
                    <Select
                      value={newPaymentMethod.expiryMonth}
                      onValueChange={(value) =>
                        setNewPaymentMethod(prev => ({ ...prev, expiryMonth: value }))
                      }
                    >
                      <SelectTrigger data-testid="select-expiry-month">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                            {(i + 1).toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiry-year">Year</Label>
                    <Select
                      value={newPaymentMethod.expiryYear}
                      onValueChange={(value) =>
                        setNewPaymentMethod(prev => ({ ...prev, expiryYear: value }))
                      }
                    >
                      <SelectTrigger data-testid="select-expiry-year">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {newPaymentMethod.type === "bank_transfer" && (
              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  placeholder="e.g., First National Bank"
                  value={newPaymentMethod.bankName}
                  onChange={(e) =>
                    setNewPaymentMethod(prev => ({ ...prev, bankName: e.target.value }))
                  }
                  data-testid="input-bank-name"
                />
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
                data-testid="button-cancel-payment"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPaymentMethod}
                disabled={addPaymentMethodMutation.isPending}
                className="flex-1"
                data-testid="button-save-payment"
              >
                {addPaymentMethodMutation.isPending ? "Adding..." : "Add Payment Method"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}