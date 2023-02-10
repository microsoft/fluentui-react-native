import React from 'react';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';

export const MenuTooltips: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu hasTooltips>
        <MenuTrigger>
          <Button>Items with tooltips</Button>
        </MenuTrigger>
        <MenuPopover maxWidth={160}>
          <MenuList>
            <MenuItem>Option 1 has some really long text that goes on and on</MenuItem>
            <MenuItem>Option2hastextwithnobreaksthatgoesonandon</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};
