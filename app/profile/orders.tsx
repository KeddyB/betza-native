import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order } from '@/lib/types';

const OrderSkeleton = () => {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  return (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={[styles.skeletonOrder, { backgroundColor: themeColors.card }]} />
      ))}
    </View>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const renderOrderItem = useCallback(({ item }: { item: Order }) => {
    const total = typeof item.total === 'number' ? item.total : 0;

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/profile/orders/${item.id}`)} 
        style={[styles.orderContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
      >
        <View style={styles.orderHeader}>
            <Text style={[styles.orderId, { color: themeColors.text }]}>Order #{item.id}</Text>
            <Text style={[styles.orderDate, { color: themeColors.text }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        
        {(item.order_items || []).map(orderItem => {
          if (!orderItem || !orderItem.products) {
            return (
                <View key={orderItem?.id || Math.random()} style={styles.productContainer}>
                    <Text style={{ color: themeColors.text, fontStyle: 'italic' }}>Product not available</Text>
                </View>
            );
          }
          
          const productPrice = typeof orderItem.products.price === 'number' ? orderItem.products.price : 0;
          const quantity = typeof orderItem.quantity === 'number' ? orderItem.quantity : 0;
          const subtotal = productPrice * quantity;

          return (
            <View key={orderItem.id} style={styles.productContainer}>
              <Text style={{ color: themeColors.text, flex: 1 }} numberOfLines={1}>{orderItem.products.name} (x{quantity})</Text>
              <Text style={{ color: themeColors.text }}>₦{subtotal.toFixed(2)}</Text>
            </View>
          );
        })}

        <View style={styles.totalContainer}>
            <Text style={[styles.orderTotal, { color: themeColors.primary }]}>Total: ₦{total.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [themeColors, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: themeColors.text }]}>My Orders</Text>
      {loading ? (
        <OrderSkeleton />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary}/>}
          ListEmptyComponent={() => (
            <Text style={[styles.emptyText, { color: themeColors.text }]}>You have no orders yet.</Text>
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
  orderContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  productContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  skeletonContainer: {
    paddingTop: 16,
  },
  skeletonOrder: {
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
});
