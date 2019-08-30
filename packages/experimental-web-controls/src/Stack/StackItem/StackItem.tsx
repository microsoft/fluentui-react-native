import { IStackItemComponent } from './StackItem.types';
import { compose } from '@uifabric/foundation-compose';
import { stackItemTokenProcessor } from './StackItem.tokens';

export const StackItem = compose<IStackItemComponent>({
  className: 'RNFStackItem',
  tokens: [stackItemTokenProcessor],
  slots: {
    root: 'div'
  }
});

export default StackItem;
