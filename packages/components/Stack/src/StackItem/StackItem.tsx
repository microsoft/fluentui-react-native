import type * as React from 'react';
import { View } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import { compose } from '@uifabricshared/foundation-compose';

import { settings } from './StackItem.settings';
import { stackItemTokenProcessor } from './StackItem.tokens';
import { stackItemName } from './StackItem.types';
import type { IStackItemProps, IStackItemType } from './StackItem.types';

export const StackItem: React.FunctionComponent<IStackItemProps> = compose<IStackItemType>({
  displayName: stackItemName,
  settings: settings,
  slots: { root: { slotType: View, filter: filterViewProps } },
  styles: { root: [stackItemTokenProcessor] },
});

export default StackItem;
