import {
  IComponentSettings,
  mergeSettings,
  IOverrideLookup,
  getActiveOverrides,
  resolveSettingsOverrides
} from '@uifabricshared/foundation-settings';
import { IGetSettingsFromTheme, ISettingsEntry } from './CustomSettings.types';

const _baseKey = '_base';

/**
 * Resolve the stack of settings but do not apply any overrides.  This should only calculate once for a given
 * theme
 *
 * @param customSettings - array of settings entries to merge
 * @param theme - theme to use for named settings retrieval
 * @param cache - object to use as a cache, should be component specific
 * @param key - key to use for the base cache info
 * @param getFromTheme - routine to look up the named entries in the theme.  They will be skipped if this is not specified
 */
export function getBaseThemedSettings<TSettings extends IComponentSettings, TTheme>(
  customSettings: ISettingsEntry<TSettings, TTheme>[],
  theme: TTheme,
  cache: object,
  key: string,
  getFromTheme?: IGetSettingsFromTheme<TSettings, TTheme>
): TSettings | undefined {
  key = key || _baseKey;
  if (!cache[key] && customSettings && customSettings.length > 0) {
    cache[key] = mergeSettings(
      ...customSettings.map(entry => {
        if (typeof entry === 'string') {
          return (getFromTheme && getFromTheme(theme, entry)) || undefined;
        } else if (typeof entry === 'function') {
          return entry(theme);
        }
        return entry;
      })
    );
  }
  return cache[key];
}

/**
 * Resolve the stack of settings, applying any applicable overrides, while caching the results.  Also returns the cache key
 * so it can be used as a prefix for additional caching layers
 *
 * @param customSettings - array of settings entries to merge
 * @param theme - theme used to look up named settings
 * @param cache - object to use as a cache, should be component specific
 * @param key - starting key for the cache entry
 * @param hasOverride - override lookup type for looking up whether an override should be applied to the settings
 * @param getFromTheme - routine to look up the named entries in the theme.  They will be skipped if not specified.
 */
export function getThemedSettings<TSettings extends IComponentSettings, TTheme>(
  customSettings: ISettingsEntry<TSettings, TTheme>[],
  theme: TTheme,
  cache: object,
  key: string,
  hasOverride?: IOverrideLookup,
  getFromTheme?: IGetSettingsFromTheme<TSettings, TTheme>
): { settings: TSettings | undefined; key: string } {
  key = key || _baseKey;
  let settings = getBaseThemedSettings(customSettings, theme, cache, key, getFromTheme);
  const overrides = getActiveOverrides(settings, hasOverride);
  if (overrides && overrides.length > 0) {
    key = key + '-' + overrides.join('-');
    if (!cache[key]) {
      cache[key] = resolveSettingsOverrides(settings, hasOverride) as TSettings;
    }
    settings = cache[key];
  }
  return { settings, key };
}
