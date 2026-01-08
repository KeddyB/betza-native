import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/app/context/ToastContext';

const AddressSkeleton = () => (
    <View style={styles.skeletonContainer}>
        <View style={styles.skeletonInput} />
        <View style={styles.skeletonInput} />
        <View style={styles.skeletonInput} />
        <View style={styles.skeletonButton} />
    </View>
);

export default function AddressBookPage() {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { showToast } = useToast();

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  useEffect(() => {
    const fetchAddress = async () => {
      const userId = await getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('address, city, country')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching address:', error);
      } else if (data) {
        setAddress(data.address || '');
        setCity(data.city || '');
        setCountry(data.country || '');
      }
      setLoading(false);
    };

    fetchAddress();
  }, []);

  const handleUpdateAddress = async () => {
    const userId = await getUserId();
    if (!userId) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ address, city, country })
      .eq('id', userId);

    if (error) {
      showToast('Error updating address.', 'error', 'top');
    } else {
      showToast('Address updated successfully!', 'success', 'top');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ title: 'Address Book' }} />
      <Text style={[styles.title, { color: themeColors.text }]}>Address Book</Text>
      {loading ? (
        <AddressSkeleton />
      ) : (
        <View>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.card }]}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.card }]}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.card }]}
            placeholder="Country"
            value={country}
            onChangeText={setCountry}
          />
          <Button title="Update Address" onPress={handleUpdateAddress} color={themeColors.primary} />
        </View>
      )}
    </SafeAreaView>
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
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  skeletonContainer: {
      padding: 16,
  },
  skeletonInput: {
      height: 50,
      backgroundColor: '#E5E7EB',
      borderRadius: 8,
      marginBottom: 16,
  },
  skeletonButton: {
      height: 40,
      backgroundColor: '#E5E7EB',
      borderRadius: 8,
  }
});
