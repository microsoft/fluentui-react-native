/* eslint-disable */

import { Theme, PartialTheme } from '@fluentui-react-native/theme-types';
import { mergeSettingsCollection } from '@uifabricshared/foundation-settings';
import { MergeOptions, immutableMergeCore } from '@fluentui-react-native/framework-base';

function _settingsHandler(...objs: (object | undefined)[]): object | undefined {
  return mergeSettingsCollection(...objs);
}

const _themeMergeOptions: MergeOptions = {
  object: true,
  settings: _settingsHandler,
};

/**
 * Resolve `partialTheme` into a fully specified theme, using `theme` to fill
 * in any missing values.
 */
export function resolvePartialTheme(theme: Theme, partialTheme?: PartialTheme): Theme {
  let newTheme = immutableMergeCore(_themeMergeOptions, theme, partialTheme) as Theme;
  if (newTheme === theme) {
    newTheme = { ...newTheme };
  }
  return newTheme;
}
