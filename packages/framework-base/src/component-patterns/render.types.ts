import type React from 'react';
import type ReactJSX from 'react/jsx-runtime';

/**
 * Base types for rendering components in a react application, extracted from react types
 */
export type RenderResult = ReturnType<typeof ReactJSX.jsx>;
export type RenderType = Parameters<typeof ReactJSX.jsx>[0] | string;

/**
 * The standard element type inputs for react and react-native. This might be View or Button, or it might be 'div' in web. Effectively
 * it is what react accepts for React.createElement
 */
export type NativeReactType = RenderType;

/**
 * Get the props from a react component type
 */
export type PropsOf<TComponent> = TComponent extends React.JSXElementConstructor<infer P> ? P : never;

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
 * type of the render function, not a FunctionComponent to help prevent hook usage
 */
export type FunctionComponentCore<TProps> = (props: TProps) => RenderResult;

/**
 * A function component that returns an element type. This allows for the empty call props usage for native
 * components, as well as handles the returns of React components.
 */
export type FunctionComponent<TProps> = FunctionComponentCore<TProps> & {
  displayName?: string;
};

/**
 * The full component definition that has the attached properties to allow the jsx handlers to render it directly.
 */
export type DirectComponent<TProps> = FunctionComponentCore<TProps> & {
  displayName?: string;
  _callDirect?: boolean;
};

type LegacyComponentFunction<TProps> = (props: TProps, ...children: React.ReactNode[]) => RenderResult;

/**
 * Legacy slot function type, this allows the rendering handlers to bypass the normal JSX rendering and call the function
 * directly. This expects the function to have children as the last argument of the call which isn't consistent with standard
 * react usage, where children are passed as a prop. If writing new components use the DirectComponent type instead.
 * @deprecated use DirectComponent instead
 */
export type LegacyDirectComponent<TProps> = LegacyComponentFunction<TProps> & {
  _canCompose?: boolean;
};

/**
 * Slot function type used in the composition framework. Slot functions return React elements (not arbitrary ReactNode values)
 * since they always either call staged render functions or React.createElement.
 */
export type SlotFn<TProps> = {
  (props: TProps, ...children: React.ReactNode[]): React.ReactElement | null;
  _canCompose?: boolean;
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
 * Phased render function signature. This is the recommended pattern for components that need hooks.
 *
 * Phase 1 receives props (without children) and can use hooks to compute derived state.
 * Phase 2 returns a component that will be called with props including children.
 *
 * Children will be passed as part of the props for component rendering. The `children` prop will be
 * automatically inferred and typed correctly by the prop type.
 */
export type PhasedRender<TProps> = (props: TProps) => React.ComponentType<React.PropsWithChildren<TProps>>;

/**
 * Component type for a component that can be rendered in two phases, with the attached phased render function.
 * Use phasedComponent() to create these.
 */
export type PhasedComponent<TProps> = FunctionComponent<TProps> & {
  _phasedRender?: PhasedRender<TProps>;
};
/**
 * The final rendering of the props in a phased render. This is the function component signature that matches that of
 * React.createElement, children (if present) will be part of the variable args at the end.
 */
export type FinalRender<TProps> = (props: TProps, ...children: React.ReactNode[]) => React.JSX.Element | null;

/**
 * Legacy staged render function signature.
 * @deprecated Use PhasedRender instead. This older pattern splits children from props which is inconsistent with React conventions.
 */
export type StagedRender<TProps> = (props: TProps, ...args: any[]) => FinalRender<TProps>;

/**
 * Legacy component type that uses the staged render pattern.
 * @deprecated Use PhasedComponent instead. Create with phasedComponent() rather than stagedComponent().
 */
export type ComposableFunction<TProps> = FunctionComponent<TProps> & { _staged?: StagedRender<TProps> };

/**
 * A type aggregating all the custom types that can be used in the render process.
 * @internal only used in this package, should not be exported
 */
export type AnyCustomType<TProps> =
  | React.FunctionComponent<TProps>
  | DirectComponent<TProps>
  | PhasedComponent<TProps>
  | ComposableFunction<TProps>
  | LegacyDirectComponent<TProps>;
