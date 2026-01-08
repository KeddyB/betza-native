import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const productWidth = (width - 48) / 2;

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

const SearchSkeleton = () => (
    <View style={styles.skeletonContainer}>
        {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
    </View>
);

function SearchScreenContent() {
  const { q } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const fetchProducts = async () => {
      if (typeof q !== 'string' || q.length < 2) { // Changed to 2 for better UX
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${q}%`);

      if (error) {
        console.error('Error fetching search results:', error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    const searchTimeout = setTimeout(() => {
        fetchProducts();
    }, 300); // Debounce search input

    return () => clearTimeout(searchTimeout);
  }, [q]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Results for &quot;{q}&quot;</Text>
      {loading ? (
        <SearchSkeleton />
      ) : (
        <FlatList
          data={products}
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
                <Text style={[styles.emptyText, { color: themeColors.text }]}>No products found.</Text>
                <Text style={[styles.emptySubText, { color: themeColors.text + '99' }]}>Try searching for something else.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

export default function SearchPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SearchScreenContent />
    </>
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
    paddingTop: 16,
    marginBottom: 24,
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
    marginTop: 8,
  },
  // Skeleton Styles
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
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
