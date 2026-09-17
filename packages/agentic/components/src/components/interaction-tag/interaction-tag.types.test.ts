/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { View } from 'react-native';
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { directComponent } from '@fluentui-react-native/framework-base';

import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { Icon } from '../../primitives/icon/icon';
import type { InteractionTag } from './interaction-tag';
import type { InteractionTagProps, InteractionTagSlots, InteractionTagStateSlots } from './interaction-tag.types';

const LeadingIcon: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } };
const DismissIcon: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' } };
const Replacement = directComponent<IconElementProps>((props) => React.createElement(View, props));

const containerRef = React.createRef<View>();
const primaryRef = React.createRef<View>();
const dismissRef = React.createRef<View>();

const InteractionTagSlot: SlotProp<typeof InteractionTag> = {
  content: 'Engineering',
  dismiss: { accessibilityLabel: 'Remove Engineering', onPress: () => undefined },
  dismissIcon: { as: Replacement, fontSource: { codepoint: 0x2715, fontFamily: 'Arial' } },
  leadingIcon: LeadingIcon,
  primaryAction: { onPress: () => undefined },
};

const WithLeadingIcon: InteractionTagProps = {
  appearance: 'primary',
  content: 'Engineering',
  dismiss: { accessibilityLabel: 'Remove Engineering', onPress: () => undefined },
  dismissIcon: DismissIcon,
  leadingIcon: LeadingIcon,
  primaryAction: { onPress: () => undefined },
  shape: 'circular',
  size: 'small',
};

const WithAvatar: InteractionTagProps = {
  avatar: { initials: 'CE' },
  content: 'Cameron Evans',
  dismiss: { accessibilityLabel: 'Remove Cameron Evans', onPress: () => undefined },
};

const WithRefs: InteractionTagProps = {
  content: 'Engineering',
  dismiss: { accessibilityLabel: 'Remove Engineering', ref: dismissRef },
  primaryAction: { ref: primaryRef },
  ref: containerRef,
};

const IconOnly: InteractionTagProps = {
  layout: 'iconOnly',
  leadingIcon: LeadingIcon,
  primaryAction: { accessibilityLabel: 'Open Engineering' },
};

// @ts-expect-error leading content is an icon or an avatar, never both.
const BothLeadingSlots: InteractionTagProps = {
  avatar: { initials: 'CE' },
  content: 'Cameron Evans',
  leadingIcon: LeadingIcon,
};

const InternalSlotName: keyof InteractionTagStateSlots = 'divider';
// @ts-expect-error the divider is structural and is not one of the public slots.
const PublicSlotName: keyof InteractionTagSlots = 'divider';

describe('InteractionTag types', () => {
  it('accepts the leading icon, avatar, ref, and icon-only branches', () => {
    expect(InteractionTagSlot).toBeDefined();
    expect(WithLeadingIcon).toBeDefined();
    expect(WithAvatar).toBeDefined();
    expect(WithRefs).toBeDefined();
    expect(IconOnly).toBeDefined();
  });

  it('rejects mixed leading content and keeps the divider out of the public slots', () => {
    expect(BothLeadingSlots).toBeDefined();
    expect(InternalSlotName).toBe('divider');
    expect(PublicSlotName).toBe('divider');
  });
});
