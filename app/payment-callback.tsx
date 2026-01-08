import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCart } from './context/CartContext';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function PaymentCallbackScreen() {
  const { reference } = useLocalSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference || typeof reference !== 'string') {
        Alert.alert('Error', 'Invalid payment reference.');
        router.replace('/(tabs)/cart');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { reference },
        });

        if (error) {
          throw new Error(error.message);
        }

        // Payment successful, clear the cart and navigate to the order confirmation
        clearCart();
        Alert.alert('Payment Successful', 'Your order has been placed.');
        router.replace(`/order/${data.order_id}`);

      } catch (error: any) {
        Alert.alert('Payment Failed', error.message || 'An unexpected error occurred.');
        router.replace('/(tabs)/cart');
      }
    };

    verifyPayment();
  }, [reference, clearCart, router]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
