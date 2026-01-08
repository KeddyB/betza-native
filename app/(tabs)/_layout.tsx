import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useState, useMemo } from 'react';
import { useCart } from '@/app/context/CartContext';

function SearchBar({ colorScheme }: { colorScheme: 'light' | 'dark' | null | undefined }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      router.push(`/search?q=${searchQuery.trim()}`);
    }
  };

  return (
    <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }]}>
      <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].text} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
        placeholder="Search..."
        placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
    </View>
  );
}

const CustomHeader = ({ colorScheme }: { colorScheme: 'light' | 'dark' | null | undefined }) => {
  return useMemo(() => (
    <View style={[styles.customHeader, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
      <SearchBar colorScheme={colorScheme} />
    </View>
  ), [colorScheme]);
};

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const { cart } = useCart();
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: true,
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          header: () => <CustomHeader colorScheme={colorScheme} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, margin: 5 }}>
              <MaterialIcons name="shopping-cart" size={24} color={color} />
              {totalCartItems > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{totalCartItems}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customHeader: {
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
