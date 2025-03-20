import { Platform, Alert, ToastAndroid } from 'react-native';

export const showToast = (message, duration = 'LONG') => {
  try {
    // For iOS, use Alert
    if (Platform.OS === 'ios') {
      Alert.alert('Message', message);
      return;
    }
    
    // For Android, use ToastAndroid (built-in)
    const durationValue = duration === 'LONG' ? ToastAndroid.LONG : ToastAndroid.SHORT;
    ToastAndroid.show(message, durationValue);
  } catch (error) {
    // Fallback if anything fails
    console.log('Toast message:', message);
    Alert.alert('Message', message);
  }
};