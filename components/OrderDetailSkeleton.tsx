import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const OrderDetailSkeleton = () => {
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

  const SkeletonItem = () => (
    <Animated.View style={[styles.itemCard, { backgroundColor }]}>
      <Animated.View style={[styles.itemImage, { backgroundColor }]} />
      <View style={styles.itemDetails}>
        <Animated.View style={[styles.textLine, { width: '70%', backgroundColor }]} />
        <Animated.View style={[styles.textLine, { width: '40%', marginTop: 8, backgroundColor }]} />
      </View>
      <Animated.View style={[styles.textLine, { width: '20%', backgroundColor }]} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <Animated.View style={[styles.title, { backgroundColor }]} />

      {/* Summary Card Skeleton */}
      <Animated.View style={[styles.card, { backgroundColor }]}>
        <Animated.View style={[styles.cardTitle, { backgroundColor }]} />
        <Animated.View style={[styles.textLine, { width: '100%', height: 12, marginBottom: 10, backgroundColor }]} />
        <Animated.View style={[styles.textLine, { width: '100%', height: 12, marginBottom: 10, backgroundColor }]} />
        <Animated.View style={[styles.textLine, { width: '100%', height: 12, backgroundColor }]} />
      </Animated.View>

      {/* Item List Skeleton */}
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    height: 28,
    width: '60%',
    borderRadius: 8,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardTitle: {
    height: 20,
    width: '50%',
    borderRadius: 6,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  textLine: {
    height: 16,
    borderRadius: 4,
  },
});

export default OrderDetailSkeleton;
