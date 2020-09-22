import { immutableMerge } from '@fluentui-react-native/immutable-merge';
import { Theme, PartialTheme } from '@fluentui-react-native/theme-types';

export function mergeTheme<TTheme extends Theme, TPartial extends PartialTheme>(base: TTheme, partial: TPartial): TTheme {
  return immutableMerge(base, (partial as unknown) as TTheme);
}
