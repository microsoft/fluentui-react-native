import * as React from 'react';
import { IStackItemProps, stackItemName, IStackItemType } from './StackItem.types';
import { compose } from '@uifabricshared/foundation-compose';
import { View } from 'react-native';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { settings } from './StackItem.settings';
import { stackItemTokenProcessor } from './StackItem.tokens';

export const StackItem: React.FunctionComponent<IStackItemProps> = compose<IStackItemType>({
  displayName: stackItemName,
  settings: settings,
  slots: { root: { slotType: View, filter: filterViewProps } },
  styles: { root: [stackItemTokenProcessor] },
});

export default StackItem;
