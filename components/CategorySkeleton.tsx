import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const CategorySkeleton = () => {
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
    <View style={styles.categoryItem}>
      <Animated.View style={[styles.categoryIconCircle, { backgroundColor }]} />
      <Animated.View style={[styles.categoryName, { backgroundColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryName: {
    width: 50,
    height: 10,
    borderRadius: 4,
  },
});

export default CategorySkeleton;
