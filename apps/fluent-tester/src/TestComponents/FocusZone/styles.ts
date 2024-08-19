import { Platform, StyleSheet, View } from 'react-native';

import { Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Icon } from '@fluentui-react-native/icon';

export const focusZoneTestStyles = StyleSheet.create({
  focusZoneViewStyle: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
  },
  nestedFocusZoneStyle: {
    borderWidth: 1,
    padding: 8,
    margin: 8,
  },
  focusZoneButton: {
    height: 30,
    width: 100,
    margin: 10,
  },
  listWrapperButton: {
    marginVertical: 10,
  },
  dashedBorder: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: 12,
  },
  scrollViewStyle: {
    height: 100,
    width: 300,
  },
  scrollViewContentStyle: {
    backgroundColor: 'grey',
  },
  scrollViewButton: {
    marginHorizontal: 20,
    marginBottom: 100,
  },
  smallBoxStyle: {
    width: 20,
    height: 20,
    margin: 5,
    // something is wrong with setting the background color on this style on the Mac, and until we fix that, let's not do this
    ...Platform.select({ macos: { borderWidth: 1 }, default: { backgroundColor: 'lightgrey' } }),
  },
  wideBoxStyle: {
    width: 150,
    height: 20,
    margin: 5,
    // something is wrong with setting the background color on this style on the Mac, and until we fix that, let's not do this
    ...Platform.select({ macos: { borderWidth: 1 }, default: { backgroundColor: 'lightgrey' } }),
  },
});

export const GridButton = Button.compose({
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  slotProps: {
    content: {
      style: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    },
  },
});

export const SubheaderText = Text.customize({
  tokens: { variant: 'subheaderSemibold' },
  root: { style: { textDecorationLine: 'underline' } },
});
