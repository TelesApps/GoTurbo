import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal'; // Changed to use the same modal library as dialogBaseModal
import { COLORS } from '../constants';

function DialogLoading({ loading }) {
  return (
    <Modal
      isVisible={loading}
      animationType="none"
      backdropOpacity={0.25}
      useNativeDriver
    >
      <View style={styles.activityIndicatorWrapper}>
        <ActivityIndicator 
          animating={loading} 
          size="large" 
          color={COLORS.PRIMARY} 
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'center'
  }
});

export default DialogLoading;