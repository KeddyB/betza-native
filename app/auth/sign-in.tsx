import { useTheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const canGoBack = router.canGoBack();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} disabled={!canGoBack}>
              <Text style={[styles.backButton, { color: canGoBack ? themeColors.primary : themeColors.text + '99' }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: themeColors.text }]}>Sign In</Text>
            <Text style={[styles.subtitle, { color: themeColors.text + '99' }]}>
              Sign in to your account
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
                placeholder="Enter your email"
                placeholderTextColor={themeColors.text + '99'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: themeColors.text }]}>Password</Text>
                <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                  <Text style={[styles.forgotLink, { color: themeColors.primary }]}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
                placeholder="Enter your password"
                placeholderTextColor={themeColors.text + '99'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.text + '99' }]}>
              Do not have an account?{' '}
              <Text
                style={[styles.link, { color: themeColors.primary }]}
                onPress={() => router.push('/auth/sign-up')}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    marginBottom: 40,
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
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  forgotLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
