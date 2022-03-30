import * as React from 'react';
import { MenuButton, ContextualMenuProps } from '@fluentui/react-native';
import { Text, View } from 'react-native';
import { menuItems } from './testData';
import { viewWrapperStyle, columnStyle, rowStyle, textColor } from './MenuButtonTestStyles';
import {
  MENU_BUTTON_TEST_COMPONENT,
  MENU_BUTTON_ACCESSIBILITY_LABEL,
  MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
  MENU_BUTTON_TEST_COMPONENT_LABEL,
} from './consts';

export const E2ETestMenuButton: React.FunctionComponent = () => {
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
                menuItems={menuItems}
                onItemClick={onItemClick}
                contextualMenu={contextualMenuProps}
                testID={MENU_BUTTON_TEST_COMPONENT}
                accessibilityLabel={MENU_BUTTON_ACCESSIBILITY_LABEL}
              >
                Standard MenuButton with Accessibility Label
              </MenuButton>
            </View>
          </View>
          <View style={{ ...rowStyle, paddingHorizontal: 5 }}>
            <View style={columnStyle}>
              <MenuButton
                menuItems={menuItems}
                onItemClick={onItemClick}
                contextualMenu={contextualMenuProps}
                testID={MENU_BUTTON_NO_A11Y_LABEL_COMPONENT}
              >
                {MENU_BUTTON_TEST_COMPONENT_LABEL}
              </MenuButton>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
