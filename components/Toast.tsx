import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
}

export const Toast = ({ message, type, position = 'bottom' }: ToastProps) => {
  const { colorScheme } = useTheme();

  const { toastStyle, iconName } = useMemo(() => {
    let iconName: keyof typeof Ionicons.glyphMap;
    let backgroundColor: string;

    switch (type) {
      case 'success':
        iconName = 'checkmark-circle';
        backgroundColor = Colors[colorScheme ?? 'light'].primary;
        break;
      case 'error':
        iconName = 'close-circle';
        backgroundColor = Colors[colorScheme ?? 'light'].notification;
        break;
      case 'info':
      default:
        iconName = 'information-circle';
        backgroundColor = Colors[colorScheme ?? 'light'].link;
        break;
    }

    const toastStyle = {
      backgroundColor,
      [position]: 50,
    };
    
    return { toastStyle, iconName };
  }, [type, colorScheme, position]);

  return (
    <View style={[styles.container, toastStyle]}>
      <Ionicons name={iconName} size={20} color="#fff" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000, // Ensure toast is on top
  },
  icon: {
    marginRight: 10,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
});
