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
export type DirectComponentFunction<TProps> = (props: TProps) => RenderResult;

/**
 * The full component definition that has the attached properties to allow the jsx handlers to render it directly.
 */
export type DirectComponent<TProps> = DirectComponentFunction<TProps> & {
  displayName?: string;
  _callDirect?: boolean;
};

/**
 * Legacy slot function type, this allows the rendering handlers to bypass the normal JSX rendering and call the function
 * directly. This expects the function to have children as the last argument of the call which isn't consistent with standard
 * react usage, where children are passed as a prop. If writing new components use the DirectComponent type instead.
 * @deprecated use DirectComponent instead
 */
export type LegacyDirectComponent<TProps> = React.FunctionComponent<TProps> & {
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
 * MULTI-STAGE RENDERING
 *
 * The above direct rendering pattern is useful for simple components, but it does not allow for hooks or complex logic. The staged render pattern allows
 * for a component to be rendered in two stages, allowing for hooks to be used in the first stage and then the second stage to be a simple render function that can
 * be called directly.
 *
 * In code that respects the pattern the first stage will be called with props (though children will not be present) and will return a function that will be called
 * with additional props, this time with children present. This allows for the first stage to handle all the logic and hooks, while the second stage can be a simple render function
 * that can leverage direct rendering if supported.
 *
 * The component itself will be a FunctionComponent, but it will have an attached property that is the staged render function. This allows the component to be used in two
 * parts via the useSlot hook, or to be used directly in JSX/TSX as a normal component.
 */

/**
 * This is an updated version of the staged render that handles children and types more consistently. Generally children
 * will be passed as part of the props for component rendering, it is inconsistent to have them as a variable argument.
 *
 * The `children` prop will be automatically inferred and typed correctly by the prop type. Hooks are still expected
 */
export type PhasedRender<TProps> = (props: TProps) => React.ComponentType<React.PropsWithChildren<TProps>>;

/**
 * Component type for a component that can be rendered in two stages, with the attached render function.
 */
export type PhasedComponent<TProps> = React.FunctionComponent<TProps> & {
  _phasedRender?: PhasedRender<TProps>;
};
/**
 * The final rendering of the props in a staged render. This is the function component signature that matches that of
 * React.createElement, children (if present) will be part of the variable args at the end.
 */
export type FinalRender<TProps> = (props: TProps, ...children: React.ReactNode[]) => React.JSX.Element | null;

/**
 * Signature for a staged render function.
 * @deprecated Use TwoStageRender instead
 */
export type StagedRender<TProps> = (props: TProps, ...args: any[]) => FinalRender<TProps>;

/**
 * Signature for a component that uses the staged render pattern.
 * @deprecated Use TwoStageRender instead
 */
export type ComposableFunction<TProps> = React.FunctionComponent<TProps> & { _staged?: StagedRender<TProps> };

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
