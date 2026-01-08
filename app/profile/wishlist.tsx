import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const productWidth = (width - 48) / 2; // 16 padding on each side, 16 gap

const ProductCardSkeleton = () => {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (
        <View style={[styles.skeletonProductCard, { backgroundColor: themeColors.card, width: productWidth }]}>
            <View style={[styles.skeletonImage, { backgroundColor: themeColors.background }]} />
            <View style={[styles.skeletonText, { height: 12, width: '80%', marginTop: 8, backgroundColor: themeColors.background }]} />
            <View style={[styles.skeletonText, { height: 10, width: '50%', marginTop: 4, backgroundColor: themeColors.background }]} />
            <View style={[styles.skeletonButton, { backgroundColor: themeColors.background }]} />
        </View>
    );
};

const WishlistSkeleton = () => {
    return (
        <View style={styles.skeletonContainer}>
            {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </View>
    );
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const fetchWishlist = useCallback(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('wishlist') // Corrected table name
        .select('products(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
      } else {
        const products = data.map(item => item.products).filter(p => p !== null) as Product[];
        setWishlist(products);
      }
      setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'My Wishlist', headerTintColor: themeColors.primary, headerTitleStyle: { fontWeight: 'bold'} }} />
        <Text style={[styles.title, { color: themeColors.text }]}>My Wishlist</Text>
        {loading ? (
            <WishlistSkeleton />
        ) : (
            <FlatList
                data={wishlist}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onPress={() => router.push(`/product/${item.id}`)}
                    />
                )}
                columnWrapperStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, { color: themeColors.text }]}>Your wishlist is empty.</Text>
                      <Text style={[styles.emptySubText, { color: themeColors.text }]}>Tap the heart on any product to add it here.</Text>
                    </View>
                )}
            />
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    paddingTop: 16,
  },
  listContainer: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 8,
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  // Skeleton Product Card Styles
  skeletonProductCard: {
      marginBottom: 16,
      borderRadius: 12,
      padding: 10,
  },
  skeletonImage: {
      height: 120,
      borderRadius: 8,
  },
  skeletonText: {
      borderRadius: 4,
  },
  skeletonButton: {
      height: 40,
      borderRadius: 8,
      marginTop: 12,
  }
});
