import React, { useState } from 'react';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

const styles = StyleSheet.create({
  menuContainerSubtitle: { fontWeight: 'bold' },
  menuContainerRow: { flexDirection: 'row' },
  menuMargin: { marginRight: 20 },
});

export const MenuScrollView: React.FunctionComponent = () => {
  const [maxHeight, setMaxHeight] = useState<number>(800);
  const ScrollViewMenuPopover = MenuPopover.customize({ maxHeight: maxHeight });
  const menuItems = [];
  const [data, setData] = useState([
    <MenuItem key={1}>MenuItem 1</MenuItem>,
    <MenuItem key={2}>MenuItem 2</MenuItem>,
    <MenuItem key={3}>MenuItem 3</MenuItem>,
    <MenuItem key={4}>MenuItem 4</MenuItem>,
    <MenuItem key={5}>MenuItem 5</MenuItem>,
  ]);

  for (let i = 0; i < 400; i++) {
    menuItems.push(<MenuItem key={i}>MenuItem {i}</MenuItem>);
  }
  const insertOnClick = React.useCallback(() => {
    data.push(<MenuItem key={Math.random()}>MenuItem</MenuItem>);
    const newList = [...data];
    setData(newList);
  }, [data]);

  const popOnClick = React.useCallback(() => {
    if (data.length > 0) {
      data.pop();
      const newList = [...data];
      setData(newList);
    }
  }, [data]);

  return (
    <Stack style={stackStyle}>
      <View style={styles.menuContainerRow}>
        <TextInput
          accessibilityLabel="Max height for menu"
          style={[commonStyles.textBox, styles.menuMargin]}
          placeholder="Max height for menu"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setMaxHeight(parseInt(e.nativeEvent.text));
          }}
        />
        <Menu>
          <MenuTrigger>
            <Button>Test</Button>
          </MenuTrigger>
          <ScrollViewMenuPopover>
            <MenuList>{menuItems}</MenuList>
          </ScrollViewMenuPopover>
        </Menu>
      </View>
      <Text style={styles.menuContainerSubtitle}>Add/Remove menu item</Text>
      <View style={styles.menuContainerRow}>
        <Button appearance="subtle" onClick={insertOnClick}>
          Add new menu item
        </Button>
        <Button appearance="subtle" onClick={popOnClick}>
          Remove last menu item
        </Button>
        <Menu>
          <MenuTrigger>
            <Button>Mutable Menu</Button>
          </MenuTrigger>
          <ScrollViewMenuPopover>
            <MenuList>{data}</MenuList>
          </ScrollViewMenuPopover>
        </Menu>
      </View>
      <Menu>
        <MenuTrigger>
          <Button>Custom height</Button>
        </MenuTrigger>
        <MenuPopover maxHeight={100}>
          <MenuList>
            <MenuItem>MenuItem 1</MenuItem>
            <MenuItem>MenuItem 2</MenuItem>
            <MenuItem>MenuItem 3</MenuItem>
            <MenuItem>MenuItem 4</MenuItem>
            <MenuItem>MenuItem 5</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};
