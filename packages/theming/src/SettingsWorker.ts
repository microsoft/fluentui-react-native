import { ITheme } from './Theme.types';
import { ISettingsWorker, ISettingsWithKey } from './SettingsWorker.types';
import { IStyleValueFinalizers } from './Styles.types';
import { IComponentSettings, IComponentSettingsCollection } from './Settings.types';
import { resolveSettingsOverrides, mergeAndFinalizeSettings, getParentSettingsChain } from './Settings';

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
    getSettings: (theme: ITheme, target: string | IComponentSettings, overrides?: object) => {
      return _getSettingsFromTheme(theme, target as string, _finalizers, overrides);
    },

    resolveSettings: (theme: ITheme, target: IComponentSettings, overrides?: object) => {
      return _returnAsSlotProps(_resolveNonThemeSettings(theme, target, _finalizers, overrides));
    },

    /**
     * Finalizes settings
     */
    finalizeSettings: (theme: ITheme, settings: IComponentSettings) => {
      return mergeAndFinalizeSettings(theme, _finalizers, settings);
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
function _returnAsSlotProps(target: IComponentSettings): IComponentSettings {
  const { _overrides, _parent, _precedence, ...settings } = target;
  return settings;
}

/**
 * resolve the parents and overrides of a settings that is not part of the theme against the current theme
 */
function _resolveNonThemeSettings(
  theme: ITheme,
  target: IComponentSettings,
  finalizers: IStyleValueFinalizers,
  overrides?: object
): IComponentSettings {
  const mergedAndFinalized = mergeAndFinalizeSettings(theme, finalizers, ...getParentSettingsChain(theme.settings, target));
  return resolveSettingsOverrides(mergedAndFinalized, overrides);
}

/**
 * get a key to use for cache lookups for this settings entry
 *
 * @param name - name of the settings entry in the theme
 * @param precedence - ordered precedence of which overrides to apply
 * @param overrides - lookup object for testing whether an override should be applied
 */
function _getStyleKey(name: string, precedence: string[], overrides: object): string {
  return [name]
    .concat(precedence || [])
    .filter((val: string) => {
      return overrides[val];
    })
    .join('-');
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
  overrides?: object
): IComponentSettings {
  if (typeof target === 'string') {
    // this means we are building the base settings with no overrides applied
    const setToMerge = getParentSettingsChain(theme.settings, target);
    // apply the finalizers as part of the merge.  This will recurse to overrides which means that there
    // is no need to finalize again when overrides are applied
    return mergeAndFinalizeSettings(theme, finalizers, ...setToMerge);
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
  overrides?: object
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
function _getSettingsFromTheme(theme: ITheme, name: string, finalizers: IStyleValueFinalizers, overrides?: object): ISettingsWithKey {
  let settings = _findOrCreateSettings(theme, name, name, finalizers);
  let styleKey = name;
  if (overrides && settings) {
    styleKey = _getStyleKey(name, settings._precedence || [], overrides);
    if (styleKey !== name) {
      settings = _findOrCreateSettings(theme, settings, styleKey, finalizers, overrides);
    }
  }
  return { settings: _returnAsSlotProps(settings), styleKey };
}
