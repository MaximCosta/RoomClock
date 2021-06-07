import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';

const { width, height } = Dimensions.get('screen');

export default function FormInput({ labelName, ...rest }) {
  return (
      <TextInput
          mode='outlined'
          label={labelName}
          {...rest}
      />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius:15,
    height: 40,
    width:40,
    margin: 12,
    borderWidth: 1,
  }
});
