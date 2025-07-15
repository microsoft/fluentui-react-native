import { immutableMerge } from '@fluentui-react-native/framework-base/immutable-merge';
import type { Theme, PartialTheme } from '@fluentui-react-native/theme-types';

export function mergeTheme<TTheme extends Theme, TPartial extends PartialTheme>(base: TTheme, partial: TPartial): TTheme {
  return immutableMerge(base, partial as unknown as TTheme);
}
