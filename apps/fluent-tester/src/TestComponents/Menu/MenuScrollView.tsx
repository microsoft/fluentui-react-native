import React, { useState } from 'react';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { TextInput, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const MenuScrollView: React.FunctionComponent = () => {
  const [maxHeight, setMaxHeight] = useState<number>(800);
  const ScrollViewMenuPopover = MenuPopover.customize({ maxHeight: maxHeight });
  const menuItems = [];
  for (let i = 0; i < 400; i++) {
    menuItems.push(<MenuItem key={i}>MenuItem</MenuItem>);
  }

  return (
    <Stack style={stackStyle}>
      <View>
        <TextInput
          accessibilityLabel="Max height for menu"
          style={commonStyles.textBox}
          placeholder="Max height for menu"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setMaxHeight(parseInt(e.nativeEvent.text));
          }}
        />
      </View>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <ScrollViewMenuPopover>
          <MenuList>{menuItems}</MenuList>
        </ScrollViewMenuPopover>
      </Menu>
    </Stack>
  );
};
