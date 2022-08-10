/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioGroupName, RadioGroupType, RadioGroupProps } from './RadioGroup.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { stylingSettings } from './RadioGroup.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadioGroup } from './useRadioGroup';
import { RadioGroupProvider } from './radioGroupContext';
// import { useRadioGroupContextValue } from './useRadioGroupContextValue';

export const RadioGroup = compose<RadioGroupType>({
  displayName: radioGroupName,
  ...stylingSettings,
  slots: {
    root: View,
    label: Text,
    container: FocusZone,
  },
  useRender: (userProps: RadioGroupProps, useSlots: UseSlots<RadioGroupType>) => {
    const radioGroup = useRadioGroup(userProps);
    // console.log('value selected: ' + radioGroup.state.context.value);
    // const contextValue = radioGroup.state.context;
    const Slots = useSlots(userProps, (layer) => radioGroup.state[layer] || userProps[layer]);

    return (final: RadioGroupProps, ...children: React.ReactNode[]) => {
      if (!radioGroup.state) {
        return null;
      }

      const { accessibilityLabel, label, defaultTabbableElement, isCircularNavigation, accessibilityRole, ...mergedProps } = mergeProps(
        radioGroup.props,
        final,
      );

      // Populate the buttonKeys array
      if (children) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        radioGroup.state.context.buttonKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            // return child.props.buttonKey;
            return child.props.value;
          }
        });
      }

      return (
        <RadioGroupProvider value={radioGroup.state.context}>
          <Slots.root {...mergedProps} accessibilityLabel={accessibilityLabel ?? label} accessibilityRole={accessibilityRole}>
            {label && <Slots.label>{label}</Slots.label>}
            <Slots.container isCircularNavigation defaultTabbableElement={defaultTabbableElement}>
              {children}
            </Slots.container>
          </Slots.root>
        </RadioGroupProvider>
      );

      // const radioGroup = useRadioGroup(userProps);
      // console.log('radioGroup: ' + radioGroup);
      // console.log('useRender radioGroup context value: ' + radioGroup.value);
      // const contextValue = useRadioGroupContextValue(radioGroup);
      // const Slots = useSlots(userProps, (override: string) => radioGroup[override] || userProps[override]);
      // // const Slots = useSlots(radioGroup.props);

      // return (final: RadioGroupProps, ...children: React.ReactNode[]) => {
      //   const { accessibilityLabel, label, ...mergedProps } = mergeProps(radioGroup.props, final);

      //   if (radioGroup == undefined) {
      //     return null;
      //   }

      // // Populate the buttonKeys array
      // if (children) {
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore - TODO, fix typing error
      //   radioGroup.buttonKeys = React.Children.map(children, (child: React.ReactChild) => {
      //     if (React.isValidElement(child)) {
      //       return child.props.buttonKey;
      //     }
      //   });
      // }

      // return (
      //   <RadioGroupProvider value={contextValue}>
      //     <Slots.root {...mergedProps} accessibilityLabel={accessibilityLabel ?? label} accessibilityRole={'radiogroup'}>
      //       {label && <Slots.label>{label}</Slots.label>}
      //       <Slots.container isCircularNavigation defaultTabbableElement={radioGroup.selectedButtonRef}>
      //         {children}
      //       </Slots.container>
      //     </Slots.root>
      //   </RadioGroupProvider>
      // );
    };
  },
});
