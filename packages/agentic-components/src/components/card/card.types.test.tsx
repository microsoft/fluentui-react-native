/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { View } from 'react-native';

import type { Card, CardProps } from './card';

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

// @ts-expect-error Card requires the content slot.
const MissingContentCard: CardProps = {};

const InvalidLayoutCard: CardProps = {
  content: { children: <View /> },
  // @ts-expect-error Card layouts are limited to the spec-defined values.
  layout: 'stacked',
};

describe('Card type coverage', () => {
  it('accepts the public slot contract', () => {
    expect(MinimalCard).toBeDefined();
    expect(StructuredCard).toBeDefined();
    expect(SlotCompatibleCard).toBeDefined();
    expect(MissingContentCard).toBeDefined();
    expect(InvalidLayoutCard).toBeDefined();
  });
});
