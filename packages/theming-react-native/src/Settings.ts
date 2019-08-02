import {
  createSettingsWorker,
  ITheme,
  ISettingsWithKey,
  finalizeFontFamily,
  finalizeFontSize,
  finalizeFontWeight,
  finalizeColor,
  IStyleValueFinalizers
} from '@uifabric/theming';
import { IOverrideLookup, IComponentSettings } from '@uifabric/theme-settings';
import { INativeTheme } from './INativeTheme';

// create a global style worker and add the finalizers for this theming system
const _worker = createSettingsWorker(_getFinalizers());

export function getThemeSettings(theme: ITheme, target: string, overrides?: IOverrideLookup): ISettingsWithKey {
  return _worker.getSettings(theme, target, overrides);
}

/**
 * resolve any parent relationships, apply overrides, and finalize values for the target settings object
 */
export function resolveSettings(theme: ITheme, target: IComponentSettings, overrides?: IOverrideLookup): IComponentSettings {
  return _worker.resolveSettings(theme, target, overrides);
}

/**
 * run settings through the registered set of finalizers.  This will be called implicitly
 * by getSettings but in the case where settings are created via some other mechanism this
 * allows consistent processing.
 */
export function finalizeSettings(theme: ITheme, settings: IComponentSettings): IComponentSettings {
  return _worker.finalizeSettings(theme, settings);
}

/**
 * register one or more finalizers to run on styles.  Finalizers are triggered when the
 * key they are associated with exists in the style.
 */
export function addValueFinalizers(finalizers: IStyleValueFinalizers): void {
  return _worker.addValueFinalizers(finalizers);
}

export function getThemedProps(theme: INativeTheme, className: string, overrides?: object): object | undefined {
  const settings = _worker.getSettings(theme, className, overrides).settings;
  return settings.root;
}

export function getThemedStyle<TStyle>(theme: INativeTheme, className: string, overrides?: object): TStyle | undefined {
  const props = getThemedProps(theme, className, overrides) as { style?: TStyle };
  return props.style;
}

function _getFinalizers(): IStyleValueFinalizers {
  return {
    fontFamily: finalizeFontFamily,
    fontSize: finalizeFontSize,
    fontWeight: finalizeFontWeight,
    backgroundColor: finalizeColor,
    color: finalizeColor,
    borderColor: finalizeColor,
    borderBottomColor: finalizeColor,
    borderEndColor: finalizeColor,
    borderLeftColor: finalizeColor,
    borderRightColor: finalizeColor,
    borderStartColor: finalizeColor,
    borderTopColor: finalizeColor,
    overlayColor: finalizeColor,
    tintColor: finalizeColor,
    textDecorationColor: finalizeColor,
    textShadowColor: finalizeColor
  };
}
