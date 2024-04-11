import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/text';
import { MenuView } from '@react-native-menu/menu';
import type { MenuAction } from '@react-native-menu/menu';
import { SvgXml } from 'react-native-svg';

import type { CollectionItem, MenuPickerProps } from './MenuPicker.types';
import { testProps } from './TestProps';

export type { CollectionItem, MenuPickerProps };

/*
 * The MenuPicker was created because the RN Core Picker was deprecated (preventing us from updating to RN 0.66).
 * MenuPicker uses the community MenuView package for iOS
 */

const chevronXml = `
<svg width="12" height="16" viewBox="0 0 11 6">
  <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
</svg>`;

const styles = StyleSheet.create({
  menuPickerPromptText: {
    marginBottom: 4,
  },
  menuPickerIconPadding: {
    paddingLeft: 12,
  },
});

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

  const theme = useFluentTheme();

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
      <Text variant="bodySemibold" style={styles.menuPickerPromptText}>
        {prompt}
      </Text>
      <Button appearance="outline">
        <Text variant="bodySemibold">{selectedItemKey}</Text>
        <View style={styles.menuPickerIconPadding}>
          <SvgXml xml={chevronXml} color={theme.colors.bodyText} />
        </View>
      </Button>
    </MenuView>
  );
};
