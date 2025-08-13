/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './RadioGroup.styling';
import type { RadioGroupType, RadioGroupProps, RadioGroupState } from './RadioGroup.types';
import { radioGroupName } from './RadioGroup.types';
import { RadioGroupProvider } from './radioGroupContext';
import { useRadioGroup } from './useRadioGroup';
import { useRadioGroupContextValue } from './useRadioGroupContextValue';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the radiogroup.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the radiogroup
 * @param userProps The props that were passed into the radiogroup
 * @returns Whether the styles that are assigned to the layer should be applied to the radiogroup
 */
export const radioGroupLookup = (layer: string, state: RadioGroupState, userProps: RadioGroupProps): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    (!(Platform.OS === ('win32' as any) || Platform.OS === 'android') &&
      layer === 'isHorizontal' &&
      (userProps['layout'] === 'horizontal' || userProps['layout'] === 'horizontal-stacked'))
  );
};

export const RadioGroup = compose<RadioGroupType>({
  displayName: radioGroupName,
  ...stylingSettings,
  slots: {
    root: View,
    label: View,
    labelText: Text,
    required: Text,
    options: View,
    container: FocusZone,
  },
  useRender: (userProps: RadioGroupProps, useSlots: UseSlots<RadioGroupType>) => {
    const radioGroup = useRadioGroup(userProps);
    const contextValue = useRadioGroupContextValue(radioGroup.state);
    const Slots = useSlots(userProps, (layer) => radioGroupLookup(layer, radioGroup.state, userProps));

    return (final: RadioGroupProps, ...children: React.ReactNode[]) => {
      if (!radioGroup.state) {
        return null;
      }

      const { label, required, defaultTabbableElement, isCircularNavigation, ...mergedProps } = mergeProps(radioGroup.props, final);

      const labelComponent = (
        <Slots.label>
          <Slots.labelText key="label">{label}</Slots.labelText>
          {!!required && <Slots.required>{'*'}</Slots.required>}
        </Slots.label>
      );

      const isFocusZoneImplemented = ['macos', 'win32'].includes(Platform.OS as string);

      const radioGroupContent = <Slots.options>{children}</Slots.options>;
      const radioGroupContentWithFocusZone = (
        <Slots.container
          disabled={radioGroup.state.selectedButtonDisabled}
          isCircularNavigation
          defaultTabbableElement={defaultTabbableElement}
        >
          {radioGroupContent}
        </Slots.container>
      );

      return (
        <RadioGroupProvider value={contextValue}>
          <Slots.root {...mergedProps}>
            {label && labelComponent}
            {isFocusZoneImplemented ? radioGroupContentWithFocusZone : radioGroupContent}
          </Slots.root>
        </RadioGroupProvider>
      );
    };
  },
});
