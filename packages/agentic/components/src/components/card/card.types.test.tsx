/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { View } from 'react-native';

import type { Card } from './card';
import type { CardProps } from './card.types';

const MinimalCard: CardProps = {
  content: { children: <View /> },
};

const StructuredCard: CardProps = {
  content: { children: <View /> },
  footer: { children: <View /> },
  header: { children: <View /> },
  layout: 'structured',
};

const SlotCompatibleCard: SlotProp<typeof Card> = {
  content: { children: <View /> },
};

describe('Card type coverage', () => {
  it('accepts the public slot contract', () => {
    expect(MinimalCard).toBeDefined();
    expect(StructuredCard).toBeDefined();
    expect(SlotCompatibleCard).toBeDefined();
  });
});
