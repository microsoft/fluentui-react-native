import type React from 'react';
import type { FunctionComponentCore, FunctionComponent } from './components';
import { RENDER_CAN_CALL_DIRECT, RENDER_PHASED } from './constants';

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
 * The full component definition that has the attached properties to allow the jsx handlers to render it directly.
 */
export type DirectComponent<TProps> = FunctionComponentCore<TProps> & {
  displayName?: string;
  [RENDER_CAN_CALL_DIRECT]?: boolean;
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
export type PhasedRender<TProps> = (props: TProps) => React.ComponentType<TProps>;

/**
 * Component type for a component that can be rendered in two phases, with the attached phased render function.
 * Use phasedComponent() to create these.
 */
export type PhasedComponent<TProps> = FunctionComponent<TProps> & {
  [RENDER_PHASED]?: PhasedRender<TProps>;
};
