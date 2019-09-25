import { IRenderData, IComposableDefinition, ISlotWithFilter } from '@uifabricshared/foundation-composable';
import { ISlotProps, IComponentSettings, IOverrideLookup } from '@uifabricshared/foundation-settings';
import { ISettingsEntry } from '@uifabricshared/themed-settings';
import { ITheme } from '@uifabricshared/theming-ramp';
import { ISlotStyleFactories, IComponentTokens } from '@uifabricshared/foundation-tokens';

export type IUseOpinionatedStyling<TSlotProps extends ISlotProps> = (props: TSlotProps['root'], lookup?: IOverrideLookup) => TSlotProps;

export interface IStylingSettings<TSlotProps extends ISlotProps> {
  /**
   * slots of IComposable with added style factory options
   */
  slots: { [K in keyof TSlotProps]: ISlotWithFilter<ISlotStyleFactories<TSlotProps['root'], ITheme>> };

  /**
   * settings used to build up the style definitions
   */
  settings?: ISettingsEntry<IComponentSettings<TSlotProps>, ITheme>[];

  /**
   * The input tokens processed, built into functions, with the keys built into a map.
   * -- Set Automatically
   */
  resolvedTokens?: IComponentTokens<TSlotProps['root'], ITheme>;
}

/**
 * Interface for defining a component to be used with compose.
 */
export interface IComponentOptions<
  TProps extends object = object,
  TSlotProps extends ISlotProps = ISlotProps<TProps>,
  TState extends object = object,
  TStatics extends object = object
> extends Omit<IComposableDefinition<TSlotProps['root'], TSlotProps, TState>, 'slots'>, IStylingSettings<TSlotProps> {
  /**
   * Add an additional option to use styling to allow for injecting override lookup functions
   */
  useStyling?: IUseOpinionatedStyling<TSlotProps>;

  /**
   * Use prepare props will take the more opinionated version of useStyling
   */
  usePrepareProps?: (props: TSlotProps['root'], useStyling: IUseOpinionatedStyling<TSlotProps>) => IRenderData<TSlotProps, TState>;

  /**
   * Optional display name to set on the component
   */
  displayName?: string;

  /**
   * Optional statics to attach to the component
   */
  statics?: TStatics;

  slotPropsType?: TSlotProps;
  propsType?: TProps;
  stateType?: TState;
}

/**
 *
 */
export type IComponentReturnType<
  TProps extends object,
  TSlotProps extends ISlotProps,
  TState extends object = object,
  TStatics extends object = object
> = React.FunctionComponent<TProps> &
  TStatics & {
    __composable: IComponentOptions<TProps, TSlotProps, TState, TStatics>;
    customize: (
      ...keys: ISettingsEntry<IComponentSettings<TSlotProps>, ITheme>[]
    ) => IComponentReturnType<TProps, TSlotProps, TState, TStatics>;
  };
