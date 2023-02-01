import React from 'react';
import type { MenuContextValue } from '../context/menuContext';
import type { MenuState } from './Menu.types';

export const useMenuContextValue = (state: MenuState): MenuContextValue => {
  const [triggerHoverOutTimer, setTriggerHoverOutTimer] = React.useState<NodeJS.Timeout | undefined>();
  const [popoverHoverOutTimer, setPopoverHoverOutTimer] = React.useState<NodeJS.Timeout>();
  return { ...state, popoverHoverOutTimer, triggerHoverOutTimer, setPopoverHoverOutTimer, setTriggerHoverOutTimer };
};
