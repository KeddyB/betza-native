import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/app/context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '@/components/ProductCard';

const { height, width } = Dimensions.get('window');

const ProductDetailSkeleton = () => {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.flex}>
      <View style={[styles.skeletonImage, { backgroundColor: themeColors.card }]} />
      <View style={[styles.detailsContainer, { backgroundColor: themeColors.background }]}>
        <View style={[styles.skeletonText, { height: 30, width: '70%', backgroundColor: themeColors.card }]} />
        <View style={[styles.skeletonText, { height: 20, width: '40%', marginTop: 12, backgroundColor: themeColors.card }]} />
        <View style={[styles.skeletonText, { height: 80, marginTop: 24, backgroundColor: themeColors.card }]} />
        <View style={[styles.skeletonText, { height: 20, width: '50%', marginTop: 24, backgroundColor: themeColors.card }]} />
        <View style={styles.skeletonSimilarProducts} >
            <View style={[styles.skeletonProductCard, {backgroundColor: themeColors.card}]}></View>
            <View style={[styles.skeletonProductCard, {backgroundColor: themeColors.card}]}></View>
        </View>
      </View>
      <View style={[styles.bottomBar, { backgroundColor: themeColors.background, borderTopColor: themeColors.border }]}>
        <View style={[styles.skeletonButton, { width: 120, backgroundColor: themeColors.card }]}/>
        <View style={[styles.skeletonButton, { flex: 1, marginLeft: 16, backgroundColor: themeColors.card }]}/>
      </View>
    </View>
  );
};

function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  
  const router = useRouter();
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { cart, addToCart, updateCartQuantity } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);

  const fetchProductData = useCallback(async (productId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product details:', error);
      return null;
    } else {
      return data;
    }
  }, []);

  const fetchSimilarProducts = useCallback(async (categoryId: number, productId: number) => {
    if (!categoryId) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(6);

    if (!error) {
        setSimilarProducts(data);
    }
  }, []);

  const fetchWishlistStatus = useCallback(async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoadingWishlist(false);
      return;
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    setIsInWishlist(!!data && !error);
    setLoadingWishlist(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
        if (typeof id !== 'string') return;
        setLoading(true);
        
        const productData = await fetchProductData(id);
        setProduct(productData);

        if (productData) {
            const cartItem = cart.find(item => item.id === productData.id);
            setQuantity(cartItem ? cartItem.quantity : 1);
            fetchSimilarProducts(productData.category_id, productData.id);
        }

        fetchWishlistStatus(id);
        setLoading(false);
    };
    
    loadData();
  }, [id, cart, fetchProductData, fetchSimilarProducts, fetchWishlistStatus]);

  const handleWishlistToggle = async () => {
    if (!product) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast('Please log in to manage your wishlist.', 'error');
      return;
    }

    setLoadingWishlist(true);
    if (isInWishlist) {
      const { error } = await supabase.from('wishlist').delete().match({ user_id: user.id, product_id: product.id });
      if (!error) {
        setIsInWishlist(false);
        showToast('Removed from wishlist.', 'info');
      } else {
        showToast('Failed to remove from wishlist.', 'error');
      }
    } else {
      const { error } = await supabase.from('wishlist').insert({ user_id: user.id, product_id: product.id });
      if (!error) {
        setIsInWishlist(true);
        showToast('Added to wishlist!', 'success');
      } else {
        showToast('Failed to add to wishlist.', 'error');
      }
    }
    setLoadingWishlist(false);
  };

  const handleAddToCart = () => {
      if (!product) return;
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
          updateCartQuantity(product.id, cartItem.quantity + quantity);
      } else {
          addToCart(product, quantity);
      }
      showToast('Added to cart!', 'success');
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: themeColors.background }]}>
        <View style={styles.centeredContainer}>
          <Text style={{ color: themeColors.text }}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: themeColors.card + '80' }]}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                 <TouchableOpacity onPress={handleWishlistToggle} disabled={loadingWishlist} style={[styles.iconButton, { backgroundColor: themeColors.card + '80' }]}>
                    <Ionicons name={isInWishlist ? 'heart' : 'heart-outline'} size={24} color={isInWishlist ? themeColors.primary : themeColors.text} />
                </TouchableOpacity>
            </View>

            <View style={[styles.imageContainer, { backgroundColor: themeColors.card }]}>
              <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
            </View>

            <View style={[styles.detailsContainer, { backgroundColor: themeColors.background }]}>
                <Text style={[styles.name, { color: themeColors.text }]}>{product.name}</Text>
                
                <View style={styles.row}>
                    <Text style={[styles.price, { color: themeColors.primary }]}>₦{product.price.toFixed(2)}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FFC107" />
                        <Text style={[styles.ratingText, { color: themeColors.text }]}> {product.rating || 4.8} ({product.review_count || 198} Reviews)</Text>
                    </View>
                </View>
                
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Description</Text>
                <Text style={[styles.description, { color: themeColors.text + 'AA' }]}>{product.description || 'No description available.'}</Text>

                {similarProducts.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Similar Products</Text>
                        <FlatList 
                            data={similarProducts}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({item}) => (
                                <ProductCard 
                                    product={item} 
                                    onPress={() => router.push(`/product/${item.id}`)} 
                                    width={width / 2.5}
                                />
                            )}
                            ItemSeparatorComponent={() => <View style={{width: 16}}/>}
                            contentContainerStyle={{ paddingVertical: 16 }}
                        />
                    </>
                )}
            </View>

        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: themeColors.background, borderTopColor: themeColors.border }]}>
            <View style={styles.quantitySelector}>
                <TouchableOpacity onPress={decrementQuantity} style={[styles.qtyBtn, { backgroundColor: themeColors.card }]}>
                    <Ionicons name="remove" size={22} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: themeColors.text }]}>{quantity}</Text>
                <TouchableOpacity onPress={incrementQuantity} style={[styles.qtyBtn, { backgroundColor: themeColors.card }]}>
                    <Ionicons name="add" size={22} color={themeColors.text} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleAddToCart} style={[styles.addToCartButton, { backgroundColor: themeColors.primary }]}>
                <Ionicons name="cart-outline" size={24} color="#fff" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

export default function ProductDetailPage() {
  return <ProductDetailScreen />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  iconButton: {
      padding: 10,
      borderRadius: 25,
  },
  imageContainer: {
    // No hardcoded background color
  },
  image: {
    width: '100%',
    height: height * 0.5,
  },
  detailsContainer: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  ratingText: {
      fontSize: 14,
      marginLeft: 5,
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 24,
      marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 12,
      alignItems: 'center',
      borderTopWidth: 1,
  },
  quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  qtyBtn: {
      padding: 8,
      borderRadius: 8,
  },
  qtyText: {
      fontWeight: 'bold',
      fontSize: 20,
      marginHorizontal: 16,
  },
  addToCartButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 16,
      marginLeft: 16,
  },
  addToCartText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
  },
  // Skeleton Styles
  skeletonImage: {
      height: height * 0.5,
  },
  skeletonText: {
      borderRadius: 8,
  },
  skeletonButton: {
      height: 55,
      borderRadius: 16,
  },
  skeletonSimilarProducts: {
    flexDirection: 'row',
    marginTop: 16,
  },
  skeletonProductCard: {
      width: width / 2.5,
      height: 250,
      borderRadius: 12,
      marginRight: 16,
  }
});
