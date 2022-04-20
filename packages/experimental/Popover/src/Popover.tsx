/** @jsx withSlots */
import { popoverName, PopoverType } from './Popover.types';
import { compose } from '@fluentui-react-native/framework';

export const Popover = compose<PopoverType>({
  displayName: popoverName,
  slots: {},
  useRender: () => {
    return () => {
      return null;
    };
  },
});

export default Popover;
