import { StyleSheet } from 'react-native';
import { IStackProps } from '@fluentui-react-native/stack';

export const focusZoneTestStyles = StyleSheet.create({
  focusZoneViewStyle: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  focusZoneContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    padding: 4,
  },
  focusZoneButton: {
    marginRight: 60,
    height: 50,
    width: 50,
  },
  focusZoneButton0: {
    height: 50,
    width: 50,
  },
});

export const stackStyleFocusZone: IStackProps['style'] = {
  flexDirection: 'column',
  marginBottom: 40,
};
