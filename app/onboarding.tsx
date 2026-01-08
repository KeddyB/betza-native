
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Onboarding() {
  const router = useRouter();

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasOpened', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to save onboarding status', e);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to the App!</Text>
      <Button title="Get Started" onPress={handleOnboardingComplete} />
    </View>
  );
}
