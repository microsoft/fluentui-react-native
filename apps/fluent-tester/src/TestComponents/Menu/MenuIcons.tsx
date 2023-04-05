import React from 'react';
import { Platform } from 'react-native';

import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuItemCheckbox, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';

import { testImage, svgProps } from '../Common/iconExamples';
import { stackStyle } from '../Common/styles';

const fontBuiltInProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
};
const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

export const MenuIcons: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu hasIcons>
        <MenuTrigger>
          <Button>Items with icons</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={{ source: testImage }}>Option 1 image icon</MenuItem>
            <MenuItem icon={{ fontSource: { ...fontBuiltInProps, style: { textAlign: 'center', marginTop: -1 } } }}>
              Option 2 font icon
            </MenuItem>
            {svgIconsEnabled && <MenuItem icon={{ svgSource: svgProps }}>Option 3 svg icon</MenuItem>}
            <MenuItem>Option 4 no icon</MenuItem>
            <MenuItemCheckbox icon={{ source: testImage }} name="Option4">
              Option 5 checkbox
            </MenuItemCheckbox>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};
