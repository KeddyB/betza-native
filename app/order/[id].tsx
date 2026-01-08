import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{color: themeColors.text}}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: themeColors.text }]}>Order Details</Text>
            <View style={{width: 24}}/>
        </View>

        <View style={[styles.card, {backgroundColor: themeColors.card}]}>
            <Text style={[styles.cardTitle, {color: themeColors.text}]}>Order Summary</Text>
            <View style={styles.summaryRow}>
                <Text style={{color: themeColors.text}}>Order ID:</Text>
                <Text style={{color: themeColors.text}}>{order.id.slice(0, 8)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={{color: themeColors.text}}>Date:</Text>
                <Text style={{color: themeColors.text}}>{new Date(order.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={{color: themeColors.text}}>Total:</Text>
                <Text style={{color: themeColors.primary, fontWeight: 'bold'}}>₦{(order.total_amount || 0).toFixed(2)}</Text>
            </View>
        </View>

        <FlatList
            data={order.order_items}
            keyExtractor={(item) => item.product_id}
            renderItem={({ item }) => (
            <View style={[styles.itemCard, { backgroundColor: themeColors.card }]}>
                <Image source={{ uri: item.products.image_url }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, {color: themeColors.text}]}>{item.products.name}</Text>
                    <Text style={{color: themeColors.text + '99'}}>Quantity: {item.quantity}</Text>
                </View>
                <Text style={[styles.itemPrice, {color: themeColors.text}]}>₦{((item.products.price || 0) * item.quantity).toFixed(2)}</Text>
            </View>
            )}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        margin: 24,
        padding: 16,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '500',
    },
});
