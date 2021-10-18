/** @jsx withSlots */
import * as React from 'react';

import { Linking } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ILinkProps, ILinkSlotProps, ILinkState, ILinkRenderData, linkName, ILinkType } from './Link.types';
import { settings } from './Link.settings';
import { foregroundColorTokens, textTokens, borderTokens } from '@fluentui-react-native/tokens';
import { useKeyCallback, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Pressable } from '@fluentui-react-native/pressable';
import { usePressableState } from '@fluentui-react-native/interactive-hooks';

export type ILinkHooks = [ILinkProps, ILinkState];

export function useAsLink(userProps: ILinkProps, ref: React.RefObject<any>): ILinkHooks {
  const { url, onPress, ...rest } = userProps;

  const [linkState, setLinkState] = React.useState({ visited: false });
  const linkOnPress = React.useCallback(
    (e) => {
      setLinkState({ visited: true });
      if (url) {
        Linking.openURL(url as string);
      } else if (onPress) {
        onPress(e);
      }
    },
    [setLinkState, url, onPress],
  );

  // Ensure focus is placed on link after click
  const linkOnPressWithFocus = useOnPressWithFocus(ref, linkOnPress);

  const pressable = usePressableState({ onPress: linkOnPressWithFocus, ...rest });
  const onKeyUp = useKeyCallback(linkOnPress, ' ', 'Enter');

  const newState = {
    ...pressable.state,
    ...linkState,
  };

  const newProps = {
    ...userProps,
    ...pressable.props,
    onKeyUp,
  };

  return [newProps, newState];
}

export const Link = compose<ILinkType>({
  displayName: linkName,
  settings,
  usePrepareProps: (userProps: ILinkProps, useStyling: IUseComposeStyling<ILinkType>): ILinkRenderData => {
    const defaultComponentRef = React.useRef(null);
    const { content, onAccessibilityTap, componentRef = defaultComponentRef, ...rest } = userProps;

    const [linkProps, linkState] = useAsLink(rest, componentRef);
    const onAccTap = onAccessibilityTap ? onAccessibilityTap : linkProps.onPress;

    const info = { content: !!content };

    const linkRef = useViewCommandFocus(componentRef);

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => linkState[override] || userProps[override]);

    // create the merged slot props
    const slotProps = mergeSettings<ILinkSlotProps>(styleProps, {
      root: { ...linkProps, ref: linkRef, onAccessibilityTap: onAccTap },
      content: { children: content },
    });

    return { slotProps, state: { ...linkState, ...info } };
  },
  render: (Slots: ISlots<ILinkSlotProps>, renderData: ILinkRenderData, ...children: React.ReactNode[]) => {
    const content = renderData.state && renderData.state.content;

    return children && children.length && children.length === 1 && children[0] !== undefined ? (
      <Slots.root>
        {content && <Slots.content />}
        {children}
      </Slots.root>
    ) : (
      <Slots.root>{content && <Slots.content />}</Slots.root>
    );
  },
  slots: {
    root: Pressable,
    content: Text,
  },
  styles: {
    root: [],
    content: [foregroundColorTokens, textTokens, borderTokens],
  },
});

export default Link;
