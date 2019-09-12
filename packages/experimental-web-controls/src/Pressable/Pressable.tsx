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

import { compose } from '@uifabric/foundation-compose';
import { IPressableComponent, IPressableRenderData } from './Pressable.props';
import { mergeSettings } from '@uifabric/foundation-settings';
import { useWebPressable } from './useAsPressable';

function finalizer(renderData: IPressableRenderData): IPressableRenderData {
  const { state, props } = renderData;
  const extraStyle = props.renderStyle ? props.renderStyle(state.state) : {};
  renderData.slotProps = mergeSettings(renderData.slotProps, { root: renderData.props }, { root: { style: extraStyle } });
  return renderData;
}

export const Pressable = compose<IPressableComponent>({
  className: 'RNFPressable',
  usePrepareState: useWebPressable,
  finalizer,
  slots: {
    root: { slotType: 'div' }
  }
});

export default Pressable;
