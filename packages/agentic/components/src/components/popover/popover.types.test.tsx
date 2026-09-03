/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, View } from 'react-native';
import type { ViewProps } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { PopoverProps, PopoverTriggerProps } from './popover.types';

const ContentReplacement = directComponent<ViewProps>((props) => <View {...props} />);

const ContentSlot: SlotProp<typeof View> = { as: ContentReplacement, children: <Text>Last synced 5 minutes ago.</Text> };

const PopoverPropsCheck: PopoverProps = {
  content: ContentSlot,
  defaultOpen: false,
  onOpenChange: (open: boolean) => open,
  position: 'topLeftEdge',
  surfaceAccessibilityLabel: 'Sync details',
  trigger: { children: <Text>Details</Text> },
};

const HiddenContentCheck: PopoverProps = { content: null, surfaceAccessibilityLabel: 'Sync details' };

const TriggerPresentationCheck: PopoverTriggerProps = {
  children: <Text>Details</Text>,
  onPress: () => undefined,
  style: { width: 120 },
  testID: 'trigger',
};

// @ts-expect-error the trigger slot is presentation only, so Popover owns the trigger role.
const TriggerRoleCheck: PopoverTriggerProps = { role: 'link' };

// @ts-expect-error Popover derives the expanded and disabled trigger state from its own open and disabled values.
const TriggerStateCheck: PopoverTriggerProps = { accessibilityState: { expanded: true } };

// @ts-expect-error Popover owns whether the trigger is disabled.
const TriggerDisabledCheck: PopoverTriggerProps = { disabled: true };

// @ts-expect-error Popover owns whether the trigger participates in focus order.
const TriggerFocusableCheck: PopoverTriggerProps = { focusable: false };

// @ts-expect-error the root is a passive wrapper, so it does not take an accessible name.
const RootLabelCheck: PopoverProps = { accessibilityLabel: 'Sync details' };

// @ts-expect-error the root is a passive wrapper, so it does not take an accessibility role.
const RootRoleCheck: PopoverProps = { role: 'button' };

// @ts-expect-error the trigger slot does not accept an `as` replacement, because Popover owns the trigger behavior.
const TriggerAsCheck: PopoverProps = { trigger: { as: ContentReplacement } };

describe('Popover types', () => {
  it('accepts the public content and trigger presentation slots', () => {
    expect(PopoverPropsCheck.position).toBe('topLeftEdge');
    expect(HiddenContentCheck.content).toBeNull();
    expect(TriggerPresentationCheck.testID).toBe('trigger');
  });
});
