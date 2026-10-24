import { immutableMerge } from '@fluentui-react-native/framework-base';

import type { PartialTheme, Theme } from './types/Theme.types';

export function mergeTheme<TTheme extends Theme, TPartial extends PartialTheme>(base: TTheme, partial: TPartial): TTheme {
  return immutableMerge(base, partial as unknown as TTheme);
}
