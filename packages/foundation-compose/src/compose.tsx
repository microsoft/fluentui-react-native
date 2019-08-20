import * as React from 'react';
import {
  IComponent,
  IComponentCustomizations,
  IComponentReturnType,
  IReactComponentType,
  IComponentProps,
  IExtractSettingsType
} from './Component.types';
import { ISlotTypes, useProcessComposableTree, renderSlot, IGenericProps } from '@uifabric/foundation-composable';
import { wrapComponent, mergeTokenKeys, standardUsePrepareState, standardThemeQueryInputs } from './Component';
import { ThemeContext, getTheme } from '@uifabric/theming-react-native';
import { ICustomizedValueType } from './Customize.types';
import { customize } from './Customize';

function getComponentOptions<TComponent extends IComponent>(inputComponent: TComponent, base?: React.ReactElement<object>): TComponent {
  const baseComposable = (base && ((base as unknown) as IComponentCustomizations<TComponent>).__options) || undefined;
  const baseRoot = (!baseComposable && base) || undefined;
  if (baseComposable || baseRoot) {
    // append custom settings to any pre-existing ones
    const parent = baseComposable || ({} as TComponent);
    const slots: ISlotTypes = { ...parent.slots, ...inputComponent.slots };
    const customSettings = [].concat(parent.customSettings, inputComponent.customSettings).filter(v => v);
    const tokenProcessors = [].concat(parent.tokenProcessors, inputComponent.tokenProcessors).filter(v => v);

    if (baseRoot) {
      /* tslint:disable-next-line no-any */
      slots.root = baseRoot as any;
    }
    return {
      ...baseComposable,
      ...inputComponent,
      slots,
      customSettings,
      tokenProcessors
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
  options.themeQueryInputs = options.themeQueryInputs || standardThemeQueryInputs;
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

  // set up the customize handler
  Component.customize = (literals: TemplateStringsArray, ...keys: ICustomizedValueType<IComponentProps<TComponent>>[]) => {
    return compose<TComponent>(
      ({
        className: options.className,
        customSettings: [customize<IExtractSettingsType<TComponent>, IComponentProps<TComponent>>(literals, ...keys)]
      } as unknown) as TComponent,
      (Component as unknown) as React.ReactElement<object>
    );
  };

  return Component;
}
