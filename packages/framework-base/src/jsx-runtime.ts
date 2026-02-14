import type React from 'react';
import * as ReactJSX from 'react/jsx-runtime';
import { renderForJsxRuntime } from './component-patterns/render';
export type { FurnJSX as JSX } from './jsx-namespace';

export const jsx: typeof ReactJSX.jsx = (type, props, key?: React.Key) => {
  return renderForJsxRuntime(type, props, key, ReactJSX.jsx);
};

export const jsxs: typeof ReactJSX.jsxs = (type, props, key?: React.Key) => {
  return renderForJsxRuntime(type, props, key, ReactJSX.jsxs);
};

// Re-export Fragment for <></> syntax
export { Fragment } from 'react/jsx-runtime';
