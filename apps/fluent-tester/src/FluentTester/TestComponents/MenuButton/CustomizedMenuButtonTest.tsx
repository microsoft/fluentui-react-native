import * as React from 'react';
import { Text, View } from 'react-native';
import { MenuButton } from '@fluentui/react-native';
import { menuItems } from './testData';

export const CustomizedMenuButton: React.FunctionComponent = () => {
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
  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text>MenuButton with customized UI</Text>
          </View>
        </View>
      </View>
      <StyledMenuButton content="styled MenuButton" menuItems={menuItems} />
    </View>
  );
};
