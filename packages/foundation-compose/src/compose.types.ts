import { IRenderData, IComposableDefinition, ISlotWithFilter } from '@uifabricshared/foundation-composable';
import { ISlotProps, IComponentSettings, IOverrideLookup } from '@uifabricshared/foundation-settings';
import { ISettingsEntry } from '@uifabricshared/themed-settings';
import { ITheme } from '@uifabricshared/theming-ramp';
import { ISlotStyleFactories, IComponentTokens } from '@uifabricshared/foundation-tokens';
import * as React from 'react';

/**
 * Function signature for useStyling as implemented by compose.  This adds the lookup function to enable
 * more control over how overrides are applied.
 */
export type IUseComposeStyling<TSlotProps extends ISlotProps> = (props: TSlotProps['root'], lookup?: IOverrideLookup) => TSlotProps;

/**
 * Array of:
 *  IComponentSettings for the component
 *  string - name of the entry to query in the theme
 *  theme =\> IComponentSettings function
 *
 * These settings are layered together in order to produce the merged settings for a component
 */
export type IComposeSettings<TSlotProps extends ISlotProps> = ISettingsEntry<IComponentSettings<TSlotProps>, ITheme>[];

/**
 * Settings which dictate the behavior of useStyling, as implemented by the compose package.  These are
 * separated from IComponentOptions to allow the styling portion to be used independently if so desired.
 */
export interface IStylingSettings<TSlotProps extends ISlotProps> {
  /**
   * slots of IComposable with added style factory options
   */
  slots: { [K in keyof TSlotProps]: ISlotWithFilter<ISlotStyleFactories<TSlotProps['root'], ITheme>> };

  /**
   * settings used to build up the style definitions
   */
  settings?: IComposeSettings<TSlotProps>;

  /**
   * The input tokens processed, built into functions, with the keys built into a map.
   *
   * This gets set automatically when the component is set up for the first time and should not be set by hand.
   */
  resolvedTokens?: IComponentTokens<TSlotProps['root'], ITheme>;
}

/**
 * Options to be used with compose.  These drive the actual behavior of the component and are comprised of styling
 * options as well as options which configure composable.
 */
export interface IComposeOptions<
  TProps extends object = object,
  TSlotProps extends ISlotProps = ISlotProps<TProps>,
  TState extends object = object,
  TStatics extends object = object
  > extends Omit<IComposableDefinition<TSlotProps['root'], TSlotProps, TState>, 'slots'>, IStylingSettings<TSlotProps> {
  /**
   * Add an additional option to use styling to allow for injecting override lookup functions
   */
  useStyling?: IUseComposeStyling<TSlotProps>;

  /**
   * Use prepare props will take the more opinionated version of useStyling
   */
  usePrepareProps?: (props: TSlotProps['root'], useStyling: IUseComposeStyling<TSlotProps>) => IRenderData<TSlotProps, TState>;

  /**
   * Optional display name to set on the component
   */
  displayName?: string;

  /**
   * Optional statics to attach to the component.  This is primary used to attach a sub-component to a parent component
   */
  statics?: TStatics;
}

/**
 * The signature of the component returned from compose.
 */
export type IComposeReturnType<
  TProps extends object,
  TSlotProps extends ISlotProps,
  TState extends object = object,
  TStatics extends object = object
  > = React.FunctionComponent<TProps> &
  TStatics & {
    /**
     * composable options, used by composable for chaining objects.  For compose this also includes the extensions
     * such as settings or token information.
     */
    __composable: IComposeOptions<TProps, TSlotProps, TState, TStatics>;

    /**
     * shorthand function for doing quick customizations of a component by appending to settings
     */
    customize: (...settings: IComposeSettings<TSlotProps>) => IComposeReturnType<TProps, TSlotProps, TState, TStatics>;

    /**
     * helper function to quickly add new partial options to the base component.  The primary advantage is that
     * this is strongly typed for the component type which avoids needing to pass all the type parameters correctly.
     */
    compose: (
      newOptions: Partial<IComposeOptions<TProps, TSlotProps, TState, TStatics>>
    ) => IComposeReturnType<TProps, TSlotProps, TState, TStatics>;
  };
