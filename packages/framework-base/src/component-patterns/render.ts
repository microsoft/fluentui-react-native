import React from 'react';
import * as ReactJSX from 'react/jsx-runtime';
import type { RenderType, RenderResult, DirectComponent, LegacyDirectComponent } from './render.types';

export type CustomRender = () => RenderResult;

export function asDirectComponent<TProps>(type: RenderType): DirectComponent<TProps> | undefined {
  if (typeof type === 'function' && (type as DirectComponent<TProps>)._callDirect) {
    return type as DirectComponent<TProps>;
  }
  return undefined;
}

function asLegacyDirectComponent<TProps>(type: RenderType): LegacyDirectComponent<TProps> | undefined {
  if (typeof type === 'function' && (type as LegacyDirectComponent<TProps>)._canCompose) {
    return type as LegacyDirectComponent<TProps>;
  }
  return undefined;
}

export function renderForJsxRuntime<TProps>(
  type: React.ElementType,
  props: React.PropsWithChildren<TProps>,
  key?: React.Key,
  jsxFn: typeof ReactJSX.jsx = undefined,
): RenderResult {
  const legacyDirect = asLegacyDirectComponent(type);
  if (legacyDirect) {
    const { children, ...rest } = props;
    const newProps = { ...rest, key };
    return legacyDirect(newProps, ...React.Children.toArray(children)) as RenderResult;
  }
  const directComponent = asDirectComponent<TProps>(type);
  if (directComponent) {
    const newProps = { ...props, key };
    return directComponent(newProps);
  }

  // auto-detect whether to use jsx or jsxs based on number of children, 0 or 1 = jsx, more than 1 = jsxs
  if (!jsxFn) {
    if (React.Children.count(props.children) > 1) {
      jsxFn = ReactJSX.jsxs;
    } else {
      jsxFn = ReactJSX.jsx;
    }
  }
  // now call the appropriate jsx function to render the component
  return jsxFn(type, props, key);
}

export function renderForClassicRuntime<TProps>(type: RenderType, props: TProps, ...children: React.ReactNode[]): RenderResult {
  // if it is a non-string type with _canCompose set just call the function directly, otherwise call createElement as normal
  const propsWithChildren = { children, ...props };
  return renderForJsxRuntime(type as React.ElementType, propsWithChildren);
}

export const renderSlot = renderForClassicRuntime;
