/** @jsx withSlots */
import * as React from 'react';

import { Linking, View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { IShimmerProps, IShimmerSlotProps, IShimmerState, IShimmerRenderData, IWithShimmerOptions, ShimmerName, IShimmerType } from './Shimmer.types';
import { settings } from './Shimmer.settings';
import { foregroundColorTokens, textTokens } from '@fluentui-react-native/tokens';
import { useAsPressable, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { IViewProps } from '@fluentui-react-native/adapters';

export type IShimmerHooks = [IWithShimmerOptions<IViewProps>, IShimmerState];

export function useAsShimmer(userProps: IWithShimmerOptions<IViewProps>): IShimmerHooks {
  const { url, onPress, ...rest } = userProps;

  const [ShimmerState, setShimmerState] = React.useState({ visited: false });
  const ShimmerOnPress = React.useCallback(
    e => {
      setShimmerState({ visited: true });
      if (url) {
        Linking.openURL(url as string);
      } else if (onPress) {
        onPress(e);
      }
    },
    [setShimmerState, url, onPress]
  );

  const pressable = useAsPressable({ onPress: ShimmerOnPress, ...rest });
  const onKeyUp = React.useCallback(
    e => {
      if (ShimmerOnPress && (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === ' ')) {
        ShimmerOnPress(e);
        e.stopPropagation()
      }
    },
    [ShimmerOnPress]
  );

  const newState = {
    ...pressable.state,
    ...ShimmerState
  };

  const newProps = {
    ...userProps,
    ...pressable.props,
    onKeyUp
  };

  return [newProps, newState];
}

export const Shimmer = compose<IShimmerType>({
  displayName: ShimmerName,
  settings,
  usePrepareProps: (userProps: IShimmerProps, useStyling: IUseComposeStyling<IShimmerType>): IShimmerRenderData => {
    const { content, ...rest } = userProps;

    const [ShimmerProps, ShimmerState] = useAsShimmer(rest);

    const info = { content: !!content };

    const ShimmerRef = useViewCommandFocus(userProps.componentRef);

    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => ShimmerState[override] || userProps[override]);

    // create the merged slot props
    const slotProps = mergeSettings<IShimmerSlotProps>(styleProps, {
      root: { ...ShimmerProps, ref: ShimmerRef },
      content: { children: content }
    });

    return { slotProps, state: { ...ShimmerState, ...info } };
  },
  render: (Slots: ISlots<IShimmerSlotProps>, renderData: IShimmerRenderData, ...children: React.ReactNode[]) => {
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
    root: View,
    content: Text
  },
  styles: {
    root: [],
    content: [foregroundColorTokens, textTokens]
  }
});

export default Shimmer;
