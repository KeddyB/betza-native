import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isProductInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      const wishlistItems = data.map(item => item.products as Product);
      setWishlist(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const addToWishlist = async (product: Product) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: product.id }]);
      if (error) throw error;
      setWishlist(prev => [...prev, product]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
      setWishlist(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isProductInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isProductInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
