/** @jsx withSlots */
import * as React from 'react';
import { linkName, LinkType, LinkProps, ILinkState } from './Link.types';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useLink } from './useLink';
import { Text } from 'react-native';
import { stylingSettings } from './Link.styling';


/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the link.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the link
 * @param userProps The props that were passed into the link
 * @returns Whether the styles that are assigned to the layer should be applied to the link
 */
export const linkLookup = (layer: string, state: ILinkState, userProps: LinkProps): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['appearance'] ||
    (layer === 'inline' && userProps.inline) ||
    (layer === 'hovered' && state[layer]) ||
    (layer === 'pressed' && state[layer]) ||
    (layer === 'visited' && state[layer]) ||
    (layer === 'focused' && state[layer])
  );
};

export const Link = compose<LinkType>({
  displayName: linkName,
  ...stylingSettings,
  slots: {
    root: Text,
    // icon: Icon,
  },
  useRender: (userProps: LinkProps, useSlots: UseSlots<LinkType>) => {
    const link = useLink(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => linkLookup(layer, link.state, userProps));
    // now return the handler for finishing render
    return (final: LinkProps, ...children: React.ReactNode[]) => {
      // pull onPress out to let Link's Pressable deal with all press events
      const { onPress, ...mergedProps } = mergeProps(link.props, final);

      return (
          <Slots.root {...mergedProps}>{children}</Slots.root>
      );
    };
  },
});
