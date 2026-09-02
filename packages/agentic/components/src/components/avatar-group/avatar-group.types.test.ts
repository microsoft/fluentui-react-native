/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { AvatarGroup } from './avatar-group';
import type { AvatarGroupLayout, AvatarGroupProps, AvatarGroupSize } from './avatar-group.types';

const DefaultAvatarGroupProps: AvatarGroupProps = {};

const SpreadAvatarGroupProps: AvatarGroupProps = {
  accessibilityLabel: 'Document collaborators',
  layout: 'spread',
  size: 24,
};

const StackedOverflowAvatarGroupProps: AvatarGroupProps = {
  layout: 'stack',
  overflow: { accessibilityLabel: '5 more people', testID: 'overflow' },
  overflowCount: 5,
  size: 56,
};

const HiddenOverflowAvatarGroupProps: AvatarGroupProps = {
  overflow: null,
  overflowCount: 5,
};

const StyledAvatarGroupProps: AvatarGroupProps = {
  ref: null,
  root: { accessibilityRole: 'summary' },
  style: { alignSelf: 'center' },
};

const AvatarGroupSlot: SlotProp<typeof AvatarGroup> = {
  layout: 'stack',
  overflowCount: 2,
};

const layouts: readonly AvatarGroupLayout[] = ['spread', 'stack'];
const sizes: readonly AvatarGroupSize[] = [16, 20, 24, 28, 32, 40, 56, 120];

describe('AvatarGroup types', () => {
  it('accepts the supported public slot and prop combinations', () => {
    expect(DefaultAvatarGroupProps).toBeDefined();
    expect(SpreadAvatarGroupProps).toBeDefined();
    expect(StackedOverflowAvatarGroupProps).toBeDefined();
    expect(HiddenOverflowAvatarGroupProps).toBeDefined();
    expect(StyledAvatarGroupProps).toBeDefined();
    expect(AvatarGroupSlot).toBeDefined();
  });

  it('declares the finite layout and size axes', () => {
    expect(layouts).toHaveLength(2);
    expect(sizes).toHaveLength(8);
  });
});
