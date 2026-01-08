import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

export default function AuthLayout() {
  const { colorScheme } = useTheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up-google" />
        <Stack.Screen name="sign-in-google" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </ThemeProvider>
  );
}
