import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const ExpoSecureStorage = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error writing to secure storage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : ExpoSecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

export const authOptions = {
  redirectTo:
    Platform.OS === 'web'
      ? `${window.location.origin}/auth/callback`
      : `betza://auth/callback`,
};

export const setupDeepLinking = () => {
  const handleDeepLink = (url: string) => {
    if (!url) return;
    const { queryParams } = Linking.parse(url);
    const code = queryParams?.code;

    if (code && typeof code === 'string') {
      supabase.auth.exchangeCodeForSession(code);
    }
  };

  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  return () => {
    subscription.remove();
  };
};
