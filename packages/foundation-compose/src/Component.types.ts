import { INativeTheme } from '@uifabricshared/theming-react-native';
import { ISlotTypes, IResolvedSlotData, IComposable } from '@uifabricshared/foundation-composable';
import { IComponentSettings } from '../../foundation-settings/lib';
import { ITheme } from '@uifabricshared/theming';
import { IComponentTokens, ISlotStyleFactories } from '@uifabricshared/foundation-tokens';
import { ISettingsEntry } from '@uifabricshared/custom-settings';

export interface IRenderData<
  TProps extends object = object,
  TSlotProps extends IComponentSettings = IComponentSettings,
  TState extends object = any
  > {
  props: TProps;
  theme: INativeTheme;
  state: TState;
  slotProps?: TSlotProps;
  settingsKey?: string;
}

export type IResolvedData<TProps extends object, TSlotProps extends IComponentSettings, TState extends object = any> = IRenderData<
  TProps,
  TSlotProps,
  TState
> &
  IResolvedSlotData;

/**
 * finalizer function which does final processing on slotProps to prepare for render
 */
export type IFinalizer<TProps extends object, TSlotProps extends IComponentSettings, TState extends object = object> = (
  renderData: IRenderData<TProps, TSlotProps, TState>
) => IRenderData<TProps, TSlotProps, TState>;

export interface IThemeQueryInputs {
  name: string;
  overrides?: object;
}

export type IComponentSlotTypes<TProps> = ISlotTypes<ISlotStyleFactories<TProps, ITheme>>;

export interface IComponent<
  TProps extends object = object,
  TSlotProps extends IComponentSettings = IComponentSettings,
  TCustomizeableProps extends TProps = TProps,
  TState extends object = any,
  TStatics extends object = object
  > {
  displayName: string;
  /**
   * used for type extraction, this will become the props interface for the component, the one that is used when authoring
   * against the component using JSX
   */
  propsType?: TProps;
  settingsType?: TSlotProps;

  /**
   * This routine should return a new render data object with the props, userProps and theme specified.  While a default implementation
   * will be provided by compose, if the component uses hooks this routine should be implemented and they should be called here.
   *
   * Part of this routine should include setting the theme on props for use with styled-component style processing
   */
  usePrepareState?: (
    renderData: IRenderData<TCustomizeableProps, TSlotProps, TState>
  ) => IRenderData<TCustomizeableProps, TSlotProps, TState>;

  /**
   * This allows dynamically changing the name looked up in settings as well as the object used for overrides
   */
  themeQueryInputs?: (name: string, renderData: IRenderData<TCustomizeableProps, TSlotProps, TState>) => IThemeQueryInputs;

  /**
   * Settings for the component, IComponentSettings, theme => IComponentSettings, or a name to look up in the theme
   */
  settings?: ISettingsEntry<TSlotProps, ITheme>[];

  /**
   * The finalizer function does final preparation for render.  The default one will push all props to the root entry of the slot props
   */
  finalizer?: IFinalizer<TCustomizeableProps, TSlotProps, TState>;

  /**
   * View function, called to do the final render
   */
  view?: (renderData: IResolvedData<TCustomizeableProps, TSlotProps, TState>, ...children: React.ReactNode[]) => JSX.Element | null;

  /**
   * statics to be added to the component
   */
  statics?: TStatics;

  /**
   * Optional slots to enable compound controls
   */
  slots?: IComponentSlotTypes<TCustomizeableProps>;
}

/**
 * Internal options for the component, these are not user settable but are instead used by the compose package
 */
export type IComponentOptions<TComponent extends IComponent = IComponent> = TComponent & {
  /**
   * The input tokens processed, built into functions, with the keys built into a map
   */
  resolvedTokens?: IComponentTokens<IComponentProps<TComponent>, ITheme>;

  /**
   * Symbol used to uniquely identify the theme cache for this component, will be set at creation time
   */
  tokenCacheKey?: symbol;
};

/**
 * Helper to extract the base props type from the component
 */
export type IComponentProps<TComponent extends IComponent> = NonNullable<TComponent['propsType']>;

export type IExtractSettingsType<TComponent extends IComponent> = NonNullable<TComponent['settingsType']>;

export type IPropsWithChildren<TProps extends object> = TProps & {
  children?: React.ReactNode;
};

/**
 *
 */
export type IComponentCustomizations<TComponent extends IComponent> = {
  __options: TComponent;
  __composable: IComposable;
  customize: ICustomizeRoutine<TComponent, IExtractSettingsType<TComponent>>;
};

export type IReactComponentType<TComponent extends IComponent> = React.FunctionComponent<IComponentProps<TComponent>> &
  IComponentCustomizations<TComponent>;

export type IComponentReturnType<TComponent extends IComponent> = IReactComponentType<TComponent> & TComponent['statics'];

export type ICustomizeRoutine<TComponent extends IComponent, TSettings extends object> = (
  ...keys: ISettingsEntry<TSettings, ITheme>[]
) => IComponentReturnType<TComponent>;
