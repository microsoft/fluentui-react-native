import * as React from 'react';
import { PickerItem, PickerProps, requireNativeComponent } from 'react-native';

const RCTPicker = requireNativeComponent('RCTPicker');

function getValueChangeEvent(pickerProps: PickerProps, children?: React.ReactNode) {
  return (event: { nativeEvent: { pickerItemIndex: number } }) => {
    const { onValueChange } = pickerProps;
    if (!onValueChange || !children) {
      return;
    }
    const pickerItems = children as PickerItem[];
    const selectedIndex = event.nativeEvent.pickerItemIndex;

    if (selectedIndex >= 0 && selectedIndex < pickerItems.length) {
      onValueChange(pickerItems[selectedIndex].props.value, selectedIndex);
    } else {
      onValueChange(null, selectedIndex);
    }
  };
}

export class Picker extends React.Component<PickerProps, {}> {
  static Item: typeof PickerItem;

  public render(): React.ReactNode {
    const { selectedValue, children } = this.props;

    let selectedIndex = -1;
    if (selectedValue && children) {
      selectedIndex = (children as PickerItem[]).findIndex(pickerItem => {
        return pickerItem.props.value === selectedValue;
      });
    }

    const onValueChange = getValueChangeEvent(this.props, children);
    const nativeProps = {
      ...this.props,
      selectedIndex,
      onValueChange
    };

    return <RCTPicker {...nativeProps}>{children}</RCTPicker>;
  }
}
