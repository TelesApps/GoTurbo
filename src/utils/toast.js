// src/utils/toast.js
import { Platform, Alert, ToastAndroid } from 'react-native';

export const showToast = (message, duration = 'LONG') => {
  // Make sure we have a valid message
  if (!message || typeof message !== 'string') {
    console.warn('Invalid toast message:', message);
    message = 'An error occurred';
  }

  try {
    // For iOS
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        Alert.alert('Notification', message);
      }, 100);
      return;
    }
    
    // For Android
    const durationValue = duration === 'LONG' ? ToastAndroid.LONG : ToastAndroid.SHORT;
    ToastAndroid.show(message, durationValue);
  } catch (error) {
    console.log('Toast error:', error);
    // Last resort fallback - delayed to avoid UI thread issues
    setTimeout(() => {
      Alert.alert('Notification', message);
    }, 100);
  }
};