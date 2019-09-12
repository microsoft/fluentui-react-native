import { IComponentSettings } from '../../foundation-settings/lib';
import { INativeTheme } from '@uifabric/theming-react-native';

export type IWithTheme<TProps> = TProps & { theme: INativeTheme };
export type ICustomizedResult = string | number | boolean | undefined | null;
export type IPropFunction<TProps> = (props: IWithTheme<TProps>) => ICustomizedResult;
export type ICustomizedValueType<TProps> = ICustomizedResult | IPropFunction<TProps>;

export interface ICustomizedSettings<TSettings extends IComponentSettings, TProps> {
  /**
   * Query for the set of variable keys in the customized settings.  These correspond to functions which
   * take props as an input.  For purposes of these functions theme will be attached to props under
   * props.theme
   */
  queryKeys?: (props: IWithTheme<TProps>) => string[];

  /**
   * Take a set of keys obtained from queryKeys and return a component settings object from them.  This
   * is broken into two parts to allow for a cache lookup in-between
   */
  getSettings?: (keys: string[]) => TSettings;

  /**
   * Custom settings, either specified or calculated from a function with no variable keys
   */
  settings?: TSettings;
}
