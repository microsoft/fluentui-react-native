import React from 'react';
import * as ReactJSX from 'react/jsx-runtime';
import type { RenderType, RenderResult, SlotComponent, PropsTransform } from '../types/render.types';
import { isDirectComponentType, renderDirectComponent } from './direct';
import { isSlotComponent, prepareSlotProps, setSlotStatics } from './slot';
import { SLOT_COMPONENT_KEY } from '../const';
import { getPropsChildren, setPropsChildren } from '../utilities/typeUtils';

export type CustomRender = () => RenderResult;

/**
 * Root jsx render function, used for both jsx and jsxs calls. This handles all of our custom rendering patterns
 * and slot components.
 * @param type the component type to render
 * @param props the props for the component
 * @param key optional key for the component, this is parallel to props and injected at the framework level
 * @param jsxFn optional jsx function to use for rendering, set when called by _jsx, _jsxs but will auto-detect for non-framework callers
 */
export function renderForJsxRuntime<TProps>(
  type: React.ElementType,
  props: TProps,
  key?: React.Key,
  jsxFn?: typeof ReactJSX.jsx,
): RenderResult {
  // If the type is a direct component type, render it directly
  if (isDirectComponentType(type)) {
    const jsxResult = renderDirectComponent(type, props);
    // If a key is provided, clone the element with the key
    return key != null ? React.cloneElement(jsxResult, { key }) : jsxResult;
  }

  // with a slot component use the internal type and props to render directly
  if (isSlotComponent<TProps>(type)) {
    const slotType = type[SLOT_COMPONENT_KEY];
    const slotProps = prepareSlotProps(type, props);
    // now re-enter with the inner type to handle direct/etc
    return renderForJsxRuntime(slotType, slotProps, key, jsxFn);
  }

  // auto-detect whether to use jsx or jsxs based on number of children, 0 or 1 = jsx, more than 1 = jsxs
  if (!jsxFn) {
    if (React.Children.count(getPropsChildren(props)) > 1) {
      jsxFn = ReactJSX.jsxs;
    } else {
      jsxFn = ReactJSX.jsx;
    }
  }

  // now call the appropriate jsx function to render the component
  return jsxFn(type, props, key);
}

/**
 * Public signature to render a component as appropriate with our internal runtime.
 * @param type the component type to render
 * @param props the props for the component
 * @return the rendered result, either a React element or a custom render result
 */
export function renderJsx<TProps>(type: React.ElementType, props: TProps): RenderResult {
  return renderForJsxRuntime(type, props);
}

/**
 * Creates a slot component with the given base component, props, and options. Implemented here as it needs to call
 * the renderForJsxFunction directly.
 * @param component inner component type
 * @param props props targeting that component
 * @param transform optional transform function for the slot
 * @return a slot component
 */
export function createSlotComponent<TProps>(
  component: React.ComponentType<TProps>,
  props: Partial<TProps>,
  transform?: PropsTransform<TProps>,
): SlotComponent<TProps> {
  const slot: SlotComponent<TProps> = Object.assign(
    (props: TProps) => {
      props = prepareSlotProps(slot, props);
      return renderForJsxRuntime(component, props);
    },
    setSlotStatics<TProps>({}, component, props, transform),
  );
  return slot;
}

/**
 * Render signature matching the old createElement pattern from the pre-jsx runtime. Will call through to the new runtime.
 */
export function renderForClassicRuntime<TProps>(type: RenderType, props: TProps, children: React.ReactNode[]): RenderResult {
  // route this through to the new runtime
  const propsWithChildren = setPropsChildren({ ...props }, children);
  return renderForJsxRuntime(type as React.ElementType, propsWithChildren);
}

export const renderSlot = renderForClassicRuntime;
