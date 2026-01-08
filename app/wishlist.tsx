import { Text, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Wishlist</Text>
      <Text>This is where the user&apos;s wishlist will be displayed.</Text>
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
