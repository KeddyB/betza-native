import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/lib/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void; // Modified to accept quantity
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Helper function to update quantity
  const updateCartQuantity = (productId: number, newQuantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);

      if (existingItem) {
        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          return prevCart.filter((item) => item.id !== productId);
        } else {
          return prevCart.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          );
        }
      } else if (newQuantity > 0) {
        // If item doesn't exist and newQuantity > 0, do nothing or add with quantity.
        // For now, we assume `addToCart` handles adding new items.
        return prevCart; 
      }
      return prevCart;
    });
  };

  const addToCart = (product: Product, quantity: number = 1) => { // Default quantity to 1
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
