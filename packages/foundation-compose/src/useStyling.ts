import * as React from 'react';
import { ISlotProps, IComponentSettings, IOverrideLookup } from '@uifabricshared/foundation-settings';
import { getThemedSettings } from '@uifabricshared/themed-settings';
import { ITheme, getSettings, returnAsSlotProps } from '@uifabricshared/theming-ramp';
import { IComponentTokens, processTokens, ITargetHasToken, buildComponentTokens } from '@uifabricshared/foundation-tokens';
import { getTheme, ThemeContext } from '@uifabricshared/theming-react-native';
import { IWithComposable, AsObject } from '@uifabricshared/foundation-composable';
import { IComposeOptions, IStylingSettings, IDefineUseComposeStyling, IWithTokens } from './compose.types';

/* tslint:disable-next-line no-any */
export function getOptionsFromObj<TComponent>(obj: any): TComponent | undefined {
  const objType = obj && typeof obj;
  return ((objType === 'object' || objType === 'function') && (obj as IWithComposable<object, TComponent>).__composable) || undefined;
}

/**
 * Get the cache for the given component from the theme, creating it if necessary
 *
 * @param component - component to get the cache for, the component object itself will store the unique symbol for its lookups
 * @param theme - theme where the cache will be stored
 */
function _getComponentCache(cacheKey: symbol, theme: ITheme): { [key: string]: ISlotProps } {
  theme[cacheKey] = theme[cacheKey] || {};
  return theme[cacheKey];
}

function _getSettingsFromTheme(theme: ITheme, name: string): IComponentSettings {
  return getSettings(theme, name);
}

function _getHasToken<TProps, TSlotProps extends ISlotProps, TTokens extends object>(
  slots: IStylingSettings<TSlotProps, TTokens>['slots']
): ITargetHasToken {
  const slotTokens: { [key: string]: IComponentTokens<TSlotProps, TTokens, ITheme>['tokenKeys'] | undefined } = {};
  Object.keys(slots).forEach(slot => {
    const options = <IComposeOptions<AsObject<TProps>, TSlotProps>>getOptionsFromObj(slots[slot].slotType);
    slotTokens[slot] = (options && options.resolvedTokens && options.resolvedTokens.tokenKeys) || undefined;
  });
  return (target: string, key: string) => {
    return slotTokens[target] && slotTokens[target].hasOwnProperty(key);
  };
}

function _nameFromSettings<TSlotProps extends ISlotProps, TTokens extends object>(
  styleSettings: IStylingSettings<TSlotProps, TTokens>
): string | undefined {
  const settings = styleSettings.settings;
  const names: string[] = settings.filter(v => typeof v === 'string').map(v => v as string);
  return names && names.length > 0 ? names.join('-') : undefined;
}

function useStylingCore<TProps, TSlotProps extends ISlotProps, TTokens extends object>(
  props: TProps,
  options: IStylingSettings<TSlotProps, TTokens>,
  baseKey: string,
  tokenCacheKey: symbol,
  lookupOverride?: IOverrideLookup
): IWithTokens<TSlotProps, TTokens> {
  // get the theme value from the context (or the default theme if it is not set)
  const theme = React.useContext(ThemeContext) || getTheme();
  // get the cache for this component from the theme
  const cache = _getComponentCache(tokenCacheKey, theme);

  // resolve the array of settings for these options
  lookupOverride = lookupOverride || props;
  const { settings, key } = getThemedSettings<IComponentSettings<IWithTokens<TSlotProps, TTokens>>, ITheme>(
    options.settings,
    theme,
    cache,
    baseKey,
    lookupOverride,
    _getSettingsFromTheme as any
  );

  // finish by processing the tokens and turning IComponentSettings into ISlotProps (this removes things like _overrides)
  return returnAsSlotProps(
    processTokens<TSlotProps, TTokens, ITheme>((props as unknown) as TTokens, theme, settings as any, options.resolvedTokens, key, cache)
  ) as IWithTokens<TSlotProps, TTokens>;
}

/**
 * return a useStyling implementation, in the form of IUseComposeStyling, based on the passed in styleSettings.  The
 * styleSettings will be captured in the created closure and will be set up to enable the appropriate levels of caching.
 *
 * @param styleSettings - style settings to configure this function.  Note that this should be scoped to a single component.
 * @param name - optional base name to use as a cache key
 */
export function initializeStyling<TProps, TSlotProps extends ISlotProps, TTokens extends object>(
  styleSettings: IStylingSettings<TSlotProps, TTokens>,
  name?: string
): IDefineUseComposeStyling<TProps, TSlotProps, TTokens> {
  // process the tokens and get them ready to render
  const slots = styleSettings.slots;
  styleSettings.resolvedTokens = buildComponentTokens<TSlotProps, TTokens, ITheme>(slots, _getHasToken(slots));

  // ensure we have a name to use for caching.  Try to pull something identifiable to help with debugging
  name = name || _nameFromSettings(styleSettings) || 'anonymous';
  const tokenCacheKey = Symbol(name);

  // create a useStyling implementation for this component type (per type, not per instance)
  return (props: TProps, lookupOverride?: IOverrideLookup) => {
    return useStylingCore<TProps, TSlotProps, TTokens>(props, styleSettings, name, tokenCacheKey, lookupOverride);
  };
}
