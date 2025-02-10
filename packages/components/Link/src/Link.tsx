/** @jsxRuntime classic */
/** @jsx withSlots */
import React from 'react';
import { Platform, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Link.styling';
import type { LinkType, LinkProps, LinkState } from './Link.types';
import { linkName } from './Link.types';
import { useLink } from './useLink';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the link.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the link
 * @param userProps The props that were passed into the link
 * @returns Whether the styles that are assigned to the layer should be applied to the link
 */
export const linkLookup = (layer: string, state: LinkState, userProps: LinkProps): boolean => {
  return state[layer] || userProps[layer] || layer === userProps['appearance'];
};

export const Link = compose<LinkType>({
  displayName: linkName,
  ...stylingSettings,
  slots: {
    root: View,
    content: Text,
  },
  useRender: (userProps: LinkProps, useSlots: UseSlots<LinkType>) => {
    const link = useLink(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => linkLookup(layer, link.state, userProps));
    // now return the handler for finishing render
    return (final: LinkProps, ...children: React.ReactNode[]) => {
      // the event fires twice due to native's implementation of inline link
      const { inline, ...mergedProps } = mergeProps(link.props, final);

      // RN Core has a bug where Text in Text is not keyboard accessible. Issues - #32004, #35194.
      // This is a workaround for the issue. Once those issues are resolved, supportsA11yTextInText can be removed.
      const supportsA11yTextInText = Platform.OS !== 'android';

      // MacOS Text component doesn't handle interaction events like hover etc.
      // which are needed to style links correctly. Since macOS can handle
      // Views in Text, we use that to handle interactions instead.
      const supportsInteractionOnText = Platform.OS !== 'macos';

      // Find the first child that's a string and save it to set as the link's
      // accessibilityLabel if one isn't defined.
      let linkA11yLabel = '';
      linkA11yLabel = React.Children.toArray(children)
        .find((child) => typeof child === 'string')
        .toString();

      return supportsA11yTextInText && supportsInteractionOnText && (inline || mergedProps.selectable) ? (
        <Slots.content {...mergedProps}>{children}</Slots.content>
      ) : (
        <Slots.root {...mergedProps} accessibilityLabel={mergedProps.accessibilityLabel ?? linkA11yLabel}>
          <Slots.content focusable={false} accessible={false}>
            {children}
          </Slots.content>
        </Slots.root>
      );
    };
  },
});
