/* eslint-disable */

import { IComposeOptions, IComposeReturnType, IExtractStatics, IExtractTokens, IDefineComposeSettings } from './compose.types';
import {
  composable,
  INativeSlotType,
  IComposableType,
  IExtractProps,
  IExtractSlotProps,
  IExtractState,
} from '@uifabricshared/foundation-composable';
import { initializeStyling, getOptionsFromObj } from './useStyling';
import { immutableMerge } from '@fluentui-react-native/framework-base';
import { ISlotProps } from '@uifabricshared/foundation-settings';

/**
 * Merge current and base options together to form the new object definition.  These objects will merge with the
 * exception of settings which will be appended
 *
 * @param inputComponent - input component
 * @param base - component to use as a baseline (if it exists)
 */
function _getComponentOptions<
  TProps extends object,
  TSlotProps extends ISlotProps,
  TTokens extends object,
  TState extends object,
  TStatics extends object,
>(
  inputComponent: Partial<IComposeOptions<TProps, TSlotProps, TTokens, TState, TStatics>>,
  base?: IComposeOptions<TProps, TSlotProps, TTokens, TState, TStatics>,
): IComposeOptions<TProps, TSlotProps, TTokens, TState, TStatics> {
  if (base) {
    const mergedSettings = { settings: [].concat(base.settings || [], inputComponent.settings || []).filter((v) => v) };
    return immutableMerge(base, inputComponent, mergedSettings) as IComposeOptions<TProps, TSlotProps, TTokens, TState, TStatics>;
  }
  return inputComponent as IComposeOptions<TProps, TSlotProps, TTokens, TState, TStatics>;
}

/**
 * Assembles a higher order component, optionally composing a base HOC or base primitive control.  The compose pattern
 * allows a greater degree of customization than is available via props and allows for customization without adding
 * additional layers to the react hierarchy.
 *
 * @param inputComponent - component definition for the component to be created.  See IComposeOptions for more details.
 * @param base - optional base component to compose, this can be an intrinsic, a stock element, or another composable
 */
export function compose<TType>(
  inputComponent: Partial<
    IComposeOptions<IExtractProps<TType>, IExtractSlotProps<TType>, IExtractTokens<TType>, IExtractState<TType>, IExtractStatics<TType>>
  >,
  base?: INativeSlotType,
): IComposeReturnType<IExtractProps<TType>, IExtractSlotProps<TType>, IExtractTokens<TType>, IExtractState<TType>, IExtractStatics<TType>> {
  // extract the real types from TType
  type ITProps = IExtractProps<TType>;
  type ITSlotProps = IExtractSlotProps<TType>;
  type ITState = IExtractState<TType>;
  type ITStatics = IExtractStatics<TType>;
  type ITTokens = IExtractTokens<TType>;
  type IReturnType = IComposeReturnType<ITProps, ITSlotProps, ITTokens, ITState, ITStatics>;

  // get merged options for the component
  const options = _getComponentOptions<ITProps, ITSlotProps, ITTokens, ITState, ITStatics>(inputComponent, base && getOptionsFromObj(base));

  // set up the styling injection function
  options.useStyling = initializeStyling<ITProps, ITSlotProps, ITTokens, ITState, ITStatics>(options);

  // use composable to create the function implementation
  const Component = composable<IComposableType<ITProps, ITSlotProps, ITState>>(options as any) as IReturnType;

  // attach extra information to the returned function component
  Component.displayName = options.displayName;
  Object.assign(Component, options.statics);

  // set up the customize handler
  Component.customize = (...settings: IDefineComposeSettings<ITSlotProps, ITTokens>) => {
    return compose({ settings }, Component);
  };

  // set up the compose handler
  Component.compose = (newOptions: Partial<IComposeOptions<ITProps, ITSlotProps, ITTokens, ITState, ITStatics>>) => {
    return compose<TType>(newOptions, Component);
  };

  // now return the newly created component
  return Component;
}
