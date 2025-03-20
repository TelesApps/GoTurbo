import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

function GTText({
  value,
  onChangeText,
  inputRef,
  viewStyle,
  textInputStyle,
  placeholderTextColor,
  ...restProps
}) {
  const handleChangeText = (text) => {
    if (onChangeText) onChangeText(text);
  };

  return (
    <View style={{ ...styles.view, ...viewStyle }}>
      <TextInput
        ref={(input) => inputRef && inputRef(input)}
        style={{ ...styles.textInput, ...textInputStyle }}
        placeholderTextColor={placeholderTextColor || COLORS.WHITE}
        value={value}
        onChangeText={handleChangeText}
        {...restProps}
      />
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: COLORS.BACKGROUND,
    height: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15
  },
  textInput: {
    padding: 0,
    margin: 0,
    color: COLORS.WHITE,
    fontFamily: 'ProximaNova-SemiBold',
    fontSize: 16,
    fontStyle: 'normal',
    textAlign: 'left',
    width: '100%',
    height: '100%'
  },
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.WHITE
  }
});

export default GTText;