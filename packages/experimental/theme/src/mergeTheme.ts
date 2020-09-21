import { immutableMerge } from '@fluentui-react-native/immutable-merge';
import { ITheme, IPartialTheme } from '@fluentui-react-native/theme-types';

export function mergeTheme<TTheme extends ITheme, TPartial extends IPartialTheme>(base: TTheme, partial: TPartial): TTheme {
  return immutableMerge(base, (partial as unknown) as TTheme);
}
