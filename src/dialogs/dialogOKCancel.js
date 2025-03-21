import React from 'react';
import { View, StyleSheet } from 'react-native';
import DialogBaseModal from './dialogBaseModal';
import GTLabel from '../components/gtLabel';
import GTButton from '../components/gtButton';
import { COLORS } from '../constants';

function DialogOKCancel({
  visible,
  message,
  onCancelPress,
  onOKPress,
  showCancelButton = true,
  cancelText = 'CANCEL',
  okText = 'OK'
}) {
  const handleCancelPress = () => {
    if (onCancelPress) onCancelPress();
  };
  
  const handleOKPress = () => {
    if (onOKPress) onOKPress();
  };

  return (
    <DialogBaseModal visible={visible}>
      <View>
        <GTLabel 
          label={message} 
          labelStyle={styles.messageText} 
        />
        
        <View style={styles.buttonContainer}>
          {showCancelButton && (
            <>
              <GTButton 
                label={cancelText} 
                buttonStyle={styles.cancelButton} 
                onPress={handleCancelPress}
              />
              <View style={styles.buttonSpacer} />
            </>
          )}
          
          <GTButton 
            label={okText} 
            buttonStyle={styles.okButton} 
            onPress={handleOKPress}
          />
        </View>
      </View>
    </DialogBaseModal>
  );
}

const styles = StyleSheet.create({
  messageText: {
    fontFamily: 'ProximaNova-Regular',
    fontSize: 20,
    color: COLORS.WHITE,
    textAlign: 'center'
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.RED
  },
  okButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY
  },
  buttonSpacer: {
    width: 15
  }
});

export default DialogOKCancel;