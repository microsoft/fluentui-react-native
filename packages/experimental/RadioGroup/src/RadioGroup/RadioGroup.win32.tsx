/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { radioGroupName, RadioGroupType, RadioGroupProps, RadioGroupState } from './RadioGroup.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { stylingSettings } from './RadioGroup.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useRadioGroup } from './useRadioGroup.win32';
import { RadioGroupProvider } from './radioGroupContext';
import { useRadioGroupContextValue } from './useRadioGroupContextValue';
import { KeyPressEvent } from '@fluentui-react-native/interactive-hooks';

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
    (layer === 'isHorizontal' && (userProps['layout'] === 'horizontal' || userProps['layout'] === 'horizontal-stacked'))
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

      // Populate the buttonKeys array
      if (children) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        contextValue.values = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            return child.props.value;
          }
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        contextValue.enabledValues = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child) && !child.props.disabled) {
            return child.props.value;
          }
        });
      }

      const onKeyDown = (e: KeyPressEvent) => {
        if (
          e.nativeEvent.key == 'ArrowDown' ||
          e.nativeEvent.key == 'ArrowRight' ||
          e.nativeEvent.key == 'ArrowUp' ||
          e.nativeEvent.key == 'ArrowLeft'
        ) {
          const length = contextValue.enabledValues.length;
          const currRadioIndex = contextValue.enabledValues.indexOf(contextValue.value);
          let newCurrRadioIndex;
          if (e.nativeEvent.key === 'ArrowDown' || e.nativeEvent.key == 'ArrowRight') {
            if (isCircularNavigation || !(currRadioIndex + 1 == length)) {
              newCurrRadioIndex = (currRadioIndex + 1) % length;
              contextValue.value = contextValue.enabledValues[newCurrRadioIndex];
              contextValue.onChange(contextValue.value);
              // React.useRef(children[newCurrRadioIndex])?.current?.focus();
            }
          } else {
            if (isCircularNavigation || !(currRadioIndex == 0)) {
              newCurrRadioIndex = (currRadioIndex - 1 + length) % length;
              // radioGroupContext.onChange && radioGroupContext.onChange(radioGroupContext.values[newCurrRadioIndex]);
              // radioGroupContext.updateSelectedButtonRef && componentRef && radioGroupContext.updateSelectedButtonRef(componentRef);
              contextValue.value = contextValue.enabledValues[newCurrRadioIndex];
              contextValue.onChange(contextValue.value);
            }
          }
        }
      };

      return (
        <RadioGroupProvider value={contextValue}>
          <Slots.root {...mergedProps}>
            {label && labelComponent}
            <Slots.container isCircularNavigation defaultTabbableElement={defaultTabbableElement}>
              <Slots.options onKeyDown={onKeyDown}>{children}</Slots.options>
            </Slots.container>
          </Slots.root>
        </RadioGroupProvider>
      );
    };
  },
});
