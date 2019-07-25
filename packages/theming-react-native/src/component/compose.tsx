import * as React from 'react';
import { IComponent, IComponentCustomizations, IComponentReturnType, IReactComponentType, IComponentProps } from './Component.types';
import { ISlotTypes, useProcessComposableTree, renderSlot, IGenericProps } from '../composable';
import { wrapComponent, mergeTokenKeys, standardUsePrepareState } from './Component';
import { ThemeContext } from '../ThemeLayer';
import { getTheme } from '../Global';

function getComponentOptions<TComponent extends IComponent>(inputComponent: TComponent, base?: React.ReactElement<object>): TComponent {
  const baseComposable = (base && ((base as unknown) as IComponentCustomizations<TComponent>).__options) || undefined;
  const baseRoot = (!baseComposable && base) || undefined;
  if (baseComposable || baseRoot) {
    const slots: ISlotTypes = {
      ...((baseComposable && baseComposable.slots) || {}),
      ...inputComponent.slots
    } as ISlotTypes;
    if (baseRoot) {
      /* tslint:disable-next-line no-any */
      slots.root = baseRoot as any;
    }
    return {
      ...baseComposable,
      ...inputComponent,
      slots
    };
  }
  return inputComponent;
}

/**
 * Assembles a higher order component based on the following: styles, theme, view, and slots.
 * Imposes a separation of concern and centralizes styling processing to increase ease of use and robustness
 * in how components use and apply styling and theming.
 *
 * @param component - component definition for the component to be created.  See IComponent for more details.
 */
export function compose<TComponent extends IComponent>(
  inputComponent: TComponent,
  base?: React.ReactElement<object>
): IComponentReturnType<TComponent> {
  const options = getComponentOptions(inputComponent, base);
  options.tokenKeys = mergeTokenKeys(options);
  options.tokenCacheKey = Symbol(options.className);
  options.usePrepareState = options.usePrepareState || standardUsePrepareState;
  const composable = wrapComponent(options);

  const Component: IReactComponentType<TComponent> = (userProps: IComponentProps<TComponent>) => {
    // get the theme value from the context (or the default theme if it is not set)
    const theme = React.useContext(ThemeContext) || getTheme();

    // perform prop resolution as specified by the composable pattern
    const result = useProcessComposableTree(composable, userProps as IGenericProps, theme);

    // now use the slot renderer to call the view function
    return renderSlot(result);
  };

  // set the displayName and merge in statics
  Component.displayName = options.className;
  Component.__options = options;
  Component.__composable = composable;
  Object.assign(Component, options.statics);
  return Component;
}
