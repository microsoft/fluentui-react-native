/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { linkName, LinkType, LinkProps, ILinkState } from './Link.types';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useLink } from './useLink';
import { TextV1 as Text } from '@fluentui-react-native/text';
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
    (layer === 'disabled' && userProps.disabled)
  );
};

export const Link = compose<LinkType>({
  displayName: linkName,
  ...stylingSettings,
  slots: {
    root: View,
    content: Text
  },
  useRender: (userProps: LinkProps, useSlots: UseSlots<LinkType>) => {
    const link = useLink(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => linkLookup(layer, link.state, userProps));
    // now return the handler for finishing render
    return (final: LinkProps, ...children: React.ReactNode[]) => {
      // pull onPress out to let Link's Pressable deal with all press events
      const {
        inline,
        onPress,
        ...mergedProps
      } = mergeProps(link.props, final);

      return (
        inline || mergedProps.selectable ? <Slots.content {...mergedProps}>{children}</Slots.content>
        : <Slots.root {...mergedProps}>
            <Slots.content focusable={false}>
              {children}
            </Slots.content>
          </Slots.root>
      );
    };
  },
});
