import { IRenderData, IComposableDefinition } from '@uifabric/foundation-composable';
import { IComponentSettings, ISlotProps } from '../../foundation-settings/lib';
import { ITheme } from '@uifabric/theming';
import { ISettingsEntry } from '@uifabric/custom-settings';
import { IStylingSettings, IUseOpinionatedStyling } from './useStyling';

/*
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
*/

/**
 * finalizer function which does final processing on slotProps to prepare for render
 */
/*
export type IFinalizer<TProps extends object, TSlotProps extends IComponentSettings, TState extends object = object> = (
  renderData: IRenderData<TProps, TSlotProps, TState>
) => IRenderData<TProps, TSlotProps, TState>;


export interface IThemeQueryInputs {
  name: string;
  overrides?: object;
}
*/

export interface IComponent<
  TProps extends object = object,
  TInternalProps extends TProps = TProps,
  TSlotProps extends ISlotProps<TInternalProps> = ISlotProps<TInternalProps>,
  TState extends object = any,
  TStatics extends object = object
> extends Omit<IComposableDefinition<TInternalProps, TSlotProps, TState>, 'slots'>, IStylingSettings<TInternalProps, TSlotProps> {
  /**
   * Add an additional option to use styling to allow for injecting override lookup functions
   */
  useStyling?: IUseOpinionatedStyling<TInternalProps, TSlotProps>;

  /**
   * Use prepare props will take the more opinionated version of useStyling
   */
  usePrepareProps?: (
    props: TInternalProps,
    useStyling: IUseOpinionatedStyling<TInternalProps, TSlotProps>
  ) => IRenderData<TSlotProps, TState>;

  /**
   * Optional display name to set on the component
   */
  displayName?: string;

  /**
   * Optional statics to attach to the component
   */
  statics?: TStatics;

  /**
   * used for type extraction, this will become the props interface for the component, the one that is used when authoring
   * against the component using JSX
   */
  propsType?: TProps;

  /**
   * used for type extraction, this is used as the inputs for customization
   */
  settingsType?: IComponentSettings<TSlotProps>;
}

/*
export interface IPrepareOptions<TProps extends object, TSlotProps extends ISlotProps<TProps>, TState> {
  basePrepareProps?: (props: TProps, options: IPrepareOptions<TProps, TSlotProps, TState>) => IRenderData<TSlotProps, TState>;
  useStyling?: (props: TProps, lookupOverride?: IOverrideLookup) => TSlotProps;
}
*/

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
  __composable: TComponent;
  customize: ICustomizeRoutine<TComponent, IExtractSettingsType<TComponent>>;
};

export type IReactComponentType<TComponent extends IComponent> = React.FunctionComponent<IComponentProps<TComponent>> &
  IComponentCustomizations<TComponent>;

export type IComponentReturnType<TComponent extends IComponent> = IReactComponentType<TComponent> & TComponent['statics'];

export type ICustomizeRoutine<TComponent extends IComponent, TSettings extends object> = (
  ...keys: ISettingsEntry<TSettings, ITheme>[]
) => IComponentReturnType<TComponent>;
