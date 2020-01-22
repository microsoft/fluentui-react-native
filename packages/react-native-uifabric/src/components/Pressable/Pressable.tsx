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

import { atomic, IDefineUseStyling } from '@uifabricshared/foundation-composable';
import { ViewWin32 } from '@office-iss/react-native-win32';
import { IPressableProps } from './Pressable.props';
import { mergeSettings, ISlotProps } from '@uifabricshared/foundation-settings';
import { useAsPressable } from '../../hooks';

export const Pressable = atomic<IPressableProps>(
  ViewWin32,
  (userProps: IPressableProps, useStyling: IDefineUseStyling<IPressableProps, ISlotProps<IPressableProps>>) => {
    const { renderStyle, ...rest } = userProps;
    const { props, state } = useAsPressable(rest);
    const styleProps = useStyling(props);
    renderStyle && (props.style = renderStyle(state));
    return {
      slotProps: mergeSettings<ISlotProps<IPressableProps>>(styleProps, { root: props }),
      state: { state }
    };
  }
);

export default Pressable;
