import * as React from 'react';
import { Text, View } from 'react-native';

import { MenuButton } from '@fluentui/react-native';

import { viewWrapperStyle, columnStyle, rowStyle } from './MenuButtonV1TestStyles';
import { menuItems } from './testData';

const StyledMenuButton = MenuButton.customize({
  button: {
    borderRadius: 4,
    backgroundColor: '#0095ff',
    borderWidth: 0,
    color: '#fff',
    variant: 'heroSemibold',
    fontFamily: 'Georgia',
  },
  contextualMenu: { backgroundColor: '#a9dbff' },
});

export const CustomizedMenuButton: React.FunctionComponent = () => {
  return (
    <View>
      <View style={viewWrapperStyle}>
        <View style={columnStyle}>
          <View style={rowStyle}>
            <Text>MenuButton with customized UI</Text>
          </View>
        </View>
      </View>
      <StyledMenuButton content="styled MenuButton" menuItems={menuItems} />
    </View>
  );
};
