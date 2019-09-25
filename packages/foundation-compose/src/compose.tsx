import { IComponentOptions, IComponentReturnType } from './compose.types';
import { composable, INativeSlotType } from '@uifabricshared/foundation-composable';
import { initializeStyling, getOptionsFromObj } from './useStyling';
import { immutableMerge } from '@uifabricshared/immutable-merge';
import { ISlotProps, IComponentSettings } from '@uifabricshared/foundation-settings';
import { ISettingsEntry } from '@uifabricshared/themed-settings';
import { ITheme } from '@uifabricshared/theming-ramp';

/**
 * Merge current and base options together to form the new object definition.  These objects will merge with the
 * exception of settings which will be appended
 *
 * @param inputComponent - input component
 * @param base - component to use as a baseline (if it exists)
 */
function _getComponentOptions<TProps extends object, TSlotProps extends ISlotProps, TState extends object, TStatics extends object>(
  inputComponent: Partial<IComponentOptions<TProps, TSlotProps, TState, TStatics>>,
  base?: IComponentOptions<TProps, TSlotProps, TState, TStatics>
): IComponentOptions<TProps, TSlotProps, TState, TStatics> {
  if (base) {
    const mergedSettings = { settings: [].concat(base.settings || [], inputComponent.settings || []).filter(v => v) };
    return immutableMerge(base, inputComponent, mergedSettings) as IComponentOptions<TProps, TSlotProps, TState, TStatics>;
  }
  return inputComponent as IComponentOptions<TProps, TSlotProps, TState, TStatics>;
}

/**
 * Assembles a higher order component based on the following: styles, theme, view, and slots.
 * Imposes a separation of concern and centralizes styling processing to increase ease of use and robustness
 * in how components use and apply styling and theming.
 *
 * @param inputComponent - component definition for the component to be created.  See IComponent for more details.
 * @param base - optional base component to compose, this can be an intrinsic, a stock element, or another composable
 */
export function compose<
  TProps extends object,
  TSlotProps extends ISlotProps = ISlotProps<TProps>,
  TState extends object = object,
  TStatics extends object = object
>(
  inputComponent: Partial<IComponentOptions<TProps, TSlotProps, TState, TStatics>>,
  base?: INativeSlotType
): IComponentReturnType<TProps, TSlotProps, TState, TStatics> {
  // get merged options for the component
  const options = _getComponentOptions<TProps, TSlotProps, TState, TStatics>(inputComponent, base && getOptionsFromObj(base));

  // set up the styling injection function
  options.useStyling = initializeStyling<TSlotProps>(options, options.displayName);

  // use composable to create the function implementation
  const Component = composable(options) as IComponentReturnType<TProps, TSlotProps, TState, TStatics>;

  // attach extra information to the returned function component
  Component.displayName = options.displayName;
  Object.assign(Component, options.statics);

  // set up the customize handler
  Component.customize = (...settings: ISettingsEntry<IComponentSettings<TSlotProps>, ITheme>[]) => {
    return compose(
      { settings },
      Component
    );
  };

  // now return the newly created component
  return Component;
}
