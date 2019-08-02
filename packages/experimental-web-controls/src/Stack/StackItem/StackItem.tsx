import { IStackItemComponent } from './StackItem.types';
import { compose } from '@uifabric/foundation-compose';
import { keyProps, processor } from './StackItem.tokens';

export const StackItem = compose<IStackItemComponent>({
  className: 'RNFStackItem',
  tokenProcessors: [{ keyProps, processor }],
  slots: {
    root: 'div'
  }
});

export default StackItem;
