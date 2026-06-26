import type { FunctionComponent, RenderResult } from './components';
import { FurnJSX } from '../jsx-namespace';
import { RENDER_CAN_COMPOSE, RENDER_STAGED } from './constants';

/**
 * General type definitions for using the original v0 deprecated framework.
 *
 * All definitions in this file should be marked as deprecated with the @deprecated JSDoc tag.
 */

/**
 * Intermediate type for legacy component functions. This is wrong because it doesn't properly handle the children as a prop.
 * @deprecated use FunctionComponent instead
 */
type LegacyComponentFunction<TProps> = (props: TProps, ...children: React.ReactNode[]) => RenderResult;

/**
 * Legacy slot function type, this allows the rendering handlers to bypass the normal JSX rendering and call the function
 * directly. This expects the function to have children as the last argument of the call which isn't consistent with standard
 * react usage, where children are passed as a prop. If writing new components use the DirectComponent type instead.
 * @deprecated use DirectComponent instead
 */
export type LegacyDirectComponent<TProps> = LegacyComponentFunction<TProps> & {
  [RENDER_CAN_COMPOSE]?: boolean;
};

/**
 * Legacy staged render function signature.
 * @deprecated Use PhasedRender instead. This older pattern splits children from props which is inconsistent with React conventions.
 */
export type StagedRender<TProps> = (props: TProps, ...args: any[]) => FinalRender<TProps>;

/**
 * Legacy component type that uses the staged render pattern.
 * @deprecated Use PhasedComponent instead. Create with phasedComponent() rather than stagedComponent().
 */
export type ComposableFunction<TProps> = FunctionComponent<TProps> & { [RENDER_STAGED]?: StagedRender<TProps> };

/**
 * The final rendering of the props in a phased render. This is the function component signature that matches that of
 * React.createElement, children (if present) will be part of the variable args at the end.
 * @deprecated Use the standard FunctionComponent type instead or the phasedRender pattern
 */
export type FinalRender<TProps> = (props: TProps, ...children: React.ReactNode[]) => FurnJSX.Element | null;

/**
 * Slot function type used in the composition framework. Slot functions return React elements (not arbitrary ReactNode values)
 * since they always either call staged render functions or React.createElement.
 * @deprecated
 */
export type SlotFn<TProps> = {
  (props: TProps, ...children: React.ReactNode[]): React.ReactElement | null;
  [RENDER_CAN_COMPOSE]?: boolean;
};
