import * as React from 'react';

import type { NativeReactType, SlotFn } from './renderSlot';

/**
 * JSX runtime implementation for React 17+ that provides automatic slot rendering.
 *
 * This implementation replaces the need for withSlots pragma by providing
 * jsx and jsxs functions that automatically handle slot rendering.
 *
 * To use this runtime, configure your tsconfig.json or babel config:
 *
 * For TypeScript (tsconfig.json):
 * ```json
 * {
 *   "compilerOptions": {
 *     "jsx": "react-jsx",
 *     "jsxImportSource": "@fluentui-react-native/use-slot"
 *   }
 * }
 * ```
 *
 * For per-file usage, add this comment at the top of your file:
 * ```tsx
 * /** @jsxImportSource @fluentui-react-native/use-slot *\/
 * ```
 */

/**
 * Properties for JSX elements
 */
interface JSXProps {
  key?: React.Key | null;
  ref?: React.Ref<any>;
  children?: React.ReactNode;
  [prop: string]: any;
}

/**
 * JSX runtime function for single child elements
 *
 * @param type - The component type or element type
 * @param props - The properties for the element
 * @param key - Optional key for the element
 * @returns The rendered React element
 */
export function jsx<P extends JSXProps>(
  type: NativeReactType | SlotFn<P>,
  props: P,
  key?: React.Key,
): React.ReactElement<P> | React.ReactNode {
  const finalProps = key !== undefined ? { ...props, key } : props;

  // Check if this is a slot function that can be composed
  if (typeof type === 'function' && (type as SlotFn<P>)._canCompose) {
    // Call the slot function directly - this may return ReactNode
    const result = (type as SlotFn<P>)(finalProps);
    return result as React.ReactElement<P>;
  }

  // For regular components and elements, use React.createElement
  return React.createElement(type, finalProps);
}

/**
 * JSX runtime function for elements with static children
 *
 * @param type - The component type or element type
 * @param props - The properties for the element
 * @param key - Optional key for the element
 * @returns The rendered React element
 */
export function jsxs<P extends JSXProps>(
  type: NativeReactType | SlotFn<P>,
  props: P,
  key?: React.Key,
): React.ReactElement<P> | React.ReactNode {
  // jsxs is used for elements with static children, but the logic is the same
  return jsx(type, props, key);
}

/**
 * Creates a React Fragment
 *
 * @param props - Fragment props containing children and optional key
 * @returns A React Fragment element
 */
export function Fragment(props: { children?: React.ReactNode; key?: React.Key }): React.ReactElement {
  return React.createElement(React.Fragment, props.key ? { key: props.key } : null, props.children);
}

// Re-export types that might be needed
export type { JSXProps };
