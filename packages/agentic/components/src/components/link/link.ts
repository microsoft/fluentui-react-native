import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import type { LinkProps } from './link.types';
import { renderLink_unstable } from './renderLink';
import { useLink_unstable } from './useLink';
import { useLinkStyles_unstable } from './useLinkStyles';

export const Link = phasedComponent<LinkProps>((props) => {
  const state = useLink_unstable(props);
  useLinkStyles_unstable(state);
  return directComponent<LinkProps>(() => renderLink_unstable(state));
});

Link.displayName = 'Link';

export default Link;
