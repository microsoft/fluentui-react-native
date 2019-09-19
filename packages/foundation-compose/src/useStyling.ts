import * as React from 'react';
import { ISlotProps, IComponentSettings, IOverrideLookup } from '@uifabric/foundation-settings';
import { ISettingsEntry, getThemedSettings } from '@uifabric/custom-settings';
import { ITheme, getSettings, returnAsSlotProps } from '@uifabric/theming';
import { ISlotStyleFactories, IComponentTokens, processTokens, ITargetHasToken, buildComponentTokens } from '@uifabric/foundation-tokens';
import { getTheme, ThemeContext } from '@uifabric/theming-react-native';
import { ISlotWithFilter, IWithComposable } from '@uifabric/foundation-composable';
import { IComponent } from './Component.types';

export type IUseOpinionatedStyling<TProps extends object, TSlotProps extends ISlotProps<TProps> = ISlotProps<TProps>> = (
  props: TProps,
  lookup?: IOverrideLookup
) => TSlotProps;

export interface IStylingSettings<TProps extends object, TSlotProps extends ISlotProps<TProps>> {
  /**
   * slots of IComposable with added style factory options
   */
  slots: { [K in keyof TSlotProps]: ISlotWithFilter<ISlotStyleFactories<TProps, ITheme>> };

  /**
   * settings used to build up the style definitions
   */
  settings?: ISettingsEntry<IComponentSettings<TSlotProps>, ITheme>[];

  /**
   * The input tokens processed, built into functions, with the keys built into a map.
   * -- Set Automatically
   */
  resolvedTokens?: IComponentTokens<TProps, ITheme>;
}

function _getHasToken<TProps extends object, TSlotProps extends ISlotProps<TProps>>(
  slots: IStylingSettings<TProps, TSlotProps>['slots']
): ITargetHasToken {
  const slotTokens: { [key: string]: IComponentTokens<TProps, ITheme>['tokenKeys'] | undefined } = {};
  Object.keys(slots).forEach(slot => {
    const options = getOptionsFromObj(slots[slot].slotType);
    slotTokens[slot] = (options && options.resolvedTokens && options.resolvedTokens.tokenKeys) || undefined;
  });
  return (target: string, key: string) => {
    return slotTokens[target] && slotTokens[target].hasOwnProperty(key);
  };
}

function _nameFromSettings<TProps extends object, TSlotProps extends ISlotProps<TProps>>(
  styleSettings: IStylingSettings<TProps, TSlotProps>
): string | undefined {
  const settings = styleSettings.settings;
  const names: string[] = settings.filter(v => typeof v === 'string').map(v => v as string);
  return names && names.length > 0 ? names.join('-') : undefined;
}

/* tslint:disable-next-line no-any */
export function getOptionsFromObj<TComponent extends IComponent = IComponent>(obj: any): TComponent | undefined {
  const objType = obj && typeof obj;
  return ((objType === 'object' || objType === 'function') && (obj as IWithComposable<object, TComponent>).__composable) || undefined;
}

export function initializeStyling<TProps extends object, TSlotProps extends ISlotProps<TProps>>(
  styleSettings: IStylingSettings<TProps, TSlotProps>,
  name?: string
): IUseOpinionatedStyling<TProps, TSlotProps> {
  // process the tokens and get them ready to render
  const slots = styleSettings.slots;
  styleSettings.resolvedTokens = buildComponentTokens<TProps, ITheme>(slots, _getHasToken(slots));

  // ensure we have a name to use for caching.  Try to pull something identifiable to help with debugging
  name = name || _nameFromSettings(styleSettings) || 'anonymous';
  const tokenCacheKey = Symbol(name);

  // create a useStyling implementation for this component type (per type, not per instance)
  return (props: TProps, lookupOverride?: IOverrideLookup) => {
    return useStylingCore(props, styleSettings, name, tokenCacheKey, lookupOverride);
  };
}

function useStylingCore<TProps extends object, TSlotProps extends ISlotProps<TProps>>(
  props: TProps,
  options: IStylingSettings<TProps, TSlotProps>,
  baseKey: string,
  tokenCacheKey: symbol,
  lookupOverride?: IOverrideLookup
): TSlotProps {
  // get the theme value from the context (or the default theme if it is not set)
  const theme = React.useContext(ThemeContext) || getTheme();
  // get the cache for this component from the theme
  const cache = _getComponentCache(tokenCacheKey, theme);

  // resolve the array of settings for these options
  lookupOverride = lookupOverride || props;
  const { settings, key } = getThemedSettings(options.settings, theme, cache, baseKey, lookupOverride, _getSettingsFromTheme);

  // finish by processing the tokens and turning IComponentSettings into ISlotProps (this removes things like _overrides)
  return returnAsSlotProps(processTokens<TProps, ITheme>(props, theme, settings, options.resolvedTokens, key, cache)) as TSlotProps;
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
  return getSettings(theme, name).settings;
}
