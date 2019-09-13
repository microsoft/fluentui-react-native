import {
  IComponentSettings,
  mergeSettings,
  IOverrideLookup,
  getActiveOverrides,
  resolveSettingsOverrides
} from '@uifabric/foundation-settings';
import { IGetSettingsFromTheme, ISettingsEntry } from './CustomSettings.types';

export function getThemedSettings<TSettings extends IComponentSettings, TTheme>(
  customSettings: ISettingsEntry<TSettings, TTheme>[],
  theme: TTheme,
  cache: object,
  key: string,
  lookup?: IGetSettingsFromTheme<TSettings, TTheme>
): TSettings | undefined {
  if (!cache[key] && customSettings && customSettings.length > 0) {
    cache[key] = mergeSettings(
      ...customSettings.map(entry => {
        if (typeof entry === 'string') {
          return (lookup && lookup(theme, entry)) || undefined;
        } else if (typeof entry === 'function') {
          return entry(theme);
        }
        return entry;
      })
    );
  }
  return cache[key];
}

export function getCachedResolvedSettings<TSettings extends IComponentSettings, TTheme>(
  customSettings: ISettingsEntry<TSettings, TTheme>[],
  theme: TTheme,
  cache: object,
  key: string,
  hasOverride?: IOverrideLookup,
  lookup?: IGetSettingsFromTheme<TSettings, TTheme>
): { settings: TSettings | undefined; key: string } {
  key = key || '_base';
  let settings = getThemedSettings(customSettings, theme, cache, key, lookup);
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
