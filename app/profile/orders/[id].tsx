import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, OrderItem } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';


const OrderDetailSkeleton = () => {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  return (
    <View style={styles.skeletonContainer}>
      <View style={[styles.skeletonSummary, { backgroundColor: themeColors.card }]} />
      <View style={[styles.skeletonHeader, { backgroundColor: themeColors.card }]} />
      {[...Array(2)].map((_, i) => (
        <View key={i} style={[styles.skeletonProduct, { backgroundColor: themeColors.card }]} />
      ))}
    </View>
  );
};

export default function OrderDetailPage() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order details:', error);
    } else {
      setOrder(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const renderProductItem = ({ item }: { item: OrderItem }) => {
    if (!item.products) return null;

    const price = typeof item.products.price === 'number' ? item.products.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    const subtotal = price * quantity;

    return (
      <View style={[styles.productContainer, { backgroundColor: themeColors.card }]}>
        <Image source={{ uri: item.products.image_url }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: themeColors.text }]} numberOfLines={2}>{item.products.name}</Text>
          <Text style={[styles.productPrice, { color: themeColors.text + '99' }]}>₦{price.toFixed(2)} x {quantity}</Text>
        </View>
        <Text style={[styles.subtotal, { color: themeColors.text }]}>₦{subtotal.toFixed(2)}</Text>
      </View>
    );
  };

  if (loading) {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Stack.Screen options={{ title: 'Loading Order...', headerTintColor: themeColors.primary }} />
            <OrderDetailSkeleton />
        </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Error', headerTintColor: themeColors.primary }} />
        <View style={styles.centeredContainer}>
          <Text style={[styles.emptyText, { color: themeColors.text }]}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const total = typeof order.total === 'number' ? order.total : 0;
  const totalItems = order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ title: `Order #${order.id}`, headerTintColor: themeColors.primary, headerTitleStyle: { fontWeight: 'bold'} }} />
      <FlatList
        data={order.order_items}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
                    <View style={styles.summaryRow}>
                        <Ionicons name="receipt-outline" size={24} color={themeColors.text} />
                        <Text style={[styles.summaryText, { color: themeColors.text }]}>Order ID: #{order.id}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Ionicons name="calendar-outline" size={24} color={themeColors.text} />
                        <Text style={[styles.summaryText, { color: themeColors.text }]}>{new Date(order.created_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Ionicons name="cube-outline" size={24} color={themeColors.text} />
                        <Text style={[styles.summaryText, { color: themeColors.text }]}>{totalItems} items</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={[styles.totalText, { color: themeColors.text }]}>Total Amount</Text>
                        <Text style={[styles.totalAmount, { color: themeColors.primary }]}>₦{total.toFixed(2)}</Text>
                    </View>
                </View>
                <Text style={[styles.productsHeader, { color: themeColors.text }]}>Products</Text>
            </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryText: {
    fontSize: 16,
    marginLeft: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  productsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    marginTop: 6,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
  },
  // Skeleton Styles
  skeletonContainer: {
    padding: 16,
  },
  skeletonSummary: {
    height: 220,
    borderRadius: 12,
    marginBottom: 24,
  },
  skeletonHeader: {
    height: 30,
    width: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonProduct: {
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
});
