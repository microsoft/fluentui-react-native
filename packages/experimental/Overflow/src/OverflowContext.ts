import { createContext, useContext } from 'react';

import type { OverflowState } from './Overflow/Overflow.types';

const noop = () => null;

export const OverflowContext = createContext<OverflowState>({
  hasOverflow: false,
  initialOverflowLayoutDone: false,
  itemVisibility: {},
  setLayoutState: noop,
  updateOverflow: noop,
  updateItem: noop,
  updateMenuSize: noop,
});

export const useOverflowContext = () => useContext(OverflowContext);
