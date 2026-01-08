import { authOptions, supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignInGoogleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);

  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    textSecondary: isDark ? '#999999' : '#666666',
    primary: '#007AFF',
    googleButton: isDark ? '#2a2a2a' : '#f5f5f5',
    googleBorder: isDark ? '#333333' : '#e0e0e0',
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authOptions.redirectTo,
        },
      });

      if (error) {
        Alert.alert('Error', 'Failed to sign in with Google');
        console.error(error);
      }
    } catch {
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.canGoBack() ? router.back() : router.push('/auth/get-started');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Sign In with Google</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in using your Google account
          </Text>
        </View>

        <View style={styles.center}>
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: colors.googleButton,
                borderColor: colors.googleBorder,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Image
              source={{
                uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
              }}
              style={styles.googleLogo}
              contentFit="contain"
            />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              {loading ? 'Signing In...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    marginTop: 20,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
