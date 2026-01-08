import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider } from '@/app/context/AuthContext';
import { CartProvider } from '@/app/context/CartContext';
import { ToastProvider } from '@/app/context/ToastContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-color-scheme';
import { setupDeepLinking, supabase } from '@/lib/supabase';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.card,
    notification: Colors.dark.notification,
    primary: Colors.dark.primary,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

const CustomDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.card,
    notification: Colors.light.notification,
    primary: Colors.light.primary,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    const unsubscribeDeepLink = setupDeepLinking();

    return () => {
      subscription?.unsubscribe();
      unsubscribeDeepLink();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated, segments, router]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <RootLayoutNav />
        </CartProvider>
      </ToastProvider>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
