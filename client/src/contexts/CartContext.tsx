import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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

  // Fetch cart from API
  const { data: cart, isLoading } = useQuery<CartWithItems>({
    queryKey: ['/api/cart'],
    retry: 1,
    staleTime: 30000, // 30 seconds
    onSuccess: (data) => {
      console.log("🛒 Cart data fetched successfully:", data);
      console.log("🛒 Cart items count:", data?.items?.length || 0);
      console.log("🛒 Cart items:", data?.items);
    },
    onError: (error) => {
      console.error("❌ Error fetching cart:", error);
    },
  });

  // Calculate item count
  const itemCount = cart?.items?.length || 0;
  
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
      console.log("➕ Adding item to cart via API:", item);
      const response = await apiRequest('POST', '/api/cart/items', item);
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
      const response = await apiRequest('DELETE', '/api/cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items removed from cart",
      });
    },
    onError: (error: any) => {
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
