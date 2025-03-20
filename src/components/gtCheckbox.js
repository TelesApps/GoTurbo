import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { CheckBox, Text } from '@ui-kitten/components';
import { COLORS } from '../constants'; // Assuming you updated constants.js to use COLORS object

function GTCheckbox({
  label,
  value = false,
  onChange,
}) {
  const [checked, setChecked] = useState(value);

  // Update internal state when prop value changes
  useEffect(() => {
    setChecked(value);
  }, [value]);

  const handleChange = (isChecked) => {
    setChecked(isChecked);
    if (onChange) onChange(isChecked);
  };

  return (
    <View style={{ marginBottom: 10 }}>
      <CheckBox 
        checked={checked} 
        onChange={handleChange}
      >
        {evaProps => (
          <Text 
            {...evaProps} 
            style={{ 
              fontFamily: 'ProximaNova-Regular', 
              fontSize: 16, 
              color: COLORS.WHITE, 
              marginStart: 10 
            }}
          >
            {label}
          </Text>
        )}
      </CheckBox>
    </View>
  );
}

export default GTCheckbox;