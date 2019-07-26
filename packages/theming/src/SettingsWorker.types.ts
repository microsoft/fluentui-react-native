import { ITheme } from './Theme.types';
import { IStyleValueFinalizers } from './Styles.types';
import { IComponentSettings } from './Settings.types';

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
  getSettings: (theme: ITheme, target: string, overrides?: object) => ISettingsWithKey;

  /**
   * resolve any parent relationships, apply overrides, and finalize values for the target settings object
   */
  resolveSettings: (theme: ITheme, target: IComponentSettings, overrides?: string[]) => IComponentSettings;

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
