/** @jsxImportSource @fluentui-react-native/framework */
import * as React from 'react';
import { View } from 'react-native';
import type { ComponentNameType, ComponentNameProps } from './ComponentName.types';
import { componentName } from './ComponentName.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './ComponentName.styling';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { useComponentName } from './useComponentName';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the component-name.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the component-name
 * @returns Whether the styles that are assigned to the layer should be applied to the component-name
 */
export const componentNameLookup = (layer: string, userProps: ComponentNameProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

export const ComponentName = compose<ComponentNameType>({
  displayName: componentName,
  ...stylingSettings,
  slots: {
    root: View,
    text: Text,
  },
  useRender: (userProps: ComponentNameProps, useSlots: UseSlots<ComponentNameType>) => {
    const componentNameProps = useComponentName(userProps);
    const Slots = useSlots(userProps, (layer) => componentNameLookup(layer, userProps));

    return (final: ComponentNameProps, ...children: React.ReactNode[]) => {
      const { text, ...mergedProps } = mergeProps(componentNameProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.text>{text}</Slots.text>
          {children}
        </Slots.root>
      );
    };
  },
});
