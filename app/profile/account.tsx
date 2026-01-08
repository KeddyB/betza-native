import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/app/context/ToastContext';
import { User } from '@supabase/supabase-js';

const AccountSkeleton = () => {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (
        <View style={styles.container}>
            <View style={[styles.skeletonInput, { backgroundColor: themeColors.card }]} />
            <View style={[styles.skeletonInput, { backgroundColor: themeColors.card }]} />
            <View style={[styles.skeletonInput, { backgroundColor: themeColors.card }]} />
            <View style={[styles.skeletonButton, { backgroundColor: themeColors.primary }]} />
        </View>
    );
};

export default function AccountManagementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { showToast } = useToast();

  const isPasswordUser = user?.app_metadata.provider === 'email';

  const fetchProfile = useCallback(async () => {
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
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async () => {
    if (!user) return;

    setLoading(true);

    // Update Full Name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (profileError) {
      showToast('Error updating name.', 'error');
    } else {
      showToast('Name updated successfully!', 'success');
    }

    // Update Password if applicable
    if (isPasswordUser && newPassword) {
        if (!currentPassword) {
            Alert.alert('Current password is required to set a new one.');
            setLoading(false);
            return;
        }
        
        // This is a simplified check. For a real app, you would want a more secure way to re-authenticate.
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password: currentPassword });

        if (signInError) {
            Alert.alert('Incorrect current password. Please try again.');
        } else {
            const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
            if (passwordError) {
                showToast('Error updating password.', 'error');
            } else {
                showToast('Password updated successfully!', 'success');
                setCurrentPassword('');
                setNewPassword('');
            }
        }
    }

    setLoading(false);
  };

  if (loading) {
      return <AccountSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ title: 'Account Management', headerTintColor: themeColors.primary, headerTitleStyle: {fontWeight: 'bold'} }} />
      <Text style={[styles.title, { color: themeColors.text }]}>Manage Your Account</Text>
      
      <View>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.card }]}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
        />
        
        <Text style={styles.label}>Email</Text>
        <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.card, opacity: 0.6 }]}
            value={user?.email}
            editable={false}
        />
        
        {isPasswordUser && (
            <>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                    style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.card }]}
                    placeholder="Enter current password"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />

                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.card }]}
                    placeholder="Enter new password (optional)"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
            </>
        )}

        <Button title={loading ? 'Updating...' : 'Update Account'} onPress={handleUpdate} color={themeColors.primary} disabled={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#6B7280',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonInput: {
    height: 50,
    borderRadius: 8,
    marginBottom: 20,
  },
  skeletonButton: {
      height: 45,
      borderRadius: 8,
  }
});
