/** @jsx withSlots */
import { View } from 'react-native';
import { divider, DividerType, DividerProps, DividerState } from './Divider.types';
import { stylingSettings } from './Divider.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/text';
import { Icon } from '@fluentui-react-native/icon';
import { useDivider } from './useDivider';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the divider.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the divider
 * @returns Whether the styles that are assigned to the layer should be applied to the divider
 */
export const dividerLookup = (layer: string, state: DividerState, userProps: DividerProps): boolean => {
  return userProps[layer] || state[layer];
};

export const Divider = compose<DividerType>({
  displayName: divider,
  ...stylingSettings,
  slots: {
    root: View,
    beforeLine: View,
    afterLine: View,
    text: Text,
    icon: Icon,
  },
  useRender: (userProps: DividerProps, useSlots: UseSlots<DividerType>) => {
    const {
      props: { text, icon },
      state,
    } = useDivider(userProps);
    const Slots = useSlots(userProps, (layer) => dividerLookup(layer, state, userProps));

    return (final: DividerProps) => {
      const mergedProps = mergeProps(userProps, final);
      const hasChildren = text !== undefined || icon !== undefined;

      return (
        <Slots.root {...mergedProps}>
          <Slots.beforeLine />
          {text && <Slots.text>{text}</Slots.text>}
          {hasChildren && <Slots.afterLine />}
        </Slots.root>
      );
    };
  },
});
