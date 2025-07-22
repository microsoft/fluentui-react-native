import type { GetMemoValue } from '@fluentui-react-native/framework-base';
import type { IComponentSettings, IOverrideLookup } from '@uifabricshared/foundation-settings';
import { mergeSettings, getActiveOverrides, resolveSettingsOverrides } from '@uifabricshared/foundation-settings';

import type { IGetSettingsFromTheme, ISettingsEntry } from './CustomSettings.types';

/**
 * Merges the various settings for a component together
 * @param customSettings - the array of settings to apply for this object
 * @param theme - the theme to use for value lookups and component definitions
 * @param getFromTheme - helper function to retrieve settings from a theme
 */
export function mergeBaseSettings<TSettings extends IComponentSettings, TTheme>(
  customSettings: ISettingsEntry<TSettings, TTheme>[],
  theme: TTheme,
  getFromTheme?: IGetSettingsFromTheme<TSettings, TTheme>,
): TSettings {
  return customSettings
    ? mergeSettings(
        ...customSettings.map((entry) => {
          if (typeof entry === 'string') {
            return (getFromTheme && getFromTheme(theme, entry)) || undefined;
          } else if (typeof entry === 'function') {
            return entry(theme);
          }
          return entry;
        }),
      )
    : undefined;
}

/**
 * Resolve the stack of settings, applying any applicable overrides, while caching the results.  Also returns the cache key
 * so it can be used as a prefix for additional caching layers
 *
 * @param customSettings - array of settings entries to merge
 * @param theme - theme used to look up named settings
 * @param memoValue - a GetMemoValue function to use as the root of caching
 * @param hasOverride - override lookup type for looking up whether an override should be applied to the settings
 * @param getFromTheme - routine to look up the named entries in the theme.  They will be skipped if not specified.
 */
export function getThemedSettings<TSettings extends IComponentSettings, TTheme>(
  customSettings: ISettingsEntry<TSettings, TTheme>[],
  theme: TTheme,
  memoValue: GetMemoValue,
  hasOverride?: IOverrideLookup,
  getFromTheme?: IGetSettingsFromTheme<TSettings, TTheme>,
): { settings: TSettings | undefined; getMemoValue: GetMemoValue } {
  // resolve the settings for this component, keyed on the theme
  let [settings, getMemoValue] = memoValue(() => mergeBaseSettings(customSettings, theme, getFromTheme), [theme]);

  // if overrides are set, resolve the override settings, keyed on the applied overrides
  const overrides = getActiveOverrides(settings, hasOverride);
  if (overrides.length > 0) {
    [settings, getMemoValue] = getMemoValue(() => resolveSettingsOverrides(settings, hasOverride) as TSettings, overrides);
  }

  // return the merged settings and a query routine to go deeper in the cache
  return { settings, getMemoValue };
}
