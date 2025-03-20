import React from 'react';
import { View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal'; // Using react-native-modal instead of react-native-translucent-modal
import { COLORS } from '../constants';

function DialogBaseModal({ 
  visible, 
  onRequestClose = () => {}, 
  children 
}) {
  return (
    <Modal
      isVisible={visible}
      animationType="slide"
      onBackdropPress={onRequestClose}
      onBackButtonPress={onRequestClose}
      backdropOpacity={0.5}
      useNativeDriver
    >
      <View style={styles.modalContent}>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%'
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
    padding: 15,
    alignSelf: 'center'
  }
});

export default DialogBaseModal;