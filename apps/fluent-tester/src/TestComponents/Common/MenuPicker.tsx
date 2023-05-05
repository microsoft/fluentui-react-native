import * as React from 'react';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Text } from '@fluentui-react-native/text';
import { MenuView } from '@react-native-menu/menu';
import type { MenuAction } from '@react-native-menu/menu';

import type { CollectionItem, MenuPickerProps } from './MenuPicker.types';
import { testProps } from './TestProps';
export { CollectionItem, MenuPickerProps };

/*
 * The MenuPicker was created because the RN Core Picker was deprecated (preventing us from updating to RN 0.66).
 * MenuPicker uses the community Picker package for iOS/Win32 and our own Picker for Win32/MacOS.
 */

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (props: MenuPickerProps) => {
  const { prompt, selected, onChange, collection, style, testID } = props;
  let selectedItemKey;

  collection.forEach((item) => {
    if (item.value == selected) {
      selectedItemKey = item.value;
    }
  });

  const pickerOptions: MenuAction[] = collection.map((item) => ({
    id: item.label,
    title: item.label,
    state: item.value === selected ? 'on' : 'off',
  }));

  return (
    <MenuView
      title={prompt}
      onPressAction={({ nativeEvent }) => {
        onChange(nativeEvent.event);
      }}
      actions={pickerOptions}
      style={style}
      /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
      {...testProps(testID)}
    >
      <Text variant="bodySemibold">{prompt}</Text>
      <Button appearance="primary">{selectedItemKey}</Button>
    </MenuView>
  );
};
