import * as React from 'react';
import { PickerItemProps } from 'react-native';
import { requireNativeComponent } from 'react-native';

const RCTPickerItem = requireNativeComponent('RCTPickerItem');

export const PickerItem: React.FunctionComponent<PickerItemProps> = (props: PickerItemProps) => {
  return <RCTPickerItem {...props} />;
};
