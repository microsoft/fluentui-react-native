export * from './MenuPicker.desktop';
import * as React from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';

interface MenuPickerProps {
  prompt?: string;
  selected?: any;
  onChange?: (value: any, index?: number) => void;
  collection?: any[];
  style?: any;
}

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (props: MenuPickerProps) => {
  const { prompt, onChange, collection } = props;
  return (
    <View style={menuPickerStyles.container}>
      <Text style={menuPickerStyles.prompt}>{prompt}</Text>
      {collection.map((value, index) => (
        <Button onPress={() => onChange(value, index)} key={index} title={value} />
      ))}
    </View>
  );
};

const menuPickerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    margin: 5,
  },
  prompt: {
    marginRight: 5,
  },
  chevronContainer: {
    padding: 4,
  },
});
