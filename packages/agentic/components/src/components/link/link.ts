import type { LinkProps } from './link.types';
import { renderLink_unstable } from './renderLink';
import { useLink_unstable } from './useLink';
import { useLinkStyles_unstable } from './useLinkStyles';

export const Link = (props: LinkProps) => {
  const state = useLink_unstable(props);
  useLinkStyles_unstable(state);
  return renderLink_unstable(state);
};
Link.displayName = 'Link';
