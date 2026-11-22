/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { BadgeProps } from './badge.types';
import type { Icon } from '../../primitives/icon/icon';

const LeadingIcon: SlotProp<typeof Icon> = {
  fontSource: { codepoint: 0x2022, fontFamily: 'Arial' },
};

const IconAndTextBadge: BadgeProps = {
  content: 'Badge',
  leadingIcon: LeadingIcon,
  testID: 'badge-root',
};

const IconOnlyBadge: BadgeProps = {
  accessibilityLabel: 'Verified',
  layout: 'iconOnly',
  leadingIcon: LeadingIcon,
  testID: 'badge-root',
};

const DefaultIconBadge: BadgeProps = {
  accessibilityLabel: 'Verified',
  layout: 'iconOnly',
  testID: 'badge-root',
};

const CounterBadge: BadgeProps = { layout: 'counter', count: '99+' };
const DotBadge: BadgeProps = { layout: 'dot', appearance: 'filled' };
// @ts-expect-error counter requires caller-owned count.
const MissingCount: BadgeProps = { layout: 'counter' };
// @ts-expect-error dot has neither a count nor a noncircular shape.
const InvalidDot: BadgeProps = { layout: 'dot', count: 3, shape: 'rounded' };
// @ts-expect-error counter and dot are restricted to Filled.
const InvalidAppearance: BadgeProps = { layout: 'counter', count: 3, appearance: 'tint' };
// @ts-expect-error Brand was removed from the semantic Badge colors.
const BrandBadge: BadgeProps = { content: 'Status', color: 'brand' };

// @ts-expect-error iconOnly does not accept content or trailingIcon.
const InvalidIconOnlyBadge: BadgeProps = {
  accessibilityLabel: 'Verified',
  content: 'Badge',
  layout: 'iconOnly',
  leadingIcon: LeadingIcon,
  trailingIcon: LeadingIcon,
  testID: 'badge-root',
};

describe('Badge props', () => {
  it('accepts status and notification badge prop shapes', () => {
    expect(IconAndTextBadge).toBeDefined();
    expect(IconOnlyBadge).toBeDefined();
    expect(DefaultIconBadge).toBeDefined();
    expect(CounterBadge).toBeDefined();
    expect(DotBadge).toBeDefined();
  });
});
