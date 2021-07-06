/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { Text, View, Switch } from 'react-native';
import { Separator, MenuButton, ContextualMenuItemProps, ContextualMenuProps } from '@fluentui/react-native';
import { MENU_BUTTON_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const menuButton: React.FunctionComponent<{}> = () => {
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback((value) => setShouldFocusOnContainer(value), [setShouldFocusOnContainer]);

  const onItemClick = React.useCallback(
    (key) => {
      setLastMenuItemClicked(key);
    },
    [setLastMenuItemClicked],
  );
  const testImage = require('../Button/icon_24x24.png');

  const menuItems: ContextualMenuItemProps[] = [
    {
      itemKey: '1',
      text: 'MenuItem 1',
      icon: testImage
    },
    {
      itemKey: '2',
      text: 'MenuItem 2'
    },
    {
      itemKey: '3',
      text: 'MenuItem 3',
      disabled: true
    }
  ]

  const contextualMenuProps: ContextualMenuProps = {
    accessibilityLabel: 'MenuButton',
    shouldFocusOnMount: focusOnMount,
    shouldFocusOnContainer: focusOnContainer
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Mount</Text>
            <Switch value={focusOnMount} onValueChange={toggleFocusOnMount} />
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Container</Text>
            <Switch value={focusOnContainer} onValueChange={toggleFocusOnContainer} />
          </View>
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Text>
            <Text>Last Menu Item Clicked: </Text>
            {lastMenuItemClicked > 0 ? (
              <Text style={{ color: 'blue' }}>{lastMenuItemClicked}</Text>
            ) : (
              <Text style={{ color: 'blue' }}>none</Text>
            )}
          </Text>
          <MenuButton content="Standard MenuButton" menuItems={menuItems} onItemClick={onItemClick} contextualMenu={contextualMenuProps}/>
          <Text>Disabled MenuButton</Text>
          <MenuButton disabled content="Disabled MenuButton" menuItems={menuItems} />
        </View>
      </View>
    </View>
  );
};

const menuButtonSections: TestSection[] = [
  {
    name: 'Standard MenuButton',
    testID: MENU_BUTTON_TESTPAGE,
    component: menuButton,
  }
];

export const MenuButtonTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'MenuButton is a component which contains ContextualMenu and Button components. This control combines and simplifies the API for customers.\nClicking on MenuButton opens ContextualMenu. It can have Submenu. But selection checks and a beak are not implemented.';

  return <Test name="MenuButton Test" description={description} sections={menuButtonSections} status={status}></Test>;
};
