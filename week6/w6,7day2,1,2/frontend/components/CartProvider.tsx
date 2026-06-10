'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  pointsPrice: number;
  pointsReward: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  usePoints: boolean;
  purchaseType: 'money' | 'points' | 'hybrid';
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  toggleUsePoints: (productId: string, color?: string, size?: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalPointsRequired: number;
  totalPointsToEarn: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => 
          item.productId === newItem.productId && 
          item.selectedColor === newItem.selectedColor && 
          item.selectedSize === newItem.selectedSize
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prev];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.selectedColor === color && item.selectedSize === size)));
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.selectedColor === color && item.selectedSize === size ? { ...item, quantity } : item
      )
    );
  };

  const toggleUsePoints = (productId: string, color?: string, size?: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.selectedColor === color && item.selectedSize === size) {
          if (item.purchaseType === 'money') return item;
          return { ...item, usePoints: !item.usePoints };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => {
    if (item.usePoints) return sum;
    return sum + item.price * item.quantity;
  }, 0);

  const totalPointsRequired = cart.reduce((sum, item) => {
    if (!item.usePoints) return sum;
    return sum + (item.pointsPrice || 0) * item.quantity;
  }, 0);

  const totalPointsToEarn = cart.reduce((sum, item) => {
    if (item.usePoints) return sum;
    return sum + (item.pointsReward || 0) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleUsePoints,
        clearCart,
        totalAmount,
        totalPointsRequired,
        totalPointsToEarn,
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
