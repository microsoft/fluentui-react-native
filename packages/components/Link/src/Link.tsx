/** @jsx withSlots */
import * as React from 'react';
import * as ReactNative from 'react-native';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ILinkProps, ILinkSlotProps, ILinkState, ILinkRenderData, IWithLinkOptions, linkName, ILinkType } from './Link.types';
import { settings } from './Link.settings';
import { foregroundColorTokens, textTokens } from '@fluentui-react-native/tokens';
// import { Text } from '../Text';
import { useAsPressable, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
// import { IViewWin32Props } from '@office-iss/react-native-win32';
import { IViewProps } from '@fluentui-react-native/adapters';

export type ILinkHooks = [IWithLinkOptions<IViewProps>, ILinkState];

export function useAsLink(userProps: IWithLinkOptions<IViewProps>): ILinkHooks {
  const { url, onPress, ...rest } = userProps;

  const [linkState, setLinkState] = React.useState({ visited: false });
  const linkOnPress = React.useCallback(() => {
    setLinkState({ visited: true });
    if (url) {
      ReactNative.Linking.openURL(url as string);
    } else if (onPress) {
      onPress();
    }
  }, [setLinkState, url, onPress]);

  const pressable = useAsPressable({ onPress: linkOnPress, ...rest });

  const newState = {
    ...pressable.state,
    ...linkState
  };

  const newProps = {
    ...userProps,
    ...pressable.props
  };

  return [newProps, newState];
}

export const Link = compose<ILinkType>({
  displayName: linkName,
  settings,
  usePrepareProps: (userProps: ILinkProps, useStyling: IUseComposeStyling<ILinkType>): ILinkRenderData => {
    const { content, ...rest } = userProps;

    const [linkProps, linkState] = useAsLink(rest);

    const info = { content: !!content };

    const linkRef = useViewCommandFocus(userProps.componentRef);

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => linkState[override] || userProps[override]);

    // create the merged slot props
    const slotProps = mergeSettings<ILinkSlotProps>(styleProps, {
      root: { ...linkProps, ref: linkRef },
      content: { children: content }
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
      <Slots.content {...(renderData.slotProps!.root as any)} />
    );
  },
  slots: {
    root: ReactNative.View,
    content: ReactNative.Text
  },
  styles: {
    root: [],
    content: [foregroundColorTokens, textTokens]
  }
});

export default Link;
