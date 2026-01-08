import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const AddressSkeleton = () => {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const sharedAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );
    sharedAnimation.start();
    return () => sharedAnimation.stop();
  }, [pulseAnim]);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [themeColors.card, themeColors.border],
  });

  return (
    <View style={styles.container}>
        <Animated.View style={[styles.textLine, { width: '30%', marginBottom: 12, backgroundColor}]}/>
        <Animated.View style={[styles.input, {backgroundColor}]}/>
        <Animated.View style={[styles.textLine, { width: '30%', marginBottom: 12, backgroundColor}]}/>
        <Animated.View style={[styles.input, {backgroundColor}]}/>
        <Animated.View style={[styles.textLine, { width: '30%', marginBottom: 12, backgroundColor}]}/>
        <Animated.View style={[styles.input, {backgroundColor}]}/>
        <Animated.View style={[styles.textLine, { width: '30%', marginBottom: 12, backgroundColor}]}/>
        <Animated.View style={[styles.input, {backgroundColor}]}/>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    input: {
        height: 50,
        borderRadius: 8,
        marginBottom: 16,
    },
    textLine: {
        height: 16,
        borderRadius: 4,
    },
});

export default AddressSkeleton;
