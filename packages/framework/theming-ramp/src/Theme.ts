import { ITheme, IPartialTheme } from './Theme.types';
import { mergeSettingsCollection } from '@uifabricshared/foundation-settings';
import { IMergeOptions, immutableMergeCore } from '@uifabricshared/immutable-merge';

function _settingsHandler(_options: IMergeOptions, ...objs: (object | undefined)[]): object | undefined {
  return mergeSettingsCollection(...objs);
}

const _themeMergeOptions: IMergeOptions = {
  depth: -1,
  recurse: {
    settings: _settingsHandler
  }
};

/**
 * Resolve `partialTheme` into a fully specified theme, using `theme` to fill
 * in any missing values.
 */
export function resolvePartialTheme(theme: ITheme, partialTheme?: IPartialTheme): ITheme {
  let newTheme = immutableMergeCore(_themeMergeOptions, theme, partialTheme) as ITheme;
  if (newTheme === theme) {
    newTheme = { ...newTheme };
  }
  return newTheme;
}
