import { Text as NativeText } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useSlot } from '@fluentui-react-native/framework-base';

import type { TextProps, TextState } from './text.types';

export function useText_unstable(props: TextProps): TextState {
  const { ref, style: userStyle, ...nativeProps } = props;
  const root = useSlot(NativeText, { ...nativeProps, ref });

  return {
    root,
    userStyle,
    ...useThemeState(),
  };
}
