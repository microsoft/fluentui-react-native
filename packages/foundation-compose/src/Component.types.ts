import { IRenderData, IComposableDefinition } from '@uifabricshared/foundation-composable';
import { IComponentSettings, ISlotProps } from '../../foundation-settings/lib';
import { ITheme } from '@uifabricshared/theming-ramp';
import { ISettingsEntry } from '@uifabricshared/themed-settings';
import { IStylingSettings, IUseOpinionatedStyling } from './useStyling';

/**
 * Base class, used for adding typing information to the generic routines.  Values set in these
 * members will be ignored with the exception of statics which will be appended to the returned
 * functional component
 */
export interface IComponentBase<TProps = object, TSettings = object, TStatics = object, TState = object> {
  statics?: TStatics;
  propsType?: TProps;
  settingsType?: TSettings;
  stateType?: TState;
}

/**
 * Interface for defining a component to be used with compose.
 */
export interface IComponent<
  TProps extends object,
  TInternalProps extends TProps = TProps,
  TSlotProps extends ISlotProps<TInternalProps> = ISlotProps<TInternalProps>,
  TState extends object = object,
  TStatics extends object = object
>
  extends IComponentBase<TProps, IComponentSettings<TSlotProps>, TStatics, TState>,
    Omit<IComposableDefinition<TInternalProps, TSlotProps, TState>, 'slots'>,
    IStylingSettings<TInternalProps, TSlotProps> {
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
}

/**
 *
 */
export type IComponentReturnType<TComp extends IComponentBase> = React.FunctionComponent<NonNullable<TComp['propsType']>> &
  TComp['statics'] & {
    __composable: TComp;
    customize: (...keys: ISettingsEntry<NonNullable<TComp['settingsType']>, ITheme>[]) => IComponentReturnType<TComp>;
  };
