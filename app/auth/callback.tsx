import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session) {
        router.replace('/');
      } else if (error) {
        console.error('Error getting session:', error.message);
        router.replace('/auth/sign-in');
      }
    };
    handleCallback();
  }, [router]);

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}
