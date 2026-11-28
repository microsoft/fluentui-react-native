import type { NavProps } from './nav.types';
import { renderNav_unstable } from './renderNav';
import { useNav_unstable } from './useNav';
import { useNavStyles_unstable } from './useNavStyles';

export const Nav = (props: NavProps) => {
  const state = useNav_unstable(props);
  useNavStyles_unstable(state);
  return renderNav_unstable(state);
};
Nav.displayName = 'Nav';
