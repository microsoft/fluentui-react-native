import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import { commonTestStyles as commonStyles } from '../Common/styles';

const styles = StyleSheet.create({
  menuContainerRow: { flexDirection: 'row' },
  menuMargin: { marginRight: 20 },
});

export const MenuScrollView: React.FunctionComponent = () => {
  const [data, setData] = useState([
    <MenuItem key={1}>MenuItem 1</MenuItem>,
    <MenuItem key={2}>MenuItem 2</MenuItem>,
    <MenuItem key={3}>MenuItem 3</MenuItem>,
    <MenuItem key={4}>MenuItem 4</MenuItem>,
    <MenuItem key={5}>MenuItem 5</MenuItem>,
  ]);

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

  const [maxHeight, setMaxHeight] = useState<number>(800);
  const menuItems = [];

  for (let i = 0; i < 40; i++) {
    menuItems.push(<MenuItem key={i}>MenuItem {i}</MenuItem>);
  }

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
            <Button>Custom height</Button>
          </MenuTrigger>
          <MenuPopover maxHeight={maxHeight}>
            <MenuList>{menuItems}</MenuList>
          </MenuPopover>
        </Menu>
      </View>
      <View style={styles.menuContainerRow}>
        <Button appearance="subtle" onClick={insertOnClick}>
          Add new menu item
        </Button>
        <Button appearance="subtle" onClick={popOnClick}>
          Remove last menu item
        </Button>
        <Menu>
          <MenuTrigger>
            <Button>Mutable Menu: MaxHeight 250 </Button>
          </MenuTrigger>
          <MenuPopover maxHeight={250}>
            <MenuList>{data}</MenuList>
          </MenuPopover>
        </Menu>
      </View>
      <Menu>
        <MenuTrigger>
          <Button>Height: 100 minWidth: 250</Button>
        </MenuTrigger>
        <MenuPopover maxHeight={100} minWidth={250}>
          <MenuList>
            <MenuItem>MenuItem 1</MenuItem>
            <MenuItem>MenuItem 2</MenuItem>
            <MenuItem>MenuItem 3</MenuItem>
            <MenuItem>MenuItem 4</MenuItem>
            <MenuItem>MenuItem 5</MenuItem>
            <MenuItem>MenuItem 6</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};
