import { ITheme } from './Theme.types';
import { IComponentSettings, IOverrideLookup } from '@uifabric/theme-settings';

export interface ISettingsWithKey {
  settings: IComponentSettings;
  styleKey: string;
}

export interface ISettingsWorker {
  /**
   * retrieves resolved settings from the theme
   *
   * @param theme - theme to use for lookups
   * @param target - if this is a string it will be looked up (or faulted into) the cache.  If it is a layer then
   * the layer will be resolved into a settings block with parent lookups and finalization happening as appropriate
   * @param overrides - override states to apply to target once it is retrieved
   */
  getSettings: (theme: ITheme, target: string, overrides?: IOverrideLookup) => ISettingsWithKey;

  /**
   * resolve any parent relationships, apply overrides, and finalize values for the target settings object
   */
  resolveSettings: (theme: ITheme, target: IComponentSettings, overrides?: IOverrideLookup) => IComponentSettings;

  /**
   * run settings through the registered set of finalizers.  This will be called implicitly
   * by getSettings but in the case where settings are created via some other mechanism this
   * allows consistent processing.
   */
  finalizeSettings: (theme: ITheme, settings: IComponentSettings) => IComponentSettings;

  /**
   * register one or more finalizers to run on styles.  Finalizers are triggered when the
   * key they are associated with exists in the style.
   */
  addValueFinalizers: (finalizers: IStyleValueFinalizers) => void;
}

/**
 * function prototype for finalizing a matching key of a style
 * @param theme - currently active theme, used for lookups of semantic values
 * @param source - style to finalize values from
 * @param key - key being processed, this value should exist in the style
 * @param target - target object to output the modified style to, this might be source but might not
 */
export type IStyleValueFinalizer = (theme: ITheme, source: object, key: string, target: object) => void;

export interface IStyleValueFinalizers {
  [key: string]: IStyleValueFinalizer;
}

/**
 * a type for clients to use to register a set of finalizers for a given style fragment
 */
export type IStyleSetFinalizers<TStyleFragment> = { [P in keyof TStyleFragment]: IStyleValueFinalizer };
