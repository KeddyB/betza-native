import { authOptions, supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpGoogleScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleGoogleSignUp = async () => {
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
      Alert.alert('Error', error?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.canGoBack() ? router.back() : router.push('/auth/get-started');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={[styles.backButton, { color: themeColors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>Sign Up with Google</Text>
          <Text style={[styles.subtitle, { color: themeColors.text + '99' }]}>
            Create an account using your Google account
          </Text>
        </View>

        <View style={styles.center}>
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleGoogleSignUp}
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
              {loading ? 'Signing Up...' : 'Continue with Google'}
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
