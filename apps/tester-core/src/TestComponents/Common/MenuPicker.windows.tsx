export * from './MenuPicker.desktop';
import * as React from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';

import type { MenuPickerProps, CollectionItem } from './MenuPicker.types';
export type { MenuPickerProps, CollectionItem };

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (props: MenuPickerProps) => {
  const { prompt, onChange, collection } = props;
  return (
    <View style={menuPickerStyles.container}>
      <Text style={menuPickerStyles.prompt}>{prompt}</Text>
      {collection.map((item: CollectionItem, index: number) => (
        <Button onPress={() => onChange(item.value, index)} key={index} title={item.label} />
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
