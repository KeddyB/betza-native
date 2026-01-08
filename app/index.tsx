import { useTheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/get-started');
    }, 2000); // 2 second splash screen

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: colors.text }]}>Betza</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
  },
});
