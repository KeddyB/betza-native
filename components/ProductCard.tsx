import { View, Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/lib/types';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/app/context/ToastContext';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const defaultProductWidth = (screenWidth - 48) / 2;

export default function ProductCard({ product, onPress, width = defaultProductWidth }: ProductCardProps) {
  const { cart, addToCart, removeFromCart, updateCartQuantity } = useCart();
  const { showToast } = useToast();
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [quantity, setQuantity] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  useEffect(() => {
    const cartItem = cart.find(item => item.id === product.id);
    setQuantity(cartItem ? cartItem.quantity : 0);
  }, [cart, product.id]);

  useEffect(() => {
    const checkIfInWishlist = async () => {
      setLoadingWishlist(true);
      const userId = await getUserId();
      if (!userId) {
        setLoadingWishlist(false);
        return;
      }
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (data && !error) {
        setIsInWishlist(true);
      } else {
        setIsInWishlist(false);
      }
      setLoadingWishlist(false);
    };
    checkIfInWishlist();
  }, [product.id]);

  const handleAddToCart = useCallback(() => {
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success', 'top');
  }, [product, addToCart, showToast]);

  const incrementQuantity = useCallback(() => {
    updateCartQuantity(product.id, quantity + 1);
  }, [product.id, quantity, updateCartQuantity]);

  const decrementQuantity = useCallback(() => {
    if (quantity === 1) {
      removeFromCart(product.id);
      showToast(`${product.name} removed from cart!`, 'info', 'top');
    } else {
      updateCartQuantity(product.id, quantity - 1);
    }
  }, [product.id, quantity, removeFromCart, updateCartQuantity, showToast]);

  const handleWishlistToggle = async () => {
    const userId = await getUserId();
    if (!userId) {
      showToast('You must be logged in to manage your wishlist.', 'error', 'top');
      return;
    }

    if (isInWishlist) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', product.id);
      if (error) {
        showToast('Error removing from wishlist.', 'error', 'top');
      } else {
        setIsInWishlist(false);
        showToast(`${product.name} removed from wishlist.`, 'info', 'top');
      }
    } else {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id: product.id });
      if (error) {
        showToast('Error adding to wishlist.', 'error', 'top');
      } else {
        setIsInWishlist(true);
        showToast(`${product.name} added to wishlist!`, 'success', 'top');
      }
    }
  };


  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width: width, backgroundColor: themeColors.card },
        pressed && styles.pressed,
      ]}
    >
        <View style={styles.imageContainer}>
            <Pressable
                style={styles.wishlistButton}
                onPress={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle();
                }}
                disabled={loadingWishlist}
                >
                <Ionicons
                    name={isInWishlist ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isInWishlist ? themeColors.primary : themeColors.text}
                />
            </Pressable>
            <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="contain"
            />
            <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₦{product.price.toFixed(2)}</Text>
            </View>
        </View>

        <View style={styles.content}>
            <Text style={[styles.productName, { color: themeColors.text }]} numberOfLines={1}>
            {product.name}
            </Text>
            <Text style={[styles.categoryName, { color: themeColors.text + '99' }]} numberOfLines={1}>
            {product.category}
            </Text>
        </View>

        {quantity === 0 ? (
            <Pressable
            style={({ pressed }) => [
                styles.addToCartButton,
                {
                    backgroundColor: pressed ? themeColors.primary + 'E6' : themeColors.primary,
                }
            ]}
            onPress={(e) => {
                e.stopPropagation();
                handleAddToCart();
            }}
            >
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
            </Pressable>
        ) : (
            <View style={styles.quantityControl}>
            <Pressable onPress={decrementQuantity} style={styles.controlButton}>
                <Ionicons name={quantity === 1 ? 'trash-outline' : 'remove'} size={18} color={themeColors.primary} />
            </Pressable>
            <Text style={[styles.quantityText, { color: themeColors.text }]}>{quantity}</Text>
            <Pressable onPress={incrementQuantity} style={styles.controlButton}>
                <Ionicons name="add" size={18} color={themeColors.primary} />
            </Pressable>
            </View>
        )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
  },
  imageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginBottom: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#D1FAE5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  content: {
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 12,
    marginTop: 2,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  controlButton: {
    paddingHorizontal: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
    padding: 4,
  },
});
