import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const productWidth = (width - 60) / 2;

export default function SkeletonLoader() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });



  const itemColor = Colors[colorScheme ?? 'light'].text + '20'; // A lighter shade of text color for skeleton items


  return (
    <View style={styles.container}>
      <Animated.View style={[styles.skeletonCard, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border }]}>
        <Animated.View style={[styles.skeletonImage, { backgroundColor: itemColor, opacity }]} />
        <View style={styles.skeletonContent}>
          <Animated.View style={[styles.skeletonPrice, { backgroundColor: itemColor, opacity }]} />
          <Animated.View style={[styles.skeletonTitle, { backgroundColor: itemColor, opacity }]} />
          <Animated.View style={[styles.skeletonText, { backgroundColor: itemColor, opacity }]} />
          <Animated.View style={[styles.skeletonButton, { backgroundColor: itemColor, opacity }]} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.skeletonCard, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border }]}>
        <Animated.View style={[styles.skeletonImage, { backgroundColor: itemColor, opacity }]} />
        <View style={styles.skeletonContent}>
          <Animated.View style={[styles.skeletonPrice, { backgroundColor: itemColor, opacity }]} />
          <Animated.View style={[styles.skeletonTitle, { backgroundColor: itemColor, opacity }]} />
          <Animated.View style={[styles.skeletonText, { backgroundColor: itemColor, opacity }]} />
          <Animated.View style={[styles.skeletonButton, { backgroundColor: itemColor, opacity }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    width: productWidth,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    height: 300, // Match ProductCard height
  },
  skeletonImage: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonPrice: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '40%',
  },
  skeletonTitle: {
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
    marginBottom: 12,
    width: '60%',
  },
  skeletonButton: {
    height: 40,
    borderRadius: 8,
  },
});