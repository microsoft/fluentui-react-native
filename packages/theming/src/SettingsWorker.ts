import { ITheme } from './Theme.types';
import {
  IComponentSettings,
  IComponentSettingsCollection,
  IOverrideLookup,
  resolveSettingsOverrides,
  getParentSettingsChain,
  mergeSettings
} from '@uifabric/foundation-settings';

interface ISettingsWithKey {
  settings: IComponentSettings;
  styleKey: string;
}

/** key used to store the style cache in the theme */
const _styleCacheKey = Symbol('__styleCache');

/** helper to strip out the component settings specific bits from the returned structure */
export function returnAsSlotProps(target: IComponentSettings): IComponentSettings {
  if (target) {
    const { _overrides, _parent, _precedence, ...settings } = target;
    return settings;
  }
  return target;
}

/**
 * resolve the parents and overrides of a settings that is not part of the theme against the current theme
 */
export function resolveSettings(theme: ITheme, target: IComponentSettings, overrides?: IOverrideLookup): IComponentSettings {
  const mergedAndFinalized = mergeSettings(...getParentSettingsChain(theme.settings, target));
  return returnAsSlotProps(resolveSettingsOverrides(mergedAndFinalized, overrides));
}

/**
 * get a key to use for cache lookups for this settings entry
 *
 * @param name - name of the settings entry in the theme
 * @param precedence - ordered precedence of which overrides to apply
 * @param overrides - lookup object for testing whether an override should be applied
 */
export function getOverrideKey(name: string, precedence: string[], overrides: IOverrideLookup): string {
  const overrideKey = (precedence && precedence.filter(val => overrides[val]).join('-')) || undefined;
  return overrideKey ? name + '-' + overrideKey : name;
}

/**
 * build the settings to cache with as few extra operations as possible.  If the target is a name
 * this is assumed to be the root entry with no overrides applied.
 *
 * If the target is an object then this will simply apply overrides
 */
function _buildCacheableThemeSettings(theme: ITheme, target: string | IComponentSettings, overrides?: IOverrideLookup): IComponentSettings {
  if (typeof target === 'string') {
    // this means we are building the base settings with no overrides applied
    const setToMerge = getParentSettingsChain(theme.settings, target);
    // apply the finalizers as part of the merge.  This will recurse to overrides which means that there
    // is no need to finalize again when overrides are applied
    return mergeSettings(...setToMerge);
  }
  // this is just doing override application so do that now
  return resolveSettingsOverrides(target, overrides);
}

/**
 * Try to look the settings up in the theme, create the settings if it was not found
 */
function _findOrCreateSettings(
  theme: ITheme,
  target: string | IComponentSettings,
  styleKey: string,
  overrides?: IOverrideLookup
): IComponentSettings {
  // get the style cache from the theme, ensuring it exists in the process
  let styleCache: IComponentSettingsCollection = theme[_styleCacheKey];
  if (!styleCache) {
    theme[_styleCacheKey] = styleCache = {};
  }

  // if this entry is not in the style cache already go through the full resolution logic
  if (!styleCache[styleKey]) {
    styleCache[styleKey] = _buildCacheableThemeSettings(theme, target, overrides);
  }

  return styleCache[styleKey];
}

/**
 *
 * @param theme - theme used to retrieve settings
 * @param name - name of the settings entry to retrieve
 * @param overrides - optional override lookup object to conditionally apply overrides
 */
export function getSettings(theme: ITheme, name: string, overrides?: IOverrideLookup): ISettingsWithKey {
  let settings = _findOrCreateSettings(theme, name, name);
  let styleKey = name;
  if (overrides && settings) {
    styleKey = getOverrideKey(name, settings._precedence || [], overrides);
    if (styleKey !== name) {
      settings = _findOrCreateSettings(theme, settings, styleKey, overrides);
    }
  }
  return { settings, styleKey };
}
