import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CreditCard, Building, CheckCircle2, ArrowLeft, Shield, LogIn, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { parseDecimal, formatCurrency } from "@/lib/currency";
import type { CartItem } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function CartCheckout() {
  const { cart, isLoading, checkout, isCheckingOut } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "wallet">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch wallet balance
  const { data: walletData, isLoading: isWalletLoading } = useQuery<{ balance: number; currency: string }>({
    queryKey: ["/api/wallet/balance"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  
  const walletBalance = walletData?.balance || 0;
  
  // Card payment state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");
  
  // Bank account state
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  
  // SECURITY: Require authentication for checkout - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      // Redirect to auth page with return URL
      navigate("/auth?redirect=/cart-checkout");
    }
  }, [isAuthLoading, isAuthenticated, navigate, toast]);
  
  // Show loading state while checking authentication
  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }
  
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add services to your cart before checking out</p>
          <Button onClick={() => navigate("/")} data-testid="button-back-to-home">
            Browse Services
          </Button>
        </Card>
      </div>
    );
  }
  
  // Calculate detailed breakdown
  const baseServicesTotal = cart.items.reduce((sum, item) => sum + parseDecimal(item.basePrice), 0);
  const totalAddOns = cart.items.reduce((sum, item) => sum + parseDecimal(item.addOnsPrice || "0"), 0);
  const servicesSubtotal = cart.items.reduce((sum, item) => sum + parseDecimal(item.subtotal), 0); // Base + Add-ons - Discounts
  // Calculate total discounts: (basePrice + addOns) - subtotal for each item
  const totalDiscounts = cart.items.reduce((sum, item) => {
    const itemBeforeDiscount = parseDecimal(item.basePrice) + parseDecimal(item.addOnsPrice || "0");
    const itemAfterDiscount = parseDecimal(item.subtotal);
    return sum + (itemBeforeDiscount - itemAfterDiscount);
  }, 0);
  const totalTips = cart.items.reduce((sum, item) => sum + parseDecimal(item.tipAmount || "0"), 0);
  const platformFee = servicesSubtotal * 0.15; // Platform fee only on services subtotal, NOT on tips
  const total = servicesSubtotal + totalTips + platformFee;
  
  // Helper function to detect card brand
  const detectCardBrand = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
    return 'Unknown';
  };

  const luhnCheck = (num: string) => {
    const digits = num.replace(/\s/g, '').split('').reverse().map(n => parseInt(n, 10));
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let d = digits[i];
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return sum % 10 === 0;
  };

  const isValidExpiry = (exp: string) => {
    const m = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    const month = parseInt(m[1], 10);
    const year = 2000 + parseInt(m[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(year, month - 1, 1);
    const endOfMonth = new Date(expDate.getFullYear(), expDate.getMonth() + 1, 0);
    return endOfMonth >= new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const handleCheckout = async () => {
    // Validate payment information
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
        toast({
          title: "Missing information",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        return;
      }
      
      // Additional card validation
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19 || !luhnCheck(cleanCardNumber)) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid card number",
          variant: "destructive",
        });
        return;
      }
      if (!isValidExpiry(cardExpiry)) {
        toast({
          title: "Invalid expiry date",
          description: "Use MM/YY and ensure the card is not expired",
          variant: "destructive",
        });
        return;
      }
      if (!/^\d{3,4}$/.test(cardCVV)) {
        toast({
          title: "Invalid CVV",
          description: "CVV must be 3–4 digits",
          variant: "destructive",
        });
        return;
      }
    } else if (paymentMethod === "bank") {
      if (!bankName || !accountNumber || !accountHolder) {
        toast({
          title: "Missing information",
          description: "Please fill in all bank account details",
          variant: "destructive",
        });
        return;
      }
      
      // Validate account number length
      if (accountNumber.length < 8 || accountNumber.length > 12) {
        toast({
          title: "Invalid account number",
          description: "Account number must be 8-12 digits",
          variant: "destructive",
        });
        return;
      }
    } else if (paymentMethod === "wallet") {
      // Validate wallet balance
      if (walletBalance < total) {
        toast({
          title: "Insufficient funds",
          description: `Your wallet balance (${formatCurrency(walletBalance)}) is less than the order total (${formatCurrency(total)}). Please top up your wallet or use a different payment method.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      // SECURITY: Create masked payment info - NEVER send full card number or CVV
      const paymentData = {
        paymentMethod,
        ...(paymentMethod === "card" ? {
          cardLast4: cardNumber.replace(/\s/g, '').slice(-4), // Only last 4 digits
          cardBrand: detectCardBrand(cardNumber),
          cardholderName: cardName
          // NEVER include: cardNumber, cardExpiry, cardCVV
        } : paymentMethod === "bank" ? {
          bankName,
          accountLast4: accountNumber.slice(-4), // Only last 4 digits
          accountHolder
          // NEVER include: full accountNumber
        } : {
          // Wallet payment - no sensitive info needed
          walletBalance: walletBalance,
        })
      };
      
      const order = await checkout(paymentData);
      
      if (order && order.id) {
        // Clear sensitive payment data from state
        setCardNumber("");
        setCardExpiry("");
        setCardCVV("");
        setCardName("");
        setAccountNumber("");
        setBankName("");
        setAccountHolder("");
        
        // Navigate to order confirmation page
        navigate(`/order-confirmation/${order.id}`);
      }
      // If order is null, the checkout function already showed an error toast
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "Please try again or contact support. If the issue persists, contact Berry Events support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Review your services and complete payment</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-6">
                {cart.items.map((item: CartItem, idx: number) => {
                  const serviceDetails = item.serviceDetails ? 
                    (typeof item.serviceDetails === 'string' ? JSON.parse(item.serviceDetails) : item.serviceDetails) 
                    : {};
                  
                  const basePrice = parseDecimal(item.basePrice);
                  const addOnsPrice = parseDecimal(item.addOnsPrice);
                  const itemSubtotal = parseDecimal(item.subtotal);
                  
                  return (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                      data-testid={`checkout-item-${idx}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg" data-testid={`checkout-item-name-${idx}`}>
                            {item.serviceName}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span data-testid={`checkout-item-date-${idx}`}>
                                {item.scheduledDate instanceof Date 
                                  ? item.scheduledDate.toLocaleDateString() 
                                  : new Date(item.scheduledDate).toLocaleDateString()}
                              </span>
                              <Clock className="w-4 h-4 ml-4 mr-2" />
                              <span data-testid={`checkout-item-time-${idx}`}>{item.scheduledTime}</span>
                            </div>
                            {serviceDetails.address && (
                              <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                                <span className="line-clamp-1">{serviceDetails.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Price Breakdown */}
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-700">
                          <span>Base Service Price</span>
                          <span>{formatCurrency(basePrice)}</span>
                        </div>
                        
                        {addOnsPrice > 0 && (
                          <div className="flex justify-between text-gray-700">
                            <span>Add-ons</span>
                            <span>{formatCurrency(addOnsPrice)}</span>
                          </div>
                        )}
                        
                        {item.selectedAddOns && Array.isArray(item.selectedAddOns) && item.selectedAddOns.length > 0 ? (
                          <div className="ml-4 space-y-1">
                            {(item.selectedAddOns as string[]).map((addon: string, addonIdx: number) => (
                              <div key={addonIdx} className="flex items-center text-xs text-gray-600">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                {addon}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        
                        {/* HOUSE CLEANING ONLY: Show tip if present */}
                        {parseDecimal(item.tipAmount || "0") > 0 && (
                          <div className="flex justify-between text-success text-sm">
                            <span>Provider Tip</span>
                            <span data-testid={`checkout-item-tip-${idx}`}>{formatCurrency(parseDecimal(item.tipAmount || "0"))}</span>
                          </div>
                        )}
                        
                        <Separator className="my-2" />
                        
                        <div className="flex justify-between font-semibold text-primary">
                          <span>Service Subtotal</span>
                          <span data-testid={`checkout-item-subtotal-${idx}`}>{formatCurrency(itemSubtotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer" data-testid="radio-wallet-payment">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="wallet" />
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-medium">Berry Wallet</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      {isWalletLoading ? (
                        <span className="text-gray-500">Loading...</span>
                      ) : (
                        <span className={walletBalance >= total ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                          Balance: {formatCurrency(walletBalance)}
                        </span>
                      )}
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer" data-testid="radio-card-payment">
                    <RadioGroupItem value="card" />
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer" data-testid="radio-bank-payment">
                    <RadioGroupItem value="bank" />
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium">Bank Account</span>
                    </div>
                  </label>
                </div>
              </RadioGroup>
              
              {paymentMethod === "wallet" && (
                <div className="mt-6 space-y-4">
                  {walletBalance < total ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 mb-2">
                        <strong>Insufficient funds:</strong> Your wallet balance ({formatCurrency(walletBalance)}) 
                        is less than the order total ({formatCurrency(total)}).
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/wallet")}
                        className="w-full"
                        data-testid="button-top-up-wallet"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Top Up Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                        Your wallet has sufficient funds for this purchase. Amount to be deducted: {formatCurrency(total)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-card-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, '').slice(0, 19);
                        const parts = [] as string[];
                        for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
                        setCardNumber(parts.join(' '));
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      data-testid="input-card-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input
                        id="cardExpiry"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        data-testid="input-card-expiry"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCVV">CVV</Label>
                      <Input
                        id="cardCVV"
                        type="password"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        data-testid="input-card-cvv"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === "bank" && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-account-holder"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="First National Bank"
                      data-testid="input-bank-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="1234567890"
                      data-testid="input-account-number"
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Base Services ({cart.items.length} {cart.items.length === 1 ? 'service' : 'services'})</span>
                  <span className="font-medium" data-testid="summary-base-services">{formatCurrency(baseServicesTotal)}</span>
                </div>
                {totalAddOns > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Add-ons & Extras</span>
                    <span className="font-medium" data-testid="summary-add-ons">{formatCurrency(totalAddOns)}</span>
                  </div>
                )}
                {totalDiscounts > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discounts</span>
                    <span className="font-medium" data-testid="summary-discounts">-{formatCurrency(totalDiscounts)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Services Subtotal</span>
                  <span className="font-medium text-gray-900" data-testid="summary-services-subtotal">{formatCurrency(servicesSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee (15%)</span>
                  <span className="font-medium" data-testid="summary-platform-fee">{formatCurrency(platformFee)}</span>
                </div>
                {totalTips > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success font-medium">Provider Tips</span>
                    <span className="font-medium text-success" data-testid="summary-tips">{formatCurrency(totalTips)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary" data-testid="summary-total">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-primary hover:bg-accent text-primary-foreground mb-4"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing || isCheckingOut}
                data-testid="button-complete-checkout"
              >
                {isProcessing || isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Payment
                  </>
                )}
              </Button>
              
              <div className="bg-muted rounded-lg p-4 text-sm">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Berry Events Bank Protection</p>
                    <p className="text-muted-foreground text-xs">
                      Your payment is held securely until services are completed. 
                      Full refund if service is not delivered as promised.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
