import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Cart, CartItem, Order } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface CartWithItems extends Cart {
  items: CartItem[];
}

interface CartContextType {
  cart: CartWithItems | null;
  itemCount: number;
  isLoading: boolean;
  addToCart: (item: Partial<CartItem>) => Promise<void>;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (paymentData: any) => Promise<Order | null>;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Helper to normalize cart item prices from decimal strings to numbers
  const normalizeCartData = (data: CartWithItems | null): CartWithItems | null => {
    if (!data) return null;
    
    return {
      ...data,
      items: data.items?.map(item => ({
        ...item,
        basePrice: item.basePrice,
        addOnsPrice: item.addOnsPrice,
        subtotal: item.subtotal,
      })) || []
    };
  };

  // Fetch cart from API with optimized cache settings
  const { data: rawCart, isLoading } = useQuery<CartWithItems>({
    queryKey: ['/api/cart'],
    retry: 1,
    staleTime: 60000, // 1 minute - cart data doesn't change frequently
    gcTime: 300000, // 5 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on every window focus
  });
  
  // Memoize normalized cart data to prevent unnecessary recalculations
  const cart = useMemo(() => normalizeCartData(rawCart || null), [rawCart]);

  // Memoize item count calculation - watch cart reference to catch all changes
  const itemCount = useMemo(() => cart?.items?.length || 0, [cart]);
  
  // Debug: Log cart state changes
  useEffect(() => {
    console.log("🔄 Cart state updated:");
    console.log("  - Items count:", itemCount);
    console.log("  - Cart object:", cart);
    console.log("  - Is loading:", isLoading);
  }, [cart, itemCount, isLoading]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (item: Partial<CartItem>) => {
      console.log("➕ Adding item to cart via API (raw):", item);

      // Normalize types to match backend schema (decimal fields as strings, ISO date)
      const normalizedScheduledDate = typeof item.scheduledDate === 'string'
        ? item.scheduledDate
        : (item.scheduledDate instanceof Date ? item.scheduledDate.toISOString() : String(item.scheduledDate || ''));

      const toStringOrZero = (v: any) => (
        v === undefined || v === null ? '0' : typeof v === 'string' ? v : String(v)
      );

      const transformedItem = {
        serviceId: item.serviceId,
        serviceType: item.serviceId, // backend expects a textual service type; map from id
        serviceName: item.serviceName,
        providerId: item.providerId ?? null,
        scheduledDate: normalizedScheduledDate,
        scheduledTime: item.scheduledTime,
        duration: parseInt((item.duration as any)?.toString().replace(/[^\d]/g, '') || '2', 10),
        basePrice: toStringOrZero(item.basePrice),
        addOnsPrice: toStringOrZero(item.addOnsPrice),
        subtotal: toStringOrZero(item.subtotal),
        tipAmount: toStringOrZero(item.tipAmount),
        selectedAddOns: Array.isArray(item.selectedAddOns) ? item.selectedAddOns : [],
        comments: item.comments ?? null,
        serviceDetails: item.serviceDetails ?? null,
      } as any;

      console.log("➕ Transformed item for API:", transformedItem);
      const response = await apiRequest('POST', '/api/cart/items', transformedItem);
      const data = await response.json();
      console.log("✅ Item added successfully, API response:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("✅ Add to cart mutation successful");
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Service added to your booking cart",
      });
    },
    onError: (error: any) => {
      console.error("❌ Add to cart mutation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add service to cart",
        variant: "destructive",
      });
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: Partial<CartItem> }) => {
      const response = await apiRequest('PATCH', `/api/cart/items/${itemId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Updated",
        description: "Cart item updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/cart/items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Removed",
        description: "Service removed from cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      console.log("🗑️ Clearing cart via API...");
      const response = await apiRequest('DELETE', '/api/cart');
      const data = await response.json();
      console.log("✅ Cart cleared successfully:", data);
      return data;
    },
    onSuccess: () => {
      console.log("✅ Clear cart mutation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items removed from cart",
      });
    },
    onError: (error: any) => {
      console.error("❌ Clear cart mutation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest('POST', '/api/cart/checkout', paymentData);
      const data = await response.json();
      return data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  // Context methods
  const addToCart = async (item: Partial<CartItem>) => {
    await addToCartMutation.mutateAsync(item);
  };

  const updateCartItem = async (itemId: string, updates: Partial<CartItem>) => {
    await updateCartItemMutation.mutateAsync({ itemId, updates });
  };

  const removeFromCart = async (itemId: string) => {
    await removeFromCartMutation.mutateAsync(itemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const checkout = async (paymentData: any): Promise<Order | null> => {
    setIsCheckingOut(true);
    try {
      const order = await checkoutMutation.mutateAsync(paymentData);
      
      toast({
        title: "Order confirmed!",
        description: "Your booking has been confirmed successfully",
      });
      
      return order;
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to complete checkout",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Sync with localStorage for offline capability
  useEffect(() => {
    if (cart) {
      localStorage.setItem('berry_cart_cache', JSON.stringify({
        timestamp: Date.now(),
        cart,
      }));
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart: cart || null,
        itemCount,
        isLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        checkout,
        isCheckingOut,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
