import React from 'react';
import { MenuContextValue } from '../context/menuContext';
import { MenuState } from './Menu.types';

export const useMenuContextValue = (state: MenuState): MenuContextValue => {
  const [triggerHoverOutTimer, setTriggerHoverOutTimer] = React.useState<NodeJS.Timeout | undefined>();
  const [popoverHoverOutTimer, setPopoverHoverOutTimer] = React.useState<NodeJS.Timeout>();
  return { ...state, popoverHoverOutTimer, triggerHoverOutTimer, setPopoverHoverOutTimer, setTriggerHoverOutTimer };
};
