import React, { createContext, useContext, useEffect, useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';
import type { Cart } from '../services/marketplaceService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => void;
  checkout: () => Promise<any>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated || !user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await marketplaceService.getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart automatically when authentication state updates
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) return;
    try {
      const updatedCart = await marketplaceService.addToCart(productId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    if (!isAuthenticated) return;
    try {
      const updatedCart = await marketplaceService.updateCartItem(productId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated) return;
    try {
      const updatedCart = await marketplaceService.removeFromCart(productId);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const clearCart = () => {
    setCart(null);
  };

  const checkout = async () => {
    if (!isAuthenticated) return;
    try {
      const order = await marketplaceService.checkout();
      clearCart();
      return order;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        checkout,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
