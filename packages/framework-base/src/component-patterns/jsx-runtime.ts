import type React from 'react';
import * as ReactJSX from 'react/jsx-runtime';
import { renderForJsxRuntime } from './render';

export function jsx(type: React.ElementType, props: React.PropsWithChildren<unknown>, key?: React.Key): React.ReactElement {
  return renderForJsxRuntime(type, props, key, ReactJSX.jsx);
}

export function jsxs(type: React.ElementType, props: React.PropsWithChildren<unknown>, key?: React.Key): React.ReactElement {
  return renderForJsxRuntime(type, props, key, ReactJSX.jsxs);
}

export { Fragment } from 'react/jsx-runtime';
