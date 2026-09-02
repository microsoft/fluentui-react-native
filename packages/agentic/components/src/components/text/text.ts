/** @jsxImportSource @fluentui-react-native/framework-base */
import { phasedComponent } from '@fluentui-react-native/framework-base';

import { renderText_unstable } from './renderText';
import type { TextProps } from './text.types';
import { useText_unstable } from './useText';
import { useTextStyles_unstable } from './useTextStyles';

export const Text = phasedComponent<TextProps>((props) => {
  const state = useText_unstable(props);

  useTextStyles_unstable(state);

  return renderText_unstable(state);
});

Text.displayName = 'Text';

export default Text;
