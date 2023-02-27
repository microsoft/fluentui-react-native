/**
 * This is primarily a fork of React Native's Touchable Mixin.
 * It has been repurposed as it's own standalone control for win32,
 * as it needs to support a richer set of functionality on the desktop.
 * The touchable variants can be rewritten as wrappers around TouchableWin32
 * by passing the correct set of props down and managing state correctly.
 *
 * React Native's Touchable.js file (https://github.com/facebook/react-native/blob/master/Libraries/Components/Touchable/Touchable.js)
 * provides an overview over how touchables work and interact with the gesture responder system.
 */
'use strict';

import { View } from 'react-native';

import { useAsPressable } from '@fluentui-react-native/interactive-hooks';
import type { IUseStyling } from '@uifabricshared/foundation-composable';
import { composable } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import type { IPressableProps, IPressableType } from './Pressable.props';

export const Pressable = composable<IPressableType>({
  slots: { root: View },
  usePrepareProps: (userProps: IPressableProps, useStyling: IUseStyling<IPressableType>) => {
    const { renderStyle, ...rest } = userProps;
    const { props, state } = useAsPressable(rest);
    const styleProps = useStyling(props);
    renderStyle && (props.style = renderStyle(state));
    return {
      slotProps: mergeSettings<IPressableType['slotProps']>(styleProps, { root: props }),
      state: { state },
    };
  },
});

export default Pressable;
