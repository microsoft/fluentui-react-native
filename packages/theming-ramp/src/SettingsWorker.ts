import { ITheme } from './Theme.types';
import { IComponentSettings } from '@uifabricshared/foundation-settings';

/** helper to strip out the component settings specific bits from the returned structure */
export function returnAsSlotProps(target: IComponentSettings): IComponentSettings {
  if (target) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _overrides, _precedence, ...settings } = target;
    return settings;
  }
  return target;
}

/**
 *
 * @param theme - theme used to retrieve settings
 * @param name - name of the settings entry to retrieve
 * @param overrides - optional override lookup object to conditionally apply overrides
 */
export function getSettings(theme: ITheme, name: string): IComponentSettings {
  return (theme.settings && theme.settings[name]) || undefined;
}
