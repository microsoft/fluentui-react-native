import * as React from 'react';
import { MenuButton } from '@fluentui-react-native/experimental-menu-button';
import { ContextualMenuProps } from '@fluentui/react-native';
import { Text, View } from 'react-native';
import { menuItems } from './testData';
import { viewWrapperStyle, columnStyle, rowStyle, textColor } from './MenuButtonTestStyles';
import {
  EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT,
  EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL,
} from './consts';

export const E2ETestExperimentalMenuButton: React.FunctionComponent = () => {
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
                testID={EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT}
                accessibilityLabel={EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL}
              />
            </View>
          </View>
          <View style={{ ...rowStyle, paddingHorizontal: 5 }}>
            <View style={columnStyle}>
              <MenuButton
                content={EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL}
                menuItems={menuItems}
                onItemClick={onItemClick}
                contextualMenu={contextualMenuProps}
                testID={EXPERIMENTAL_MENU_BUTTON_NO_A11Y_LABEL_COMPONENT}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
