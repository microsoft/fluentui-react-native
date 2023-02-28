import * as React from 'react';
import type { ColorValue } from 'react-native';

import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import Svg, { Path } from 'react-native-svg';

import { stackStyle } from '../Common/styles';

export const MenuTriggerOnClickCallback: React.FunctionComponent = () => {
  const [counter, setCounter] = React.useState<number>(0);
  const onClick = React.useCallback(() => {
    setCounter(counter + 1);
  }, [counter, setCounter]);

  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button onClick={onClick}>{'Click to increase counter: ' + counter}</Button>
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

export const MenuTriggerHoverCallback: React.FunctionComponent = () => {
  const [iconColor, setIconColor] = React.useState<ColorValue>('red');
  const onHoverIn = React.useCallback(() => {
    setIconColor('blue');
  }, [setIconColor]);
  const onHoverOut = React.useCallback(() => {
    setIconColor('red');
  }, [setIconColor]);
  const chevron = (
    <Svg width="12" height="16" viewBox="0 0 11 6" color={iconColor}>
      <Path
        fill="currentColor"
        d="M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z"
      />
    </Svg>
  );

  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button onHoverIn={onHoverIn} onHoverOut={onHoverOut}>
            Test
            {chevron}
          </Button>
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
