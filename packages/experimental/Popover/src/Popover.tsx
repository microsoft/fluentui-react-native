/** @jsxImportSource @fluentui-react-native/framework-base */
import type { UseTokens } from '@fluentui-react-native/framework';
import { compressible, buildUseTokens } from '@fluentui-react-native/framework';

import type { PopoverProps, PopoverTokens } from './Popover.types';
import { popoverName } from './Popover.types';

const usePopoverTokens = buildUseTokens<PopoverTokens>(() => ({}), popoverName);

export const Popover = compressible<PopoverProps, PopoverTokens>((_props: PopoverProps, _useTokens: UseTokens<PopoverTokens>) => {
  return () => {
    return null;
  };
}, usePopoverTokens);
Popover.displayName = popoverName;

export default Popover;
