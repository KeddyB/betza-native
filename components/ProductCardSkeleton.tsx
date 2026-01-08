import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const productWidth = (width - 48) / 2;

const ProductCardSkeleton = () => {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    <View style={[styles.card, { width: productWidth, backgroundColor: themeColors.card }]}>
      <Animated.View style={[styles.image, { backgroundColor }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.textLine, { width: '80%', backgroundColor }]} />
        <Animated.View style={[styles.textLine, { width: '50%', marginTop: 4, backgroundColor }]} />
      </View>
      <Animated.View style={[styles.button, { backgroundColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
  },
  image: {
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  content: {
    marginBottom: 10,
  },
  textLine: {
    height: 16,
    borderRadius: 4,
  },
  button: {
    height: 40,
    borderRadius: 8,
  },
});

export default ProductCardSkeleton;
