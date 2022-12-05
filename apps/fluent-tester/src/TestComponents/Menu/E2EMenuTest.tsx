import * as React from 'react';
import { View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui-react-native/menu';
import {
  MENUITEM_ACCESSIBILITY_LABEL,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  MENUTRIGGER_TEST_COMPONENT,
  MENUITEM_TEST_LABEL,
  MENU_ON_CLOSE,
  MENU_ON_OPEN,
  MENUITEM_TEST_COMPONENT,
  MENUPOPOVER_TEST_COMPONENT,
  MENU_DEFOCUS_BUTTON,
  MENU_CALLBACK_RESET_BUTTON,
  MENUITEM_FOURTH_COMPONENT,
  MENUITEM_DISABLED_COMPONENT,
  MENUITEM_CALLBACK_LABEL,
  MENUITEM_CALLBACK_TEXT,
} from './consts';

export const E2EMenuTest: React.FunctionComponent = () => {
  const [menuOpened, setMenuOpened] = React.useState(false);
  const [callbackText, setCallbackText] = React.useState('');

  const onOpenChange = React.useCallback(
    (_e: any, isOpen: boolean) => {
      setMenuOpened(isOpen);
    },
    [setMenuOpened],
  );

  const onItemClick = () => {
    setCallbackText(MENUITEM_CALLBACK_TEXT);
  };

  const onResetClick = () => {
    setCallbackText('');
  };

  return (
    <Stack style={stackStyle}>
      <View style={{ flexDirection: 'row' }}>
        {menuOpened ? <Text testID={MENU_ON_OPEN}>Menu opened</Text> : <Text testID={MENU_ON_CLOSE}>Menu closed</Text>}
        <Button testID={MENU_DEFOCUS_BUTTON}>Defocus Button</Button>
        <Button onClick={onResetClick} testID={MENU_CALLBACK_RESET_BUTTON}>
          Reset Item Callback
        </Button>
        <Menu open={menuOpened} onOpenChange={onOpenChange}>
          <MenuTrigger>
            <Button testID={MENUTRIGGER_TEST_COMPONENT}>Test</Button>
          </MenuTrigger>
          <MenuPopover testID={MENUPOPOVER_TEST_COMPONENT}>
            <MenuList>
              <MenuItem onClick={onItemClick} testID={MENUITEM_TEST_COMPONENT} accessibilityLabel={MENUITEM_ACCESSIBILITY_LABEL}>
                A plain MenuItem
              </MenuItem>
              <MenuItem testID={MENUITEM_DISABLED_COMPONENT} disabled>
                A second disabled plain MenuItem
              </MenuItem>
              <MenuItem testID={MENUITEM_NO_A11Y_LABEL_COMPONENT}>{MENUITEM_TEST_LABEL}</MenuItem>
              <MenuItem testID={MENUITEM_FOURTH_COMPONENT}>A fourth plain MenuItem</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </View>
      <Text style={{ marginVertical: 4 }} testID={MENUITEM_CALLBACK_LABEL}>
        {callbackText}
      </Text>
    </Stack>
  );
};
