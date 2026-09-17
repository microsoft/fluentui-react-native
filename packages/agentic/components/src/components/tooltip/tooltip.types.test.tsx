/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text as NativeText } from 'react-native';
import type { TextProps } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';

import type { TooltipContent, TooltipPosition, TooltipProps, TooltipStateProps, TooltipTriggerProps } from './tooltip.types';

const TextReplacement = directComponent<TextProps>((props) => <NativeText {...props} />);

const TooltipPropsCheck: TooltipProps = {
  content: 'Refresh the list from the server',
  defaultVisible: false,
  hideDelay: 0,
  onVisibleChange: (visible: boolean) => visible,
  position: 'topCenter',
  showDelay: 300,
  trigger: { children: <NativeText>Refresh</NativeText> },
};

const ExternallyDrivenCheck: TooltipProps = { content: 'Refresh', visible: true };

const ContentSlotCheck: TooltipContent = { as: TextReplacement, children: 'Refresh', variant: 'body1' };

const TriggerPresentationCheck: TooltipTriggerProps = {
  role: 'link',
  children: <NativeText>Refresh</NativeText>,
  onHoverIn: () => undefined,
  onPress: () => undefined,
  ref: null,
  style: { width: 120 },
  testID: 'consumer-trigger',
};

// @ts-expect-error the label is required, because the same text describes the trigger and names the surface.
const MissingContentCheck: TooltipProps = { trigger: { children: <NativeText>Refresh</NativeText> } };

// @ts-expect-error the label is a single string, so it cannot be an arbitrary node.
const NodeContentCheck: TooltipProps = { content: <NativeText>Refresh</NativeText> };

// @ts-expect-error the label slot narrows children to a string for the same reason.
const NodeContentSlotCheck: TooltipProps = { content: { children: <NativeText>Refresh</NativeText> } };

// @ts-expect-error Tooltip describes the trigger with the label text.
const TriggerHintCheck: TooltipTriggerProps = { accessibilityHint: 'Refresh the list' };

// @ts-expect-error Tooltip derives the trigger disabled state from its own disabled value.
const TriggerStateCheck: TooltipTriggerProps = { accessibilityState: { disabled: true } };

// @ts-expect-error a tooltip trigger is never collapsible, so it never reports expanded state.
const TriggerExpandedCheck: TooltipTriggerProps = { 'aria-expanded': true };

// @ts-expect-error Tooltip owns whether the trigger is disabled.
const TriggerDisabledCheck: TooltipTriggerProps = { disabled: true };

// @ts-expect-error Tooltip derives trigger focusability from its own disabled value.
const TriggerFocusableCheck: TooltipTriggerProps = { focusable: false };

// @ts-expect-error the trigger stays an accessibility element so screen readers can reach the description.
const TriggerAccessibleCheck: TooltipTriggerProps = { accessible: false };

// @ts-expect-error the root is a passive wrapper, so it does not take an accessible name.
const RootLabelCheck: TooltipProps = { accessibilityLabel: 'Refresh', content: 'Refresh' };

// @ts-expect-error the root is a passive wrapper, so it does not take an accessibility role.
const RootRoleCheck: TooltipProps = { role: 'button', content: 'Refresh' };

// @ts-expect-error the trigger slot does not accept an `as` replacement, because Tooltip owns the trigger behavior.
const TriggerAsCheck: TooltipProps = { content: 'Refresh', trigger: { as: TextReplacement } };

// @ts-expect-error TIP-007 keeps the anchor gap outside the contract, because neither platform exposes it.
const GapCheck: TooltipStateProps & { gapSpace?: never } = { gapSpace: 8 };

// @ts-expect-error TIP-007 keeps arrow presentation outside the contract, because neither platform draws one.
const ArrowCheck: TooltipStateProps & { withArrow?: never } = { withArrow: true };

// @ts-expect-error TIP-007 keeps the dismissal policy outside the contract, because the native surface owns it.
const DismissCheck: TooltipStateProps & { dismissBehaviors?: never } = { dismissBehaviors: ['preventDismissOnKeyDown'] };

// @ts-expect-error TIP-007 keeps a hoverable surface outside the contract, because the surface is a separate window.
const HoverableCheck: TooltipStateProps & { withHoverableSurface?: never } = { withHoverableSurface: true };

// @ts-expect-error the delays are millisecond counts rather than token names.
const DelayCheck: TooltipStateProps = { showDelay: 'slow' };

// @ts-expect-error the preferred placement comes from the native directional hints.
const PositionCheck: TooltipPosition = 'above';

describe('Tooltip types', () => {
  it('accepts the documented label, visibility, and trigger presentation contract', () => {
    expect(TooltipPropsCheck.position).toBe('topCenter');
    expect(ExternallyDrivenCheck.visible).toBe(true);
    expect(ContentSlotCheck).toHaveProperty('children', 'Refresh');
    expect(TriggerPresentationCheck.testID).toBe('consumer-trigger');
  });

  it('rejects the state properties that TIP-007 keeps outside the contract', () => {
    expect(DelayCheck.showDelay).toBe('slow');
    expect(GapCheck).toHaveProperty('gapSpace', 8);
    expect(ArrowCheck).toHaveProperty('withArrow', true);
    expect(DismissCheck).toHaveProperty('dismissBehaviors');
    expect(HoverableCheck).toHaveProperty('withHoverableSurface', true);
  });
});
