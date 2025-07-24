import React from 'react';
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

export function getJsxCustomRender<TProps>(
  type: RenderType,
  props: React.PropsWithChildren<TProps>,
  key?: React.Key,
): CustomRender | undefined {
  const legacyDirect = asLegacyDirectComponent(type);
  if (legacyDirect) {
    const { children, ...rest } = props;
    const newProps = { ...rest, key };
    return () => legacyDirect(newProps, ...React.Children.toArray(children)) as RenderResult;
  }
  const directComponent = asDirectComponent<TProps>(type);
  if (directComponent) {
    const newProps = { ...props, key };
    return () => directComponent(newProps);
  }
  return undefined;
}

export function getClassicCustomRender<TProps>(type: RenderType, props: TProps, children?: React.ReactNode[]): CustomRender | undefined {
  const legacyDirect = asLegacyDirectComponent(type);
  if (legacyDirect) {
    return () => legacyDirect(props, ...children) as RenderResult;
  }
  const directComponent = asDirectComponent(type);
  if (directComponent) {
    const newProps = { ...props, children };
    return () => directComponent(newProps);
  }
  return undefined;
}
