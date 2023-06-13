import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { ButtonV1 as Button, Text } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { SvgXml } from 'react-native-svg';

import type { MenuPickerProps, CollectionItem } from './MenuPicker.types';

export type { MenuPickerProps, CollectionItem };

const chevronXml = `
<svg width="12" height="16" viewBox="0 0 11 6" color="#000">
  <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
</svg>`;

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (props: MenuPickerProps) => {
  const { prompt, selected, onChange, collection } = props;

  let label;
  collection.forEach((item) => {
    if (item.value == selected) {
      label = item.label;
    }
  });

  return (
    <View style={menuPickerStyles.container}>
      <Text style={menuPickerStyles.prompt}>{prompt}</Text>
      <Menu>
        <MenuTrigger>
          <Button>
            <Text>{label}</Text>
            <View style={menuPickerStyles.chevronContainer}>
              <SvgXml xml={chevronXml} />
            </View>
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {collection.map((collectionItem: CollectionItem, index: number) => (
              <MenuItem onClick={() => onChange(collectionItem.value, index)} key={collectionItem.value ?? index}>
                {collectionItem.label}
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </View>
  );
};

const menuPickerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
