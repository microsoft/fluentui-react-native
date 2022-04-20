/** @jsx withSlots */
import { popoverName, PopoverProps, PopoverTokens } from './Popover.types';
import { compressible, buildUseTokens, UseTokens } from '@fluentui-react-native/framework';

const usePopoverTokens = buildUseTokens<PopoverTokens>(() => ({}), popoverName);

export const Popover = compressible<PopoverProps, PopoverTokens>((_props: PopoverProps, _useTokens: UseTokens<PopoverTokens>) => {
  return () => {
    return null;
  };
}, usePopoverTokens);
Popover.displayName = popoverName;

export default Popover;
