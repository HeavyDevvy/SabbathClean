import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Edit2, 
  Trash2, 
  Calendar,
  Clock,
  User,
  Plus,
  CreditCard
} from "lucide-react";
import type { ServiceDraft } from "@/lib/paymentAggregator";
import { aggregatePayments } from "@/lib/paymentAggregator";

interface BookingCartProps {
  bookingDrafts: ServiceDraft[];
  onRemoveService: (index: number) => void;
  onEditService: (draft: ServiceDraft, index: number) => void;
  onAddService: () => void;
  onProceedToCheckout: () => void;
  maxServices?: number;
}

export default function BookingCart({
  bookingDrafts,
  onRemoveService,
  onEditService,
  onAddService,
  onProceedToCheckout,
  maxServices = 3
}: BookingCartProps) {
  const cartCount = bookingDrafts.length;
  const isMaxReached = cartCount >= maxServices;
  const hasServices = cartCount > 0;

  const aggregated = hasServices ? aggregatePayments(bookingDrafts) : null;

  if (!hasServices) {
    return (
      <Card className="sticky top-20 shadow-lg border-2 border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <ShoppingCart className="h-5 w-5 mr-2 text-gray-400" />
            Your Booking Cart
            <Badge variant="secondary" className="ml-auto">0 Services</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No services added yet</p>
            <p className="text-xs text-gray-400">Select a service to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-20 shadow-lg border-2 border-blue-100">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center text-lg">
          <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
          Your Booking Cart
          <Badge className="ml-auto bg-blue-600">{cartCount} Service{cartCount > 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Service List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {bookingDrafts.map((draft, index) => (
            <div 
              key={`${draft.serviceId}-${index}`}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {draft.serviceName}
                  </h4>
                  {draft.selectedProvider && (
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <User className="h-3 w-3 mr-1" />
                      {draft.selectedProvider.name}
                    </div>
                  )}
                  {draft.preferredDate && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {draft.preferredDate}
                      {draft.timePreference && (
                        <>
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {draft.timePreference}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 text-sm">
                    R{draft.pricing.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Add-ons */}
              {draft.selectedAddOns && draft.selectedAddOns.length > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                  +{draft.selectedAddOns.length} add-on{draft.selectedAddOns.length > 1 ? 's' : ''}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditService(draft, index)}
                  className="flex-1 text-xs h-7 hover:bg-blue-50 hover:text-blue-600"
                  data-testid={`button-edit-service-${index}`}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveService(index)}
                  className="flex-1 text-xs h-7 hover:bg-red-50 hover:text-red-600"
                  data-testid={`button-remove-service-${index}`}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        {aggregated && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>R{aggregated.subtotal.toLocaleString()}</span>
            </div>
            {aggregated.totalAddOns > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Add-ons</span>
                <span className="text-green-600">+R{aggregated.totalAddOns.toLocaleString()}</span>
              </div>
            )}
            {aggregated.totalDiscounts > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discounts</span>
                <span className="text-red-600">-R{aggregated.totalDiscounts.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span className="text-blue-600">R{aggregated.grandTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Includes R{aggregated.commission.toLocaleString()} platform fee (15%)
            </p>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isMaxReached && (
            <Button
              variant="outline"
              className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={onAddService}
              data-testid="button-add-another-service-cart"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service ({cartCount}/{maxServices})
            </Button>
          )}
          
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            onClick={onProceedToCheckout}
            data-testid="button-proceed-to-checkout"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Proceed to Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
