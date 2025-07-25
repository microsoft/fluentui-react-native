import React from 'react';
import * as ReactJSX from 'react/jsx-runtime';
import type { RenderType, RenderResult, DirectComponent, LegacyDirectComponent } from './render.types';

export type CustomRender = () => RenderResult;

function asDirectComponent<TProps>(type: RenderType): DirectComponent<TProps> | undefined {
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
  jsxFn: typeof ReactJSX.jsx = ReactJSX.jsx,
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
  return jsxFn(type, props, key);
}

export function renderForClassicRuntime<TProps>(type: RenderType, props: TProps, ...children: React.ReactNode[]): RenderResult {
  const legacyDirect = asLegacyDirectComponent(type);
  if (legacyDirect) {
    return legacyDirect(props, ...children) as RenderResult;
  }
  const directComponent = asDirectComponent(type);
  if (directComponent) {
    const newProps = { ...props, children };
    return directComponent(newProps);
  }
  return React.createElement(type, props, ...children);
}

export const renderSlot = renderForClassicRuntime;
