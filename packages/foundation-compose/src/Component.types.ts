import { INativeTheme } from '@uifabric/theming-react-native';
import { ISlotTypes, IResolvedSlotData, IComposable } from '@uifabric/foundation-composable';
import { IComponentSettings } from '@uifabric/theme-settings';
import { ICustomizedSettings, ICustomizedValueType } from './Customize.types';

/* tslint:disable no-any */

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

export interface ITokenProcessor<TProps extends object, TSlotProps extends IComponentSettings, TState extends object = any> {
  /**
   * processing function that takes the information in the render data and returns a potentially updated slot props to be set into the
   * render data (and potentially cached)
   */
  processor: (keyProps: TProps, renderData: IRenderData<TProps, TSlotProps, TState>) => TSlotProps;

  /**
   * properties used as keys for caching the results of the styling function.  If the keys are unchanged from the last time it ran
   * the function will not be called again.  These should be props that are
   */
  keyProps: (keyof TProps)[];
}

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

export interface IComponent<
  TProps extends object = object,
  TSlotProps extends IComponentSettings = IComponentSettings,
  TCustomizeableProps extends TProps = TProps,
  TState extends object = any,
  TStatics extends object = object
> {
  className: string;

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
   * Settings to be merged in after the theme settings
   */
  customSettings?: ICustomizedSettings<TSlotProps, TCustomizeableProps>[];

  /**
   * An array of style processing functions, all entries with cacheableMask set will be applied first, followed by entries without
   * that flag.  Results of token processing will be cached in the theme
   */
  tokenProcessors?: ITokenProcessor<TCustomizeableProps, TSlotProps, TState>[];

  /**
   * the consolidated set of token keys for all the token processors, used for extracting properties and caching the results
   */
  tokenKeys?: string[];

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
  slots?: ISlotTypes;

  /**
   * Symbol used to uniquely identify the theme cache for this component, will be set at creation time
   */
  tokenCacheKey?: symbol;
}

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
  customize: ICustomizeRoutine<TComponent, IComponentProps<TComponent>>;
};

export type IReactComponentType<TComponent extends IComponent> = React.FunctionComponent<IComponentProps<TComponent>> &
  IComponentCustomizations<TComponent>;

export type IComponentReturnType<TComponent extends IComponent> = IReactComponentType<TComponent> & TComponent['statics'];

export type ICustomizeRoutine<TComponent extends IComponent, TProps extends object> = (
  literals: TemplateStringsArray,
  ...keys: ICustomizedValueType<TProps>[]
) => IComponentReturnType<TComponent>;
