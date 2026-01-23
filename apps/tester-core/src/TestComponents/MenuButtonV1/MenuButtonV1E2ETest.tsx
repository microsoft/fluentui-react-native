import * as React from 'react';
import { Text, View } from 'react-native';

import type { ContextualMenuProps } from '@fluentui/react-native';
import {
  MENUBUTTONV1_TEST_COMPONENT,
  MENUBUTTONV1_ACCESSIBILITY_LABEL,
  MENUBUTTONV1_NO_A11Y_LABEL_COMPONENT,
  MENUBUTTONV1_TEST_COMPONENT_LABEL,
} from '@fluentui-react-native/e2e-testing';
import { MenuButton } from '@fluentui-react-native/experimental-menu-button';

import { viewWrapperStyle, columnStyle, rowStyle, textColor } from './MenuButtonV1TestStyles';
import { menuItems } from './testData';
import { testProps } from '../Common/TestProps';

export const MenuButtonV1E2ETest: React.FunctionComponent = () => {
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
                accessibilityLabel={MENUBUTTONV1_ACCESSIBILITY_LABEL}
                /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                {...testProps(MENUBUTTONV1_TEST_COMPONENT)}
              />
            </View>
          </View>
          <View style={{ ...rowStyle, paddingHorizontal: 5 }}>
            <View style={columnStyle}>
              <MenuButton
                content={MENUBUTTONV1_TEST_COMPONENT_LABEL}
                menuItems={menuItems}
                onItemClick={onItemClick}
                contextualMenu={contextualMenuProps}
                /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                {...testProps(MENUBUTTONV1_NO_A11Y_LABEL_COMPONENT)}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
