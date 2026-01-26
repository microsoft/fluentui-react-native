/* eslint-disable */

import * as React from 'react';
import { ISlotProps } from '@uifabricshared/foundation-settings';

export type AsObject<T> = T extends object ? T : object;
export type RequireObject<T> = T extends object ? T : never;

/**
 * This is an object used purely for configuring the typings on composable.  It is not necessary to define
 * the type via the IComposableType interface, this is simply the format used to extract the type info.
 */
export interface IComposableType<
  TProps extends object,
  TSlotProps extends ISlotProps = ISlotProps<TProps>,
  TState extends object = object,
> {
  /** component props, exposed as the public interface of the component */
  props: TProps;

  /**
   * slotProps, an object containing at least \{ root: IRootPropType \}.  The type of this object will dictate
   * the slots on the component.
   */
  slotProps: TSlotProps;

  /** optional state component for passing state from the hook to the render function */
  state: TState;
}

type IPropsFragment<TProps extends object> = { props: TProps };
type ISlotPropsFragment<TSlotProps extends ISlotProps> = { slotProps: TSlotProps };
type IStateFragment<TState extends object> = { state: TState };

/**
 * Extraction types that get the various interface types from IComposableType
 */
export type IExtractProps<T> = T extends IPropsFragment<infer U> ? U : never;
export type IExtractSlotProps<T> = T extends ISlotPropsFragment<infer U> ? U : never;
export type IExtractState<T> = T extends IStateFragment<infer U> ? U : object;

/**
 * Signature of the use styling function.
 * - IDefineUseStyling builds it out of parts
 * - IUseStyling builds it out of the component definition
 */
export type IDefineUseStyling<TProps, TSlotProps> = (props: TProps) => TSlotProps;
export type IUseStyling<TComponent> = IDefineUseStyling<IExtractProps<TComponent>, IExtractSlotProps<TComponent>>;

/**
 * Signature of usePrepareProps
 * - IDefineUsePrepareProps builds out of parts, IUsePrepareProps builds it out of the component definition
 */
export type IDefineUsePrepareProps<TProps, TSlotProps, TState> = (
  props: TProps,
  useStyling: IDefineUseStyling<TProps, TSlotProps>,
) => IRenderData<TSlotProps, TState>;
export type IUsePrepareProps<TComponent> = IDefineUsePrepareProps<
  IExtractProps<TComponent>,
  IExtractSlotProps<TComponent>,
  IExtractState<TComponent>
>;

/**
 * Pattern for a composable component
 */
export interface IComposable<TProps, TSlotProps, TState> {
  /**
   * Optional display name to set on the component
   */
  displayName?: string;

  /**
   * Injectable styling for the component.  If not specified this will return an empty object
   * @param props - user input props to process for styling
   */
  useStyling: IDefineUseStyling<TProps, TSlotProps>;

  /**
   * process the user props and return an IRenderData object with slot props and an optional state.
   * @param props - user props to be used for processing
   */
  usePrepareProps: IDefineUsePrepareProps<TProps, TSlotProps, TState>;

  /**
   * perform the actual building of the JSX tree.
   * @param Slots - slots, keyed to the values of TSlotProps, suitable to be rendered via renderSlot or JSX syntax
   * @param renderData - IRenderData returned from usePrepareProps
   * @param children - The react children property in the form passed into React.createElement
   */
  render: (
    Slots: ISlots<TSlotProps>,
    renderData: IRenderData<TSlotProps, TState>,
    ...children: React.ReactNode[]
  ) => React.JSX.Element | null;

  /**
   * The slot definitions for this component.  If this only has one sub-component this will only have a root entry.  Using
   * the render helpers to render will automatically include props processed from usePrepareProps
   */
  slots: ISlotDefinitions<TSlotProps>;
}

export type IComposableDefinition<TProps, TSlotProps, TState> = Partial<Omit<IComposable<TProps, TSlotProps, TState>, 'slots'>> & {
  slots?: IPartialSlotDefinitions<TSlotProps>;
};

/**
 * data returned from prop preparation which will be handed to render
 */
export interface IRenderData<TSlotProps, TState = object> {
  slotProps?: TSlotProps;
  state?: TState;
}

/**
 * Mapped type for the resolved/render-ready slots, keyed off of TSlotProps
 */
export type ISlots<TSlotProps> = {
  [K in keyof TSlotProps]: React.FunctionComponent<TSlotProps[K]>;
};

/**
 * Mapped type for the slot definitions, keyed off of TSlotProps
 */
export type ISlotDefinitions<TSlotProps> = {
  [K in keyof TSlotProps]: ISlotWithFilter;
};

export type IPartialSlotDefinitions<TSlotProps> = {
  [K in keyof TSlotProps]?: INativeSlotType | ISlotWithFilter;
};

/**
 * Attach a composable component to an object in a standard manner
 */
export type IWithComposable<T, TComposable> = T & {
  __composable: TComposable;
};

/**
 * Generally a slot can be defined as a standard input to createElement or as an object with a __composable value
 * set on it
 */
export type INativeSlotType = React.ElementType<any> | string;

/**
 * Optional function to filter the properties that will be passed to the component.  If no props are to be
 * removed it should return the same object.  Otherwise it should return a new object with props filtered
 */
export type IPropFilter = (propName: string) => boolean;

/**
 * In the case where a filter needs to be applied to props the slot can be set to an object which contains the slotType
 * and filter function reference
 */
export type ISlotWithFilter<TMixin = object> = {
  slotType?: INativeSlotType;
  filter?: IPropFilter;
} & TMixin;

/**
 * A shorthand for typecasting a component into a more specific type, used for dealing with multiple platforms in
 * react-native
 */
export type IComposableTypecast<TType> = IWithComposable<
  React.FunctionComponent<IExtractProps<TType>>,
  IComposable<IExtractProps<TType>, IExtractSlotProps<TType>, IExtractState<TType>>
>;
