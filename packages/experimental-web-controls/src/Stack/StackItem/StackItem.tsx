import { IStackItemComponent } from './StackItem.types';
import { compose } from '@uifabric/foundation-compose';
import { stackItemTokenProcessor } from './StackItem.tokens';

export const StackItem = compose<IStackItemComponent>({
  className: 'RNFStackItem',
  slots: {
    root: {
      slotType: 'div',
      styleFactories: [stackItemTokenProcessor]
    }
  }
});

export default StackItem;
