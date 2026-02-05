import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

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
                {[...Array(5)].map((_, i) => (
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
  const [isFingerprintLoginEnabled, setIsFingerprintLoginEnabled] = useState(false);

  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const checkFingerprintStatus = async () => {
      const isEnabled = await SecureStore.getItemAsync('fingerprint_login_enabled');
      setIsFingerprintLoginEnabled(isEnabled === 'true');
    };
    checkFingerprintStatus();
  }, []);

  const handleFingerprintToggle = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Error', 'Fingerprint scanner not available on this device.');
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No fingerprints enrolled on this device.');
        return;
      }
      const { session } = (await supabase.auth.getSession()).data;
      if (session?.refresh_token) {
        await SecureStore.setItemAsync('fingerprint_login_enabled', 'true');
        await SecureStore.setItemAsync('user_refresh_token', session.refresh_token);
        setIsFingerprintLoginEnabled(true);
      } else {
        Alert.alert('Error', 'Could not enable fingerprint login. Please try again.');
      }
    } else {
      await SecureStore.deleteItemAsync('fingerprint_login_enabled');
      await SecureStore.deleteItemAsync('user_refresh_token');
      setIsFingerprintLoginEnabled(false);
    }
  };

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
    await SecureStore.deleteItemAsync('fingerprint_login_enabled');
    await SecureStore.deleteItemAsync('user_refresh_token');
    setUser(null);
    setFullName('');
    router.replace('/auth/get-started');
  };

  const handleLogin = () => {
    router.push('/auth/get-started');
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
                        <View style={styles.menuItem}>
                            <Ionicons name="finger-print-outline" size={24} color={themeColors.text} />
                            <Text style={[styles.menuItemText, { color: themeColors.text }]}>Login with Fingerprint</Text>
                            <Switch
                                value={isFingerprintLoginEnabled}
                                onValueChange={handleFingerprintToggle}
                                trackColor={{ false: '#767577', true: themeColors.primary }}
                                thumbColor={isFingerprintLoginEnabled ? themeColors.background : '#f4f3f4'}
                            />
                        </View>
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
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.logoutButtonText}>Login</Text>
                </TouchableOpacity>
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
  loginButton: {
    backgroundColor: '#4CAF50', // Green color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
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
