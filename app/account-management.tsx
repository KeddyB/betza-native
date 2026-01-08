import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from './context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountManagementScreen() {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.user_metadata) {
      setFullName(user.user_metadata.full_name || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your profile has been updated.');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!password) {
        Alert.alert('Error', 'Please enter a new password.');
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated.');
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Account Management</Text>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: themeColors.text }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
          value={fullName}
          onChangeText={setFullName}
        />
        <Pressable
          style={({ pressed }) => [styles.button, { backgroundColor: pressed ? themeColors.primary + 'E6' : themeColors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </Pressable>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: themeColors.text }]}>New Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Enter new password"
        />
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
        />
        <Pressable
          style={({ pressed }) => [styles.button, { backgroundColor: pressed ? themeColors.primary + 'E6' : themeColors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
           {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
