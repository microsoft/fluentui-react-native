import { createContext, useContext } from 'react';

import type { OverflowState } from './Overflow/Overflow.types';

const noop = () => null;

export const OverflowContext = createContext<OverflowState>({
  containerSize: undefined,
  hasOverflow: false,
  initialOverflowLayoutDone: false,
  itemVisibility: {},
  register: noop,
  disconnect: noop,
  setLayoutState: noop,
  updateOverflow: noop,
  updateItem: noop,
  updateMenuSize: noop,
});

export const useOverflowContext = () => useContext(OverflowContext);
