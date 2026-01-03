import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle2, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseDecimal, formatCurrency } from "@/lib/currency";
import type { CartItem } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { YocoPaymentButton } from "@/components/YocoPaymentButton";

export default function CartCheckout() {
  const { cart, isLoading, checkout, isCheckingOut } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  
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
  
  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      const order = await checkout({
        paymentMethod: "yoco"
      });
      
      if (order && order.id) {
        setCreatedOrder(order);
        toast({
          title: "Order Created",
          description: "Please complete your payment to finalize the booking.",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "Please try again or contact support.",
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
              
              {createdOrder ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 mb-4">
                     <p className="font-semibold">Order Created!</p>
                     <p>Please complete your payment below.</p>
                  </div>
                  <YocoPaymentButton
                    bookingRef={createdOrder.id}
                    amount={total}
                    description={`Berry Events Order ${createdOrder.orderNumber || createdOrder.id.slice(0, 8)}`}
                  />
                </div>
              ) : (
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
                      Proceed to Payment
                    </>
                  )}
                </Button>
              )}
              
              <div className="bg-muted rounded-lg p-4 text-sm mt-4">
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
