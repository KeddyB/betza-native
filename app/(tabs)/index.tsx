import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Pressable, Dimensions, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Product, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Skeleton Loader Components
const { width } = Dimensions.get('window');
const productWidth = (width - 48) / 2;

const CategorySkeleton = () => {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (
        <View style={styles.categoryItem}>
            <View style={[styles.categoryIconCircle, { backgroundColor: themeColors.card }]} />
            <View style={[styles.skeletonText, { width: 50, height: 10, backgroundColor: themeColors.card }]} />
        </View>
    );
};

const ProductCardSkeleton = () => {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (
        <View style={[styles.skeletonProductCard, { backgroundColor: themeColors.card, width: productWidth }]}>
            <View style={[styles.skeletonImage, { backgroundColor: themeColors.background }]} />
            <View style={[styles.skeletonText, { height: 12, width: '80%', backgroundColor: themeColors.background }]} />
            <View style={[styles.skeletonText, { height: 10, width: '50%', backgroundColor: themeColors.background }]} />
            <View style={[styles.skeletonButton, { backgroundColor: themeColors.background }]} />
        </View>
    );
};

const HomePageSkeleton = () => {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (
        <View style={styles.container}>
            {/* Banner Skeleton */}
            <View style={[styles.bannerContainer, { backgroundColor: themeColors.card }]} />

            {/* Categories Skeleton */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                {[...Array(5)].map((_, i) => <CategorySkeleton key={i} />)}
            </ScrollView>

            {/* Product Section Skeleton */}
            <View style={styles.sectionContainer}>
                <View style={[styles.skeletonText, { height: 20, width: 120, marginBottom: 16, backgroundColor: themeColors.card }]} />
                <View style={styles.productsGrid}>
                    {[...Array(2)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </View>
            </View>
            <View style={styles.sectionContainer}>
                <View style={[styles.skeletonText, { height: 20, width: 150, marginBottom: 16, backgroundColor: themeColors.card }]} />
                <View style={styles.productsGrid}>
                    {[...Array(2)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </View>
            </View>
        </View>
    );
};


interface GroupedProducts {
  [key: string]: Product[];
}

export default function HomePage() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = useCallback(async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('products').select('*')
      ]);

      const { data: categoriesData, error: categoriesError } = categoriesRes;
      const { data: productsData, error: productsError } = productsRes;

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError.message);
      }
      setCategories(categoriesData || []);

      if (productsError) {
        console.error('Error fetching products:', productsError.message);
      }

      const grouped = (productsData || []).reduce((acc: GroupedProducts, product: Product) => {
        const categoryName = categoriesData?.find(cat => cat.id === product.category_id)?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(product);
        return acc;
      }, {});
      setGroupedProducts(grouped);

    } catch(error) {
      console.error('Failed to fetch home data:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchHomeData().finally(() => setLoading(false));
  }, [fetchHomeData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }, [fetchHomeData]);

  if (loading) {
      return (
          <View style={[styles.mainContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
              <HomePageSkeleton />
          </View>
      );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors[colorScheme ?? 'light'].primary}
                />
            }
        >
        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
            <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Up to 30% offer</Text>
                <Text style={styles.bannerSubtitle}>Enjoy our big offer</Text>
                <Pressable style={styles.shopNowButton}>
                    <Text style={styles.shopNowText}>Shop Now</Text>
                </Pressable>
            </View>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }} // Fresh produce basket image
                style={styles.bannerImage}
                resizeMode="cover"
            />
        </View>

        {/* Circular Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryItem} onPress={() => router.push(`/category/${category.name}`)}>
                <View style={styles.categoryIconCircle}>
                    <Image
                    source={{ uri: category.icon || 'https://cdn-icons-png.flaticon.com/512/3082/3082025.png' }}
                    style={styles.categoryImage}
                    />
                </View>
                <Text style={[styles.categoryName, { color: Colors[colorScheme ?? 'light'].text }]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Sections */}
        {Object.keys(groupedProducts).map((categoryName) => (
            <View key={categoryName} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>{categoryName}</Text>
                <TouchableOpacity onPress={() => router.push(`/category/${categoryName}`)}>
                <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontWeight: '600' }}>See all</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.productsGrid}>
                {groupedProducts[categoryName].slice(0, 4).map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/product/${product.id}`)}
                />
                ))}
            </View>
            </View>
        ))}
         <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  bannerContainer: {
    backgroundColor: '#D1FAE5',
    margin: 16,
    borderRadius: 16,
    height: 160,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 16,
  },
  shopNowButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bannerImage: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Skeleton Styles
  skeletonText: {
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonProductCard: {
      marginBottom: 16,
      borderRadius: 12,
      padding: 10,
  },
  skeletonImage: {
      height: 120,
      borderRadius: 8,
      marginBottom: 10,
  },
  skeletonButton: {
      height: 40,
      borderRadius: 8,
      marginTop: 10,
  }
});
