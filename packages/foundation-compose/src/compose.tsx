import { IComponent, IComponentReturnType, IExtractSettingsType } from './Component.types';
import { composable, INativeSlotType } from '@uifabric/foundation-composable';
import { ITheme } from '@uifabric/theming';
import { ISettingsEntry } from '@uifabric/custom-settings';
import { initializeStyling, getOptionsFromObj } from './useStyling';
import { immutableMerge } from '@uifabric/immutable-merge';

/**
 * Merge current and base options together to form the new object definition.  These objects will merge with the
 * exception of settings which will be appended
 *
 * @param inputComponent - input component
 * @param base - component to use as a baseline (if it exists)
 */
function _getComponentOptions<TComponent extends IComponent>(inputComponent: Partial<TComponent>, base?: TComponent): TComponent {
  if (base) {
    const mergedSettings = { settings: [].concat(base.settings || [], inputComponent.settings || []).filter(v => v) } as TComponent;
    return immutableMerge(base, inputComponent, mergedSettings) as TComponent;
  }
  return inputComponent as TComponent;
}

/**
 * Assembles a higher order component based on the following: styles, theme, view, and slots.
 * Imposes a separation of concern and centralizes styling processing to increase ease of use and robustness
 * in how components use and apply styling and theming.
 *
 * @param inputComponent - component definition for the component to be created.  See IComponent for more details.
 * @param base - optional base component to compose, this can be an intrinsic, a stock element, or another composable
 */

export function compose<TComponent extends IComponent>(
  inputComponent: Partial<TComponent>,
  base?: INativeSlotType
): IComponentReturnType<TComponent> {
  // get merged options for the component
  const options = _getComponentOptions(inputComponent, base && getOptionsFromObj(base));

  // set up the styling injection function
  options.useStyling = initializeStyling(options, options.displayName);

  // use composable to create the function implementation
  const Component = composable(options) as IComponentReturnType<TComponent>;

  // attach extra information to the returned function component
  Component.displayName = options.displayName;
  Object.assign(Component, options.statics);

  // set up the customize handler
  Component.customize = (...settings: ISettingsEntry<IExtractSettingsType<TComponent>, ITheme>[]) => {
    return compose(
      { settings } as Partial<TComponent>,
      Component
    ) as IComponentReturnType<TComponent>;
  };

  // now return the newly created component
  return Component;
}
