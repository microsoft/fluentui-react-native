import * as React from 'react';
import { View } from 'react-native';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuTrigger, MenuPopover } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/experimental-text';
import { stackStyle } from '../Common/styles';
import { MENU_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const MenuDefault: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <View>
            <Text>Hello world!!!</Text>
          </View>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const menuSections: TestSection[] = [
  {
    name: 'Menu Default',
    testID: MENU_TESTPAGE,
    component: MenuDefault,
  },
];

export const MenuTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = '!!!!!!!TODO TODO TODO TODO!!!!!!!!';

  return <Test name="Menu Test" description={description} sections={menuSections} status={status}></Test>;
};
