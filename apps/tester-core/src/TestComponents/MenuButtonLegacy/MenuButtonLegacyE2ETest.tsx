import * as React from 'react';
import { Text, View } from 'react-native';

import type { ContextualMenuProps } from '@fluentui/react-native';
import { MenuButton } from '@fluentui/react-native';
import {
  MENU_BUTTON_TEST_COMPONENT,
  MENU_BUTTON_ACCESSIBILITY_LABEL,
  MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
  MENU_BUTTON_TEST_COMPONENT_LABEL,
} from '@fluentui-react-native/e2e-testing';

import { viewWrapperStyle, columnStyle, rowStyle, textColor } from './MenuButtonLegacyTestStyles';
import { menuItems } from './testData';
import { testProps } from '../Common/TestProps';

export const MenuButtonLegacyE2ETest: React.FunctionComponent = () => {
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const onItemClick = React.useCallback(
    (key) => {
      setLastMenuItemClicked(key);
    },
    [setLastMenuItemClicked],
  );

  const contextualMenuProps: ContextualMenuProps = {
    accessibilityLabel: 'MenuButton',
    shouldFocusOnMount: true,
    shouldFocusOnContainer: false,
  };

  return (
    <View>
      <View style={viewWrapperStyle}>
        <View style={columnStyle}>
          <Text>
            <Text>Last Menu Item Clicked: </Text>
            {lastMenuItemClicked > 0 ? <Text style={textColor}>{lastMenuItemClicked}</Text> : <Text style={textColor}>none</Text>}
          </Text>
          <View style={{ ...rowStyle, paddingHorizontal: 5 }}>
            <View style={columnStyle}>
              <MenuButton
                content="Standard MenuButton with Accessibility Label"
                menuItems={menuItems}
                onItemClick={onItemClick}
                contextualMenu={contextualMenuProps}
                accessibilityLabel={MENU_BUTTON_ACCESSIBILITY_LABEL}
                /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                {...testProps(MENU_BUTTON_TEST_COMPONENT)}
              />
            </View>
          </View>
          <View style={{ ...rowStyle, paddingHorizontal: 5 }}>
            <View style={columnStyle}>
              <MenuButton
                content={MENU_BUTTON_TEST_COMPONENT_LABEL}
                menuItems={menuItems}
                onItemClick={onItemClick}
                contextualMenu={contextualMenuProps}
                /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                {...testProps(MENU_BUTTON_NO_A11Y_LABEL_COMPONENT)}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
