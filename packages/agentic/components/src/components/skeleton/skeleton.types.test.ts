/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Skeleton } from './skeleton';
import type { SkeletonProps } from './skeleton.types';

const BasicSkeletonProps: SkeletonProps = {
  style: { height: 16, width: 120 },
  testID: 'skeleton',
};

const SkeletonSlot: SlotProp<typeof Skeleton> = {
  style: { height: 16, width: 120 },
  testID: 'skeleton-slot',
};

// @ts-expect-error Skeleton does not accept children.
const InvalidSkeletonProps: SkeletonProps = {
  children: 'nope',
};

describe('Skeleton slot types', () => {
  it('accepts root view props and slot consumption', () => {
    expect(BasicSkeletonProps).toBeDefined();
    expect(SkeletonSlot).toBeDefined();
  });
});
