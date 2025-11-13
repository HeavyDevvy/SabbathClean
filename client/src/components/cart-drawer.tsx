import { useState } from 'react';
import { ShoppingCart, X, Trash2, Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';
import { useLocation } from 'wouter';
import { parseDecimal, formatCurrency } from '@/lib/currency';
import type { CartItem } from '@shared/schema';

function CartItemCard({ item }: { item: CartItem }) {
  const { removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(item.id);
    } finally {
      setIsRemoving(false);
    }
  };

  const serviceDetails = item.serviceDetails ? 
    (typeof item.serviceDetails === 'string' ? JSON.parse(item.serviceDetails) : item.serviceDetails) 
    : {};

  return (
    <div className="group relative rounded-lg border border-gray-200 p-4 hover:border-purple-200 transition-all" data-testid={`cart-item-${item.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate" data-testid={`cart-item-name-${item.id}`}>
            {item.serviceName}
          </h4>
          <div className="mt-1 space-y-1">
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" />
              <span data-testid={`cart-item-date-${item.id}`}>
                {item.scheduledDate instanceof Date 
                  ? item.scheduledDate.toLocaleDateString() 
                  : new Date(item.scheduledDate).toLocaleDateString()}
              </span>
              <Clock className="w-3 h-3 ml-3 mr-1.5 flex-shrink-0" />
              <span data-testid={`cart-item-time-${item.id}`}>{item.scheduledTime}</span>
            </div>
            {serviceDetails.address && (
              <div className="flex items-start text-xs text-gray-600">
                <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1" data-testid={`cart-item-location-${item.id}`}>
                  {serviceDetails.address}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <p className="font-semibold text-purple-600 whitespace-nowrap" data-testid={`cart-item-price-${item.id}`}>
            {formatCurrency(item.subtotal)}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={handleRemove}
            disabled={isRemoving}
            data-testid={`button-remove-item-${item.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      {item.selectedAddOns && Array.isArray(item.selectedAddOns) && item.selectedAddOns.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Add-ons:</p>
          <div className="flex flex-wrap gap-1.5">
            {(item.selectedAddOns as string[]).map((addon, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs py-0.5 px-2"
                data-testid={`cart-item-addon-${item.id}-${idx}`}
              >
                {addon}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {item.comments && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-2" data-testid={`cart-item-comments-${item.id}`}>
            {item.comments}
          </p>
        </div>
      )}
    </div>
  );
}

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { cart, itemCount, isLoading, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
    } finally {
      setIsClearing(false);
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    navigate('/cart-checkout');
  };

  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + parseDecimal(item.subtotal), 
    0
  ) || 0;

  const platformFee = subtotal * 0.15;
  const total = subtotal + platformFee;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-open-cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground"
              data-testid="cart-badge-count"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col" data-testid="cart-drawer">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Your Cart</span>
            {itemCount > 0 && (
              <Badge variant="secondary" data-testid="cart-drawer-count">
                {itemCount} {itemCount === 1 ? 'service' : 'services'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {itemCount === 0 
              ? "Your cart is empty. Add services to book."
              : itemCount === 3
              ? "Maximum services reached (3/3)"
              : `Add up to ${3 - itemCount} more service${3 - itemCount === 1 ? '' : 's'}`
            }
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading cart...</p>
            </div>
          </div>
        ) : itemCount === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Browse our services and add them to your cart to get started
              </p>
              <Button onClick={() => { setOpen(false); navigate('/'); }} data-testid="button-browse-services">
                Browse Services
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-3">
                {cart?.items?.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee (15%)</span>
                  <span data-testid="cart-platform-fee">{formatCurrency(platformFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base text-gray-900">
                  <span>Total</span>
                  <span data-testid="cart-total">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="flex-1"
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
                  data-testid="button-proceed-checkout"
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <div className="relative">
      <ShoppingCart className="h-5 w-5" data-testid="cart-icon" />
      {itemCount > 0 && (
        <Badge
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground"
          data-testid="cart-icon-badge"
        >
          {itemCount}
        </Badge>
      )}
    </div>
  );
}
