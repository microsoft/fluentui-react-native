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

import { atomic, IUseStyling } from '@uifabric/foundation-composable';
import { IPressableProps } from './Pressable.props';
import { useAsPressable } from './useAsPressable';
import { mergeSettings } from '@uifabric/foundation-settings';

export const Pressable = atomic<IPressableProps>('div', (userProps: IPressableProps, useStyling: IUseStyling<IPressableProps>) => {
  const { props, state, setState } = useAsPressable(userProps);
  const styleProps = useStyling(props);
  return {
    slotProps: mergeSettings(styleProps, { root: props }),
    state: { state, setState }
  };
});

export default Pressable;
