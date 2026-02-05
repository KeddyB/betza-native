import { useTheme } from '@/hooks/use-color-scheme';
import { authOptions, supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

export default function GetStartedScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const checkFingerprint = async () => {
      const isEnabled = await SecureStore.getItemAsync('fingerprint_login_enabled');
      if (isEnabled === 'true') {
        setIsFingerprintAvailable(true);
        handleFingerprintLogin();
      }
    };
    checkFingerprint();
  }, []);

  const handleFingerprintLogin = async () => {
    try {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Fingerprint',
      });

      if (success) {
        setLoading(true);
        const refreshToken = await SecureStore.getItemAsync('user_refresh_token');
        if (refreshToken) {
          const { error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
          if (!error) {
            router.replace('/(tabs)');
          } else {
            Alert.alert('Error', 'Failed to login with fingerprint. Please login manually.');
          }
        }
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during fingerprint authentication.');
    }
  };

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      if (parsed.path === 'auth-callback' && parsed.queryParams?.code) {
        exchangeCodeForSession(parsed.queryParams.code as string);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [exchangeCodeForSession]);

  const exchangeCodeForSession = async (code: string) => {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to authenticate');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUrl = authOptions.redirectTo;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: themeColors.text }]}>Betza</Text>
          <Text style={[styles.tagline, { color: themeColors.text + '99' }]}>
            Your trusted ecommerce store
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {isFingerprintAvailable && (
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={handleFingerprintLogin}
              disabled={loading}
            >
              <Text style={[styles.googleButtonText, { color: themeColors.text }]}>
                Login with Fingerprint
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
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
            <Text style={[styles.googleButtonText, { color: themeColors.text }]}>
              {loading ? 'Signing In...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.border, borderWidth: 1 }]}
            onPress={() => router.push('/auth/sign-in')}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, { color: themeColors.text }]}>
              Sign In with Email
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
            <Text style={[styles.dividerText, { color: themeColors.text + '99' }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.border, borderWidth: 1 }]}
            onPress={() => router.push('/auth/sign-up')}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, { color: themeColors.text }]}>
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton]}
            onPress={() => router.replace('/(tabs)')}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, { color: themeColors.text }]}>
              Continue without logging in
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.text + '99' }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: themeColors.primary }}>Terms of Service</Text>
          </Text>
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
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
  },
  buttonContainer: {
    gap: 12,
  },
  googleButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
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
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
});
