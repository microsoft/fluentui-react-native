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

// @ts-expect-error iconOnly requires a leadingIcon slot.
const MissingLeadingIconBadge: BadgeProps = {
  accessibilityLabel: 'Verified',
  layout: 'iconOnly',
  testID: 'badge-root',
};

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
  it('accepts icon-and-text and icon-only badge prop shapes', () => {
    expect(IconAndTextBadge).toBeDefined();
    expect(IconOnlyBadge).toBeDefined();
  });
});
