import type React from 'react';
//import type ReactJSX from 'react/jsx-runtime';
import type { FurnJSX } from '../jsx-namespace.ts';
import { SLOT_COMPONENT_KEY, SLOT_RENDER_TYPE_KEY, SLOT_PROPS_KEY, SLOT_PROP_TRANSFORM_KEY } from '../const.ts';
import type { PropsWithoutChildren } from './props.types.ts';

/**
 * Base types for rendering components in a react application, extracted from react types.
 *
 * Note that our FurnJSX types will resolve to the correct types based on React 18 or 19,
 * ensuring compatibility across different versions of React. Changes in the way JSX is defined between versions
 * will cause breaks without using this indirection.
 */
export type RenderResult = FurnJSX.Element;
export type RenderType = FurnJSX.ElementType;

/**
 * type of the render function, not a FunctionComponent to help prevent hook usage
 */
export type FunctionComponent<TProps> = {
  (props: TProps): RenderResult;
  displayName?: string;
};

export type CustomRenderType =
  | 'callable' // A function that can be called directly to bypass a level of indirection
  | 'legacy' // A function that can be called directly, but with children as a rest parameter
  | 'phased' // A function that is called in phases, first during the hook phase and then during the render phase
  | 'phased-legacy'; // A function that is called in phases, but with the legacy signature

/**
 * DIRECT RENDERING
 *
 * This is a pattern where a function can by called directly to render a component, bypassing creating additional layers of the
 * rendering tree. This is useful for higher order components that mainly need to do simple prop manipulation but want to
 * compartmentalize the logic.
 *
 * Note that for this to be safe, hooks cannot be used in the function. This is the reason why function component is redefined,
 * to help linting tools catch bad usage.
 *
 * The newer DirectComponent type should be used, as it will handle children consistently.
 */

/**
 * The newer direct component type. Effectively a function component with an extra static marking it as callable
 */
export type DirectComponent<TProps> = FunctionComponent<TProps> & {
  [SLOT_RENDER_TYPE_KEY]: Extract<CustomRenderType, 'callable'>;
};

/**
 * A legacy function component is a function that can be called with props and children, but the children are passed as a rest parameter.
 * This is a legacy pattern and should be avoided in new code.
 * @deprecated
 */
export type LegacyFunctionComponent<TProps> = {
  (props: TProps, ...children: React.ReactNode[]): RenderResult;
  displayName?: string;
};

/**
 * The legacy direct callable component type, which is used to mark function components as being directly callable, as well
 * as being used to render across a hook phase and a render phase safely. This was effectively a perpetuated error as the
 * correct signature should have children as a part of props at the component level.
 * @deprecated
 */
export type LegacyDirectComponent<TProps> = LegacyFunctionComponent<TProps> & {
  [SLOT_RENDER_TYPE_KEY]: Extract<CustomRenderType, 'legacy'>;
};

/**
 * PHASED RENDERING (formerly called "staged" or "two-stage" rendering)
 *
 * The above direct rendering pattern is useful for simple components, but it does not allow for hooks or complex logic. The phased render pattern allows
 * for a component to be rendered in two phases, allowing for hooks to be used in the first phase and then the second phase to be a simple render function that can
 * be called directly.
 *
 * In code that respects the pattern, the first phase will be called with props (though children will not be present) and will return a function that will be called
 * with additional props, this time with children present. This allows for the first phase to handle all the logic and hooks, while the second phase can be a simple render function
 * that can leverage direct rendering if supported.
 *
 * The component itself will be a FunctionComponent, but it will have an attached property that is the phased render function. This allows the component to be used in two
 * parts via the useSlot hook, or to be used directly in JSX/TSX as a normal component.
 */

/**
 * Phased component signature, it can be rendered as a standard component, but if combined with the useSlots
 * hook, the hook routines for the component can be called returning an inner component that may be directly
 * rendered.
 *
 * For this type of component, the returned inner component can be of any type.
 */
export type PhasedComponent<TProps> = FunctionComponent<TProps> & {
  [SLOT_COMPONENT_KEY]: (props: Partial<TProps>) => React.ComponentType<TProps>;
  [SLOT_RENDER_TYPE_KEY]: Extract<CustomRenderType, 'phased'>;
};

/**
 * Legacy pattern which returns a legacy direct component.
 * @deprecated use the newer phasedComponent pattern for new code
 */
export type StagedComponent<TProps> = FunctionComponent<TProps> & {
  [SLOT_COMPONENT_KEY]: (props: PropsWithoutChildren<Partial<TProps>>) => LegacyFunctionComponent<TProps>;
  [SLOT_RENDER_TYPE_KEY]: Extract<CustomRenderType, 'phased-legacy'>;
};

/**
 * SLOT COMPONENT
 *
 * These are designed to be closely aligned with the newer Fluent slot patterns. In essence a Slot is a valid component
 * which contains:
 * - An React component or element type that will be used to render the slot.
 * - Optional attached props for the slot, these will be merged with the props passed in during rendering.
 * - Optional props transformation function, this can be used to do things like filtering or making final modifications to the props before they are passed to the inner component.
 */
export type SlotComponent<TProps> = FunctionComponent<TProps> & {
  /**
   * This is the inner component type used to render the slot.
   */
  [SLOT_COMPONENT_KEY]: React.ComponentType<TProps>;

  /**
   * Optional attached props for the slot, these will be merged with the props passed in during rendering.
   */
  [SLOT_PROPS_KEY]: Partial<TProps>;

  /**
   * Optional props transformation function, this can be used to do things like filtering or making final
   * modifications to the props before they are passed to the inner component.
   */
  [SLOT_PROP_TRANSFORM_KEY]?: (props: TProps) => TProps;
};

export type PropsTransform<TPropsIn, TPropsOut = TPropsIn> = (props: TPropsIn) => TPropsOut;

/**
 * useSlot hook signature, here to make overloads easier to understand
 * - overload 1 handles the case where all required props are provided, in this case the component accepts partial props
 * - overload 2 handles the case where required props are missing, in this case they must be passed to the jsx
 */
export type UseSlot = {
  /**
   * First overload: fulfilled props
   * - either no required props or all required props (except children) satisfied
   * - result is a component that has partial props so there is no need to provide them again in jsx
   */
  <TProps>(component: React.ComponentType<TProps>, props: TProps, transform?: PropsTransform<TProps>): SlotComponent<Partial<TProps>>;
  /**
   * Second overload: non-children props not fulfilled
   * - result is a component that requires all required props to be provided in the jsx
   */
  <TProps>(component: React.ComponentType<TProps>, props: Partial<TProps>, transform?: PropsTransform<TProps>): SlotComponent<TProps>;
};

/**
 * useOptionalSlot signature, adds the ability for the component to be null or undefined
 * - if so will return null for the slot
 */
export type UseOptionalSlot = {
  /**
   * Third overload: component type is undefined or null
   * - result is a null return result
   */
  <TProps>(
    component: React.ComponentType<TProps> | undefined | null,
    props: TProps,
    transform?: PropsTransform<TProps>,
  ): SlotComponent<Partial<TProps>> | null;
  <TProps>(
    component: React.ComponentType<TProps> | undefined | null,
    props: Partial<TProps>,
    transform?: PropsTransform<TProps>,
  ): SlotComponent<TProps> | null;
};
