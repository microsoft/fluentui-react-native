import { INativeTheme } from '../INativeTheme';
import { ISlotTypes, IResolvedSlotData, IComposable } from '../composable';
import { IComponentSettings } from '@office-iss/theming';

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
   * Retrieve the settings for this component from the theme and put them into slotProps.  The default processing will retrieve the
   * settings by class name, using the props as the override lookup object.
   */
  themeSettings?: (
    name: string,
    renderData: IRenderData<TCustomizeableProps, TSlotProps, TState>
  ) => IRenderData<TCustomizeableProps, TSlotProps, TState>;

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
  view?: (renderData: IResolvedData<TCustomizeableProps, TSlotProps, TState>) => JSX.Element | null;

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

export type IPropsWithChildren<TProps extends object> = TProps & {
  children?: React.ReactNode;
};

/**
 *
 */
export type IComponentCustomizations<TComponent extends IComponent> = {
  __options: TComponent;
  __composable: IComposable;
};

export type IReactComponentType<TComponent extends IComponent> = React.FunctionComponent<IComponentProps<TComponent>> &
  IComponentCustomizations<TComponent>;

export type IComponentReturnType<TComponent extends IComponent> = IReactComponentType<TComponent> & TComponent['statics'];
