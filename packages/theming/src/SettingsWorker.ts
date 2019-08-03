import { ITheme } from './Theme.types';
import { ISettingsWorker, ISettingsWithKey, IStyleValueFinalizers } from './SettingsWorker.types';
import {
  IComponentSettings,
  IComponentSettingsCollection,
  IOverrideLookup,
  resolveSettingsOverrides,
  mergeAndFinalizeSettings,
  getParentSettingsChain
} from '@uifabric/theme-settings';
import { IFinalizeStyle } from '@uifabric/theme-settings';

/** key used to store the style cache in the theme */
const _styleCacheKey = Symbol('__styleCache');

/**
 * Create a style worker for this particular type of theme.  The style worker helps with getting styles
 * and layers from the theme.  It also appends a caching layer to the theme to allow styles to be
 * obtained efficiently.
 *
 * @param finalizers - a set of finalizers to register at the time of creation.  This is equivalent to
 * calling addValueFinalizers on the worker after it is returned
 */
export function createSettingsWorker(finalizers?: IStyleValueFinalizers): ISettingsWorker {
  const _finalizers = {};

  // set up the object to be returned
  const styleWorker: ISettingsWorker = {
    /**
     * Resolve, flatten, finalize a layer into the settings format then cache it based on the name + overrides
     * key.  If already resolved this will return the previously resolved settings block.  Note that if a
     * layer is passed in instead of a name this will not cache, it will simply apply the resolution and
     * lookup process to that layer
     */
    getSettings: (theme: ITheme, target: string | IComponentSettings, overrides?: IOverrideLookup) => {
      return _getSettingsFromTheme(theme, target as string, _finalizers, overrides);
    },

    /**
     * This resolves overrides if specified, finalizes and flattens styles, then returns the settings as the simpler slotProps type
     */
    resolveSettings: (theme: ITheme, target: IComponentSettings, overrides?: IOverrideLookup) => {
      return returnAsSlotProps(_resolveNonThemeSettings(theme, target, _finalizers, overrides));
    },

    /**
     * Finalizes settings
     */
    finalizeSettings: (theme: ITheme, settings: IComponentSettings) => {
      return mergeAndFinalizeSettings(_finalizeStyle(theme, _finalizers), settings);
    },

    /**
     * Add additional finalizers to the StyleWorker.  These are additive and can't be removed, they are
     * associated with keys so adding a new finalizer for an existing key will replace the previous entry
     */
    addValueFinalizers: (extraFinalizers: IStyleValueFinalizers) => {
      Object.assign(_finalizers, extraFinalizers);
    }
  };

  // finally add in any additional finalizers passed in by the caller
  if (finalizers) {
    styleWorker.addValueFinalizers(finalizers);
  }
  return styleWorker;
}

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
function _resolveNonThemeSettings(
  theme: ITheme,
  target: IComponentSettings,
  finalizers: IStyleValueFinalizers,
  overrides?: IOverrideLookup
): IComponentSettings {
  const mergedAndFinalized = mergeAndFinalizeSettings(_finalizeStyle(theme, finalizers), ...getParentSettingsChain(theme.settings, target));
  return resolveSettingsOverrides(mergedAndFinalized, overrides);
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
function _buildCacheableThemeSettings(
  theme: ITheme,
  target: string | IComponentSettings,
  finalizers: IStyleValueFinalizers,
  overrides?: IOverrideLookup
): IComponentSettings {
  if (typeof target === 'string') {
    // this means we are building the base settings with no overrides applied
    const setToMerge = getParentSettingsChain(theme.settings, target);
    // apply the finalizers as part of the merge.  This will recurse to overrides which means that there
    // is no need to finalize again when overrides are applied
    return mergeAndFinalizeSettings(_finalizeStyle(theme, finalizers), ...setToMerge);
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
  finalizers: IStyleValueFinalizers,
  overrides?: IOverrideLookup
): IComponentSettings {
  // get the style cache from the theme, ensuring it exists in the process
  let styleCache: IComponentSettingsCollection = theme[_styleCacheKey];
  if (!styleCache) {
    theme[_styleCacheKey] = styleCache = {};
  }

  // if this entry is not in the style cache already go through the full resolution logic
  if (!styleCache[styleKey]) {
    styleCache[styleKey] = _buildCacheableThemeSettings(theme, target, finalizers, overrides);
  }

  return styleCache[styleKey];
}

/**
 * try to get settings from the theme, ensuring things are cached and minimizing the amount of
 * recomputing that needs to be done
 */
function _getSettingsFromTheme(
  theme: ITheme,
  name: string,
  finalizers: IStyleValueFinalizers,
  overrides?: IOverrideLookup
): ISettingsWithKey {
  let settings = _findOrCreateSettings(theme, name, name, finalizers);
  let styleKey = name;
  if (overrides && settings) {
    styleKey = getOverrideKey(name, settings._precedence || [], overrides);
    if (styleKey !== name) {
      settings = _findOrCreateSettings(theme, settings, styleKey, finalizers, overrides);
    }
  }
  return { settings, styleKey };
}

function _finalizeStyle(theme: ITheme, finalizers: IStyleValueFinalizers): IFinalizeStyle {
  return (style: object) => {
    const updated = {};
    Object.keys(style).forEach((key: string) => {
      if (finalizers[key]) {
        finalizers[key](theme, style, key, updated);
      }
    });
    return updated;
  };
}

/**
 * A finalizer that will simply strip a key from a style if it is found
 */
export function stripKey(_theme: ITheme, style: object, key: string, target: object): void {
  if (style.hasOwnProperty(key)) {
    target[key] = undefined;
  }
}

export function finalizeSemanticValue<TContainer>(container: TContainer, style: object, key: string, target: object): void {
  const value = style[key];
  if (value && container[value]) {
    target[key] = container[value];
  }
}

/**
 * Replace a color value with a value from the palette if it resolves
 */
export function finalizeColor(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.palette, style, key, target);
}

/**
 * Update font family with a semantic value if it resolves
 */
export function finalizeFontFamily(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.typography.families, style, key, target);
}

/**
 * Update the font size with a semantic value if it resolves
 */
export function finalizeFontSize(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.typography.sizes, style, key, target);
}

/**
 * Update the font weight with a semantic value if it resolves
 */
export function finalizeFontWeight(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.typography.weights, style, key, target);
}
