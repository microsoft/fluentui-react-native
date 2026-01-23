import * as React from 'react';
import { View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import {
  MENUITEM_ACCESSIBILITY_LABEL,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  MENUTRIGGER_TEST_COMPONENT,
  MENUITEM_TEST_LABEL,
  MENU_ON_CLOSE,
  MENU_ON_OPEN,
  MENUITEM_TEST_COMPONENT,
  MENUPOPOVER_TEST_COMPONENT,
  MENU_CALLBACK_RESET_BUTTON,
  MENUITEM_FOURTH_COMPONENT,
  MENUITEM_DISABLED_COMPONENT,
  MENUITEM_CALLBACK_LABEL,
} from '@fluentui-react-native/e2e-testing';
import { Menu, MenuDivider, MenuGroup, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const E2EMenuTest: React.FunctionComponent = () => {
  const [menuOpened, setMenuOpened] = React.useState(false);
  const [numOnClickCalls, setNumOnClickCalls] = React.useState(0);

  const onOpenChange = React.useCallback(
    (_e: any, isOpen: boolean) => {
      setMenuOpened(isOpen);
    },
    [setMenuOpened],
  );

  const onItemClick = () => {
    setNumOnClickCalls((n) => n + 1);
  };

  const onResetClick = () => {
    setNumOnClickCalls(0);
  };

  return (
    <Stack style={stackStyle}>
      <View style={{ flexDirection: 'row' }}>
        {menuOpened ? (
          <Text /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */ {...testProps(MENU_ON_OPEN)}>
            Menu opened
          </Text>
        ) : (
          <Text /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */ {...testProps(MENU_ON_CLOSE)}>
            Menu closed
          </Text>
        )}
        <Button
          onClick={onResetClick}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */ {...testProps(
            MENU_CALLBACK_RESET_BUTTON,
          )}
        >
          Reset Item Callback
        </Button>
        <Menu open={menuOpened} onOpenChange={onOpenChange}>
          <MenuTrigger>
            <Button
              /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
              {...testProps(MENUTRIGGER_TEST_COMPONENT)}
            >
              Test
            </Button>
          </MenuTrigger>
          <MenuPopover
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(MENUPOPOVER_TEST_COMPONENT)}
          >
            <MenuList>
              <MenuGroup>
                <MenuItem
                  onClick={onItemClick}
                  accessibilityLabel={MENUITEM_ACCESSIBILITY_LABEL}
                  persistOnClick
                  /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                  {...testProps(MENUITEM_TEST_COMPONENT)}
                >
                  A plain MenuItem
                </MenuItem>
                <MenuItem
                  onClick={onItemClick}
                  /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                  {...testProps(MENUITEM_DISABLED_COMPONENT)}
                  disabled
                  persistOnClick
                >
                  A second disabled plain MenuItem
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup>
                <MenuItem
                  /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                  {...testProps(MENUITEM_NO_A11Y_LABEL_COMPONENT)}
                >
                  {MENUITEM_TEST_LABEL}
                </MenuItem>
                <MenuItem
                  /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                  {...testProps(MENUITEM_FOURTH_COMPONENT)}
                >
                  A fourth plain MenuItem
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </MenuPopover>
        </Menu>
      </View>
      <Text
        style={{ marginVertical: 4 }}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(MENUITEM_CALLBACK_LABEL)}
      >
        {`onClick fired ${numOnClickCalls} times`}
      </Text>
    </Stack>
  );
};
