import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function CategoryPage() {
  const { category } = useLocalSearchParams();
  const { colorScheme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;

      try {
        setLoading(true);
        // First, find the category ID from the category name
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();

        if (categoryError || !categoryData) {
          console.error('Error fetching category:', categoryError);
          setProducts([]);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('* ')
          .eq('category_id', categoryData.id);

        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setProducts(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>{category}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => {}} />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    justifyContent: 'space-between',
  },
});
