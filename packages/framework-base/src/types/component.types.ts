import type React from 'react';
import type { SlotComponent } from './render.types';
import type { PropsOf } from './props.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

/**
 * Component and slot building blocks for generated components that align with newer versions of the fluent react library.
 *
 * When building a component with slots, the first thing to do is define the slots that will be used in the component as a type.
 * This type is not used directly but is used to generate the outer component props and the inner component state.
 *
 * Note that the inner state can be a superset of the outer props. In this case there should be a dedicated type for the public slots
 * which will be used to generate the outer props, and an inner slots type which can include the public slots as well as adding additional
 * internal slots.
 *
 * The process starts by declaring a slots type, which can contain required or optional slots. It looks like this:
 * ```ts
 * export type ExampleSlots = {
 *   root: Slot<View>;
 *   content: Slot<Text>;
 *   optional: OptionalSlot<Image>;
 * }
 * ```
 *
 * Slots are declared from component types though they don't have to be real component types. The type deterines how the slot can be referenced
 * internally in terms of component type and props. To give more flexibility, the slot type can be an acceptance type with a reduced set of props.
 * For instance:
 * ```ts
 * export type AcceptanceProps = Pick<ViewProps, 'children' | 'style'>;
 * export type ExampleSlots = {
 *   demo: Slot<React.ComponentType<AcceptanceProps>>;
 * }
 * ```
 *
 * This will allow the slot to be used with any component that shares the ViewProps children and style props but it will limit the props that can
 * be passed to the slot to just those two props.
 */

/**
 * Declaration helper that adds null as a sentinel for optionality.
 *
 * Unlike Fluent UI React's web slots, React Native slots accept component types rather than intrinsic
 * element names. The web implementation's string-union validation therefore does not apply here.
 */
type DeclareSlot<Type extends AnyComponent> = Type | null;

/**
 * Declare a required slot for a component, removing the null sentinal type
 */
export type Slot<Type extends AnyComponent> = NonNullable<DeclareSlot<Type>>;

/**
 * Declare an optional slot for a component
 */
export type OptionalSlot<Type extends AnyComponent> = DeclareSlot<Type>;

/**
 * Next the non-root slots are added to the component props. So if you have a text slot called 'content' in your slots type,
 * the outer component props will pick up a prop called content. This prop will be a union type which can be:
 *  - The props type of the component type, with an added optional 'as' prop which allows the component type to be overridden.
 *  - A shorthand value which will be of the type of the children prop of the component.
 *
 * So for a content slot of type Slot<Text> the following would all be valid:
 * ```tsx
 * <Example content="Hello" />
 * <Example content={<Text>Hello</Text>} />
 * <Example content={{ style: { color: 'red' } }} />
 * <Example content={{ as: MyText, children: "Hello World" }} />
 * ```
 */

/**
 * The shorthand value of a slot allows specifying its child. In essence this type is a union of all the possible types
 * that can be used as children in React, including React elements, strings, numbers, iterables of React nodes, and React portals.
 */
export type SlotShorthandValue = React.ReactElement | string | number | Iterable<React.ReactNode> | React.ReactPortal;

/**
 * Helper type for {@link Slot}. Adds shorthand types that are assignable to the slot's `children`. This extracts the types from the
 * SlotShorthandValue type that are assignable to the slot's children prop type. If the slot's children prop type is not assignable to any of the
 * SlotShorthandValue types, then the slot's children prop type is used as the shorthand type.
 */
type WithSlotShorthandValue<Props> = Props | ('children' extends keyof Props ? Extract<SlotShorthandValue, Props['children']> : never);

/** strip null and undefined from the {@link Slot} type then infer the props of the remaining type */
type PropsOfSlot<T extends AnyComponent | null> = PropsOf<NonNullable<T>>;

/**
 * Declare a slot prop for a component from a component type. This is the type of the prop added to the outer component props.
 */
export type SlotProp<Type extends AnyComponent> = WithSlotShorthandValue<PropsOf<Type>> | ({ as?: Type } & PropsOf<Type>);

/**
 * Maps a declared slot component to its public prop type, preserving null for optional slots.
 */
type SlotToComponentProp<Type extends AnyComponent | null> = null extends Type
  ? OptionalSlotProp<NonNullable<Type>>
  : SlotProp<NonNullable<Type>>;

/**
 * Maps the slot props type, which is a record of component types, to a record of the props types for each non-root slot.
 * The root slot is not included in the outer component props, so it is omitted from this type.
 */
type NonRootSlotPropsToComponentProps<Slots extends SlotPropsRecord> = {
  [K in Exclude<keyof Slots, 'root'>]?: SlotToComponentProp<Slots[K]>;
};

/**
 * Matches component Slots type, that defines the shape of the slots object that is passed to the component. This is used
 * as an acceptance type for the slots helper functions and is not used directly in the component props or state.
 * @internal
 */
export type SlotPropsRecord = Record<string, AnyComponent | null>;

/**
 * Build the base of the component props from the slots type, this will:
 * - Add the props for the root slot inline as the component props
 * - Add slot props for all non-root slots, which will be optional
 *
 * The root props can be overridden by the user if they want to use a different component type for the outer component.
 */
export type ComponentProps<
  Slots extends SlotPropsRecord,
  RootProps = PropsOfSlot<Slots['root']>,
> = NonRootSlotPropsToComponentProps<Slots> & RootProps;

/**
 * Removes SlotShorthandValue and null from the slot type, then removing as to get the props type of the slot component.
 * This effectively maps from the slot prop type to the actual props interface of the slot component.
 */
export type ExtractSlotProps<S> = Omit<Exclude<S, SlotShorthandValue | null | undefined>, 'as'>;

export type OptionalSlotProp<Type extends AnyComponent> = SlotProp<Type> | null;

/**
 * If the base slot type includes null, remove it and translate it to an optional state entry. Otherwise
 * it will be a required state entry. This is more deterministic than using undefined as a sentinal for optionality,
 * which can be ambiguous in some cases.
 * @internal
 */
type RequiredOrOptionalSlot<T extends AnyComponent | null> = [null] extends [T]
  ? SlotComponent<PropsOfSlot<T>> | undefined
  : SlotComponent<PropsOfSlot<T>>;

/**
 * The state object for the component that contains slot information, derived from the slot record type. Slots that
 * are declared as optional will be optional in the state object, while required slots will be required in the state object.
 * This is used to build the state object for the component that contains the resolved slot components and their props.
 */
export type ComponentState<Slots extends SlotPropsRecord> = {
  [K in keyof Slots]: RequiredOrOptionalSlot<Slots[K]>;
};
