import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import GTLabel from './gtLabel';

// Modern function declaration syntax
function GTButton({ 
  label, 
  onPress, 
  disabled = false, 
  buttonStyle, 
  labelStyle 
}) {
  const handlePress = () => {
    if (onPress) onPress();
  };

  const defaultButtonStyle = disabled 
    ? { ...styles.button, ...styles.disabled } 
    : { ...styles.button };

  return (
    <Pressable 
      style={{ ...defaultButtonStyle, ...buttonStyle }} 
      disabled={disabled} 
      onPress={handlePress}
    >
      <GTLabel 
        label={label} 
        labelStyle={{ ...styles.label, ...labelStyle }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontFamily: 'ProximaNova-SemiBold',
    fontSize: 18
  },
  disabled: {
    opacity: 0.5
  }
});

export default GTButton;