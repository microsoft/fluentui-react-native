import { StyleSheet, View } from 'react-native';
import { IStackProps } from '@fluentui-react-native/stack';
import { Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Icon } from '@fluentui-react-native/icon';

export const focusZoneTestStyles = StyleSheet.create({
  focusZoneViewStyle: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
  },
  focusZoneContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    padding: 4,
  },
  nestedFocusZoneStyle: {
    borderWidth: 1,
    padding: 10,
  },
  focusZoneButton: {
    height: 50,
    width: 50,
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

export const stackStyleFocusZone: IStackProps['style'] = {
  flexDirection: 'column',
  marginBottom: 40,
};
