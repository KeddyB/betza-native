import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Skeleton Loader Component
const ProfilePageSkeleton = () => {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <View style={[styles.skeletonText, { height: 24, width: 200, backgroundColor: themeColors.card, marginBottom: 32 }]} />
            </View>
            <View style={styles.menuContainer}>
                {[...Array(4)].map((_, i) => (
                    <View key={i} style={styles.menuItem}>
                        <View style={[styles.skeletonIcon, { backgroundColor: themeColors.card }]} />
                        <View style={[styles.skeletonText, { flex: 1, height: 16, backgroundColor: themeColors.card }]} />
                    </View>
                ))}
            </View>
            <View style={[styles.logoutButton, { backgroundColor: themeColors.card }]} />
        </View>
    );
};


interface ProfileMenuItem {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const themeColors = Colors[colorScheme ?? 'light'];

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (error) {
              console.error('Error fetching profile:', error);
          } else if (profile) {
              setFullName(profile.full_name || '');
          }
      }

    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchUserData().finally(() => setLoading(false));
  }, [fetchUserData]);

  const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchUserData();
      setRefreshing(false);
  }, [fetchUserData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFullName('');
    router.replace('/auth/get-started');
  };

  const handleLogin = () => {
    router.push('/auth/sign-in');
  };

  const menuItems: ProfileMenuItem[] = [
    { title: 'Wishlist', icon: 'heart-outline', screen: '/profile/wishlist' },
    { title: 'Account Management', icon: 'person-circle-outline', screen: '/profile/account' },
    { title: 'Address Book', icon: 'book-outline', screen: '/profile/address' },
    { title: 'Orders', icon: 'receipt-outline', screen: '/profile/orders' },
  ];

  const getFirstName = (name: string) => {
      return name.split(' ')[0];
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: themeColors.background }]}>
        <ProfilePageSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: themeColors.background }]}>
        {user ? (
            <View style={styles.flex}>
                <ScrollView 
                    contentContainerStyle={styles.container}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary}/>}
                >
                    <View style={styles.profileHeader}>
                    <Text style={[styles.welcomeMessage, { color: themeColors.text }]}>
                        Welcome, {fullName ? getFirstName(fullName) : ''}
                    </Text>
                    </View>

                    <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.title} style={styles.menuItem} onPress={() => router.push(item.screen as any)}>
                        <Ionicons name={item.icon} size={24} color={themeColors.text} />
                        <Text style={[styles.menuItemText, { color: themeColors.text }]}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : (
            <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: themeColors.text}]}>Please log in to see your profile</Text>
                <Button title="Login" onPress={handleLogin} color={themeColors.primary} />
            </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
      flex: 1,
  },
  container: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeMessage: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuContainer: {
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  footer: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    marginBottom: 16,
  },
  skeletonText: {
      borderRadius: 4,
      height: 16,
  },
  skeletonIcon: {
      width: 24,
      height: 24,
      borderRadius: 4,
      marginRight: 16,
  },
  skeletonButton: {
      height: 50,
      borderRadius: 8,
      margin: 16,
  },
});
