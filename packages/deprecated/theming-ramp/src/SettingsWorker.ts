import type { Theme } from '@fluentui-react-native/theme-types';
import type { IComponentSettings } from '@uifabricshared/foundation-settings';

/** helper to strip out the component settings specific bits from the returned structure */
export function returnAsSlotProps(target: IComponentSettings): IComponentSettings {
  if (target) {
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
export function getSettings(theme: Theme, name: string): IComponentSettings {
  return (theme.components && theme.components[name]) || undefined;
}
