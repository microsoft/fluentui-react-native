import type React from 'react';
import * as ReactJSX from 'react/jsx-runtime';
import { getJsxCustomRender } from './component-patterns/render';

export function jsx(type: React.ElementType, props: React.PropsWithChildren<unknown>, key?: React.Key): React.ReactElement {
  const customRender = getJsxCustomRender(type, props, key);
  if (customRender) {
    return customRender();
  }
  return ReactJSX.jsx(type, props, key);
}

export function jsxs(type: React.ElementType, props: React.PropsWithChildren<unknown>, key?: React.Key): React.ReactElement {
  const customRender = getJsxCustomRender(type, props, key);
  if (customRender) {
    return customRender();
  }
  return ReactJSX.jsxs(type, props, key);
}
