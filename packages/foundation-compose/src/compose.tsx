import * as React from 'react';
import {
  IComponent,
  IComponentReturnType,
  IReactComponentType,
  IComponentProps,
  IComponentOptions,
  IExtractSettingsType
} from './Component.types';
import { ISlotTypes, useProcessComposableTree, renderSlot, IGenericProps } from '@uifabricshared/foundation-composable';
import { wrapComponent, standardUsePrepareState, standardThemeQueryInputs } from './Component';
import { ThemeContext, getTheme } from '@uifabricshared/theming-react-native';
import { buildComponentTokens, IStyleFactories } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming';
import { ISettingsEntry } from '@uifabricshared/custom-settings';

/* tslint:disable-next-line no-any */
function _getOptions<TComponent extends IComponent = IComponent>(obj: any): IComponentOptions<TComponent> | undefined {
  return (obj && typeof obj !== 'object' && obj.__options) || undefined;
}

function _getComponentOptions<TComponent extends IComponent>(
  inputComponent: TComponent,
  base?: React.ReactElement<object>
): IComponentOptions<TComponent> {
  const baseComposable = _getOptions<TComponent>(base);
  const baseRoot = (!baseComposable && base) || undefined;
  if (baseComposable || baseRoot) {
    // append custom settings to any pre-existing ones
    const parent = baseComposable || ({} as TComponent);
    const slots: ISlotTypes = { ...parent.slots, ...inputComponent.slots };
    const settings = [].concat(parent.settings, inputComponent.settings).filter(v => v);

    if (baseRoot) {
      slots.root = baseRoot as any;
    }
    return {
      ...baseComposable,
      ...inputComponent,
      slots,
      settings
    };
  }
  return inputComponent;
}

function _hasToken(slots: ISlotTypes, target: string, key: string): boolean {
  const slot = slots[target];
  const options = _getOptions(slot);
  return options && options.resolvedTokens && options.resolvedTokens.tokenKeys.hasOwnProperty(key);
}

function _setupComponentOptions(options: IComponentOptions<IComponent>): void {
  // ensure functions and the symbol are set up correctly
  options.tokenCacheKey = Symbol(options.displayName);
  options.usePrepareState = options.usePrepareState || standardUsePrepareState;
  options.themeQueryInputs = options.themeQueryInputs || standardThemeQueryInputs;

  // process the tokens and get them ready to render
  const slots = options.slots;
  const hasTokens = slots
    ? (target: string, key: string) => {
      return _hasToken(slots, target, key);
    }
    : undefined;
  options.resolvedTokens = buildComponentTokens<IComponentProps<IComponent>, ITheme>(
    options.slots as IStyleFactories<IComponentProps<IComponent>, ITheme>,
    hasTokens
  );
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
  const options = _getComponentOptions(inputComponent, base);
  _setupComponentOptions(options as IComponentOptions<IComponent>);
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
  Component.displayName = options.displayName;
  Component.__options = options;
  Component.__composable = composable;
  Object.assign(Component, options.statics);

  // set up the customize handler
  Component.customize = (...settings: ISettingsEntry<IExtractSettingsType<TComponent>, ITheme>[]) => {
    return compose<TComponent>(
      ({
        displayName: options.displayName + '+',
        settings
      } as unknown) as TComponent,
      (Component as unknown) as React.ReactElement<object>
    );
  };

  return Component;
}
