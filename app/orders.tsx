import { Text, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <Text>This is where the user&apos;s order history will be displayed.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
});
