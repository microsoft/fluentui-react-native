import { createContext } from 'react';

import type { OverflowContextType } from './Overflow.types';

const noop = () => null;

export const OverflowContext = createContext<OverflowContextType>({
  itemVisibility: {},
  hasOverflow: false,
  registerItem: noop,
  updateOverflow: noop,
});
