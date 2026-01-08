import { useTheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        Alert.alert('Sign Up Error', signUpError.message);
      } else {
        Alert.alert('Success', 'Account created! Please check your email to verify your account.');
        router.push('/auth/sign-in');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
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
          <Text style={[styles.title, { color: themeColors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: themeColors.text + '99' }]}>
            Sign up to get started
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                color: themeColors.text,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={themeColors.text + '99'}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                color: themeColors.text,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={themeColors.text + '99'}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            secureTextEntry
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                color: themeColors.text,
              },
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={themeColors.text + '99'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.primary, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
  form: {
    gap: 16,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
