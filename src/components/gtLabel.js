import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants'; // Assuming you updated to use COLORS object

function GTLabel({ 
  label, 
  labelStyle, 
  ...props 
}) {
  return (
    <Text 
      style={{ ...styles.label, ...labelStyle }} 
      {...props}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.WHITE, // Using constants instead of hardcoded values
    fontFamily: 'ProximaNova-Regular',
    fontSize: 14,
    textAlign: 'left'
  }
});

export default GTLabel;