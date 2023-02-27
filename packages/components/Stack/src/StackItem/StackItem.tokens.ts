import type { ViewStyle, ViewProps } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import { styleFunction } from '@uifabricshared/foundation-tokens';

import type { IStackItemTokens } from './StackItem.types';

const alignMap: { [key: string]: ViewStyle['alignSelf'] } = {
  start: 'flex-start',
  end: 'flex-end',
};

const _keyProps: (keyof IStackItemTokens)[] = ['align', 'disableShrink', 'grow', 'margin', 'shrink', 'verticalFill'];

export function _processor(tokenProps: IStackItemTokens): ViewProps {
  const { grow, shrink, disableShrink, align, verticalFill, margin } = tokenProps;

  return {
    style: {
      margin,
      height: verticalFill ? '100%' : 'auto',
      flexShrink: disableShrink || (!grow && !shrink) ? 0 : 1,
      flexGrow: typeof grow === 'number' ? grow : grow ? 1 : undefined,
      alignSelf: (align && alignMap[align]) || undefined,
    },
  };
}

export const stackItemTokenProcessor = styleFunction<ViewProps, IStackItemTokens, Theme>(_processor, _keyProps);
