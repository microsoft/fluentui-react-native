import * as React from 'react';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';

export const MenuTriggerChildRef: React.FunctionComponent = () => {
  const ref = React.useRef();
  const onClick = React.useCallback(() => {
    ref?.current?.focus();
  }, [ref]);

  return (
    <Stack style={stackStyle}>
      <Button onClick={onClick}>Click to focus</Button>

      <Menu>
        <MenuTrigger>
          <Button componentRef={ref} />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>A plain MenuItem</MenuItem>
            <MenuItem disabled>A second disabled plain MenuItem</MenuItem>
            <MenuItem>A third plain MenuItem</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};
