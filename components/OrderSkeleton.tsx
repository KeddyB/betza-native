import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const OrderSkeleton = () => {
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
    <Animated.View style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <Animated.View style={[styles.textLine, { width: '40%', backgroundColor }]}/>
        <Animated.View style={[styles.textLine, { width: '20%', backgroundColor }]}/>
      </View>
      <View style={styles.itemContainer}>
        <Animated.View style={[styles.image, { backgroundColor }]}/>
        <View style={styles.itemDetails}>
            <Animated.View style={[styles.textLine, { width: '80%', backgroundColor }]}/>
            <Animated.View style={[styles.textLine, { width: '50%', marginTop: 4, backgroundColor }]}/>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
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

export default OrderSkeleton;
