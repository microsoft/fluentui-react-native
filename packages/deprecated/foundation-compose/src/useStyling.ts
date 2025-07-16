/* eslint-disable */

import { ISlotProps, IComponentSettings, IOverrideLookup, IWithTokens } from '@uifabricshared/foundation-settings';
import { getThemedSettings } from '@uifabricshared/themed-settings';
import { ITheme, getSettings, returnAsSlotProps } from '@uifabricshared/theming-ramp';
import { IComponentTokens, processTokens, ITargetHasToken, buildComponentTokens } from '@uifabricshared/foundation-tokens';
import { useTheme } from '@fluentui-react-native/theme-types';
import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import { IWithComposable, AsObject, IComposableDefinition, INativeSlotType } from '@uifabricshared/foundation-composable';
import { IComposeOptions, IStylingSettings, IDefineUseComposeStyling } from './compose.types';
import { getMemoCache, GetMemoValue } from '@fluentui-react-native/framework-base/memo-cache';

/* tslint:disable-next-line no-any */
export function getOptionsFromObj<TComponent>(obj: any): TComponent | undefined {
  const objType = obj && typeof obj;
  return ((objType === 'object' || objType === 'function') && (obj as IWithComposable<object, TComponent>).__composable) || undefined;
}

function _getSettingsFromTheme(theme: ITheme, name: string): IComponentSettings {
  return getSettings(theme, name);
}

function _getHasToken<TProps, TSlotProps extends ISlotProps, TTokens extends object, TState>(
  slots: IComposableDefinition<TProps, TSlotProps, TState>['slots'],
): ITargetHasToken {
  const slotTokens: { [key: string]: IComponentTokens<TSlotProps, TTokens, ITheme>['tokenKeys'] | undefined } = {};
  Object.keys(slots).forEach((slotName) => {
    const slot = slots[slotName];
    const slotType = (typeof slot !== 'object' ? slot : slot.slotType) as INativeSlotType;
    const options = <IComposeOptions<AsObject<TProps>, TSlotProps>>getOptionsFromObj(slotType);
    slotTokens[slotName] = (options && options.resolvedTokens && options.resolvedTokens.tokenKeys) || undefined;
  });
  return (target: string, key: string) => {
    return slotTokens[target] && slotTokens[target].hasOwnProperty(key);
  };
}

function useStylingCore<TProps, TSlotProps extends ISlotProps, TTokens extends object>(
  props: TProps,
  options: IStylingSettings<TSlotProps, TTokens>,
  instanceMemoCache: GetMemoValue<TSlotProps, TSlotProps>,
  lookupOverride?: IOverrideLookup,
): IWithTokens<TSlotProps, TTokens> {
  // get the theme value from the context (or the default theme if it is not set)
  const theme = useTheme() || defaultFluentTheme;

  // resolve the array of settings for these options
  lookupOverride = lookupOverride || props;
  type ILocalSettings = IComponentSettings<IWithTokens<TSlotProps, TTokens>>;
  const { settings, getMemoValue } = getThemedSettings<ILocalSettings, ITheme>(
    options.settings,
    theme,
    instanceMemoCache as GetMemoValue<any>,
    lookupOverride,
    _getSettingsFromTheme as any,
  );

  // finish by processing the tokens and turning IComponentSettings into ISlotProps (this removes things like _overrides)
  return returnAsSlotProps(
    processTokens<TSlotProps, TTokens, ITheme>(
      props as unknown as TTokens,
      theme,
      settings as any,
      options.resolvedTokens,
      getMemoValue as GetMemoValue<any>,
    ),
  ) as IWithTokens<TSlotProps, TTokens>;
}

/**
 * return a useStyling implementation, in the form of IUseComposeStyling, based on the passed in styleSettings.  The
 * styleSettings will be captured in the created closure and will be set up to enable the appropriate levels of caching.
 *
 * @param options - style settings to configure this function.  Note that this should be scoped to a single component.
 * @param name - optional base name to use as a cache key
 */
export function initializeStyling<
  TProps extends object,
  TSlotProps extends ISlotProps,
  TTokens extends object,
  TState extends object,
  TStatics extends object,
>(options: IComposeOptions<TProps, TSlotProps, TTokens, TState, TStatics>): IDefineUseComposeStyling<TProps, TSlotProps, TTokens> {
  // process the tokens and get them ready to render
  const { styles, slots } = options;
  options.resolvedTokens = buildComponentTokens<TSlotProps, TTokens, ITheme>(styles, _getHasToken(slots));

  // memo cache root for this component, keyed on options
  const getMemoValue = getMemoCache<TSlotProps>(options);

  // create a useStyling implementation for this component type (per type, not per instance)
  return (props: TProps, lookupOverride?: IOverrideLookup) => {
    return useStylingCore<TProps, TSlotProps, TTokens>(props, options, getMemoValue, lookupOverride);
  };
}
