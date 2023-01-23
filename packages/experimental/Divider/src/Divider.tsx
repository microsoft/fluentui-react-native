/** @jsx withSlots */
import { View } from 'react-native';
import { dividerName, DividerType, DividerProps } from './Divider.types';
import { stylingSettings } from './Divider.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/text';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { useDivider } from './useDivider';
import React from 'react';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the divider.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the divider
 * @returns Whether the styles that are assigned to the layer should be applied to the divider
 */
export const dividerLookup = (layer: string, userProps: DividerProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    (layer === 'alignStart' && userProps['alignContent'] === 'start') ||
    (layer === 'alignEnd' && userProps['alignContent'] === 'end') ||
    (layer === 'hasContent' && (userProps['children'] ?? userProps['icon'])) ||
    (layer === 'isVertical' && userProps['vertical'])
  );
};

export const Divider = compose<DividerType>({
  displayName: dividerName,
  ...stylingSettings,
  slots: {
    root: View,
    beforeLine: View,
    afterLine: View,
    text: Text,
    icon: Icon,
  },
  useRender: (userProps: DividerProps, useSlots: UseSlots<DividerType>) => {
    const props = useDivider(userProps);
    const Slots = useSlots(userProps, (layer) => dividerLookup(layer, props));

    return (final: DividerProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps(userProps, final);

      let textContent: string;
      React.Children.forEach(children, (child) => {
        if (typeof child === 'string') {
          textContent = child;
        }
      });
      const hasContent = textContent !== undefined || props.icon !== undefined;

      return (
        <Slots.root {...mergedProps}>
          <Slots.beforeLine />
          {textContent && <Slots.text>{textContent}</Slots.text>}
          {props.icon && !textContent && <Slots.icon {...createIconProps(props.icon)} />}
          {hasContent && <Slots.afterLine />}
        </Slots.root>
      );
    };
  },
});
