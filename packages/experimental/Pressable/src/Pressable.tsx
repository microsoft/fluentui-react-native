/** @jsx withSlots */
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

import { View, ViewProps } from 'react-native';
import { PressableProps, PressableType } from './Pressable.props';
import { useAsPressable } from '@fluentui-react-native/interactive-hooks';
import { compose, withSlots, UseSlots, mergeProps } from '@fluentui-react-native/experimental-framework';

export const Pressable = compose<PressableType>({
  slots: { root: View },
  render: (userProps: PressableProps, useSlots: UseSlots<PressableType>) => {
    const { renderStyle, ...rest } = userProps;
    const { props, state } = useAsPressable(rest);
    const Root = useSlots(props).root;
    const mixin = renderStyle ?? { style: renderStyle(state) };
    return (finalProps: PressableProps) => <Root {...mergeProps(props, mixin as ViewProps, finalProps)} />;
  }
})

export default Pressable;
