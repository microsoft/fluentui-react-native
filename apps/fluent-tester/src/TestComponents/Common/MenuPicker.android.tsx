import * as React from 'react';

import { Picker } from '@react-native-picker/picker';

import type { CollectionItem, MenuPickerProps } from './MenuPicker.types';
import { testProps } from './TestProps';
export type { CollectionItem, MenuPickerProps };

/*
 * The MenuPicker was created because the RN Core Picker was deprecated (preventing us from updating to RN 0.66).
 * MenuPicker uses the community Picker package for Android
 */

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (props: MenuPickerProps) => {
  const { prompt, selected, onChange, collection, style, testID } = props;
  let selectedItemKey;

  collection.forEach((item) => {
    if (item.value == selected) {
      selectedItemKey = item.value;
    }
  });

  return (
    <Picker
      prompt={prompt}
      selectedValue={selectedItemKey}
      onValueChange={(value: string, index: number) => onChange(value, index)}
      style={{ ...style }}
      /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
      {...testProps(testID)}
    >
      {collection.map((item, index) => (
        <Picker.Item
          label={item.label}
          key={index}
          value={item.value} /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(item.testID)}
        />
      ))}
    </Picker>
  );
};
