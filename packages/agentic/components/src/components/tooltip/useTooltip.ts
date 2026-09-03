import * as React from 'react';

import { attachSlotProps, useAccessibilityLabelWarning, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';

import { Text } from '../text/text';
import { usePopover_unstable } from '../popover/usePopover';
import type { TooltipContentProps, TooltipProps, TooltipState, TooltipTriggerProps } from './tooltip.types';

const defaultHideDelay = 0;
const defaultPosition = 'topCenter';
const defaultShowDelay = 300;

/**
 * Creates the resolved Tooltip state, accessibility, interaction, and slots.
 *
 * Tooltip is a specialization of Popover rather than a second floating-surface implementation, so it drives the
 * reviewed Popover pipeline as a controlled surface and then replaces the decisions a tooltip has to own: the trigger's
 * description and expanded reporting, initial focus, test identifiers, the surface role, and what an open request
 * means. Popover keeps ownership of the wrapper, the anchor ref, the surface mount lifetime, and the native dismissal
 * channel.
 */
export function useTooltip_unstable(props: TooltipProps): TooltipState {
  const {
    accessibilityState,
    content: contentProp,
    defaultVisible,
    disabled = false,
    focused,
    hideDelay = defaultHideDelay,
    onVisibleChange,
    position = defaultPosition,
    showDelay = defaultShowDelay,
    trigger: triggerProp,
    visible: visibleProp,
    ...rootProps
  } = props;

  const {
    accessibilityRole: triggerAccessibilityRole = 'button',
    onBlur: triggerOnBlur,
    onFocus: triggerOnFocus,
    onHoverIn: triggerOnHoverIn,
    onHoverOut: triggerOnHoverOut,
    testID: triggerTestID,
    ...triggerPresentationProps
  } = (triggerProp ?? {}) as TooltipTriggerProps;

  const contentValue: TooltipContentProps = typeof contentProp === 'string' ? { children: contentProp } : (contentProp ?? { children: '' });
  const { children: contentChildren, style: contentUserStyle, ...contentPresentationProps } = contentValue;
  // The label text also describes the trigger and names the surface, so a label that is not a usable string is
  // reported rather than quietly dropped from the accessibility contract.
  const labelText = typeof contentChildren === 'string' ? contentChildren : '';

  useAccessibilityLabelWarning({
    accessibilityLabel: labelText,
    componentName: 'Tooltip',
    requireLabel: true,
    warning: 'Tooltip: content must be a non-empty string because it also describes the trigger.',
  });

  const [visibleValue, setVisible] = useControllableValue(visibleProp, defaultVisible ?? false, onVisibleChange);
  const visible = visibleValue ?? false;

  // Interaction reads the current visibility through a ref so that a delayed request cannot report a change the
  // tooltip no longer needs, and tracks pointer and focus separately because either one keeps the tooltip visible.
  const visibleRef = React.useRef(visible);
  visibleRef.current = visible;
  const hoveredRef = React.useRef(false);
  const focusedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearPendingRequest = React.useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const requestVisible = React.useCallback(
    (next: boolean, delay: number) => {
      clearPendingRequest();
      if (delay > 0) {
        timerRef.current = setTimeout(() => {
          timerRef.current = undefined;
          if (visibleRef.current !== next) {
            setVisible(next);
          }
        }, delay);
      } else if (visibleRef.current !== next) {
        setVisible(next);
      }
    },
    [clearPendingRequest, setVisible],
  );

  React.useEffect(() => clearPendingRequest, [clearPendingRequest]);

  const handleHoverIn = React.useCallback(
    (event: Parameters<NonNullable<TooltipTriggerProps['onHoverIn']>>[0]) => {
      hoveredRef.current = true;
      if (!disabled) {
        requestVisible(true, showDelay);
      }
      triggerOnHoverIn?.(event);
    },
    [disabled, requestVisible, showDelay, triggerOnHoverIn],
  );

  const handleHoverOut = React.useCallback(
    (event: Parameters<NonNullable<TooltipTriggerProps['onHoverOut']>>[0]) => {
      hoveredRef.current = false;
      clearPendingRequest();
      if (!focusedRef.current) {
        requestVisible(false, hideDelay);
      }
      triggerOnHoverOut?.(event);
    },
    [clearPendingRequest, hideDelay, requestVisible, triggerOnHoverOut],
  );

  const handleFocus = React.useCallback(
    (event: Parameters<NonNullable<TooltipTriggerProps['onFocus']>>[0]) => {
      focusedRef.current = true;
      if (!disabled) {
        requestVisible(true, 0);
      }
      triggerOnFocus?.(event);
    },
    [disabled, requestVisible, triggerOnFocus],
  );

  const handleBlur = React.useCallback(
    (event: Parameters<NonNullable<TooltipTriggerProps['onBlur']>>[0]) => {
      focusedRef.current = false;
      clearPendingRequest();
      if (!hoveredRef.current) {
        requestVisible(false, hideDelay);
      }
      triggerOnBlur?.(event);
    },
    [clearPendingRequest, hideDelay, requestVisible, triggerOnBlur],
  );

  // Popover reports trigger activation and native dismissal on the same channel and they are indistinguishable. A
  // tooltip is never revealed by activation, so only close requests are adopted, and they are adopted even while the
  // trigger is disabled so that the platform can always take the tooltip away.
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        requestVisible(false, 0);
      }
    },
    [requestVisible],
  );

  const popoverTrigger = {
    ...triggerPresentationProps,
    // RNW 0.81 crashes when either outline props or its native focus ring creates border visuals after mount.
    enableFocusRing: false,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onHoverIn: handleHoverIn,
    onHoverOut: handleHoverOut,
    testID: triggerTestID ?? 'tooltip-trigger',
  };

  const popoverState = usePopover_unstable({
    ...rootProps,
    content: null,
    disabled,
    focused,
    onOpenChange: handleOpenChange,
    open: visible,
    position,
    surfaceAccessibilityLabel: labelText,
    trigger: popoverTrigger,
  });

  const content = useSlot(Text, {
    testID: 'tooltip-content',
    ...contentPresentationProps,
    children: contentChildren,
  });

  // Popover's trigger reports a disclosure it opens. A tooltip describes a control it never opens, so expanded state
  // is removed and the label text becomes the trigger's description instead.
  attachSlotProps(popoverState.trigger, {
    accessibilityHint: labelText,
    accessibilityRole: triggerAccessibilityRole,
    accessibilityState: { ...accessibilityState, disabled },
    'aria-expanded': undefined,
  });
  // macOS honors the no-initial-focus request and leaves focus on the trigger. Windows moves focus into the popup
  // whenever it is shown regardless of this value, which is recorded as the tooltip-focus-retention divergence.
  attachSlotProps(popoverState.surface, {
    setInitialFocus: false,
    testID: 'tooltip-surface',
  });
  attachSlotProps(popoverState.surfaceContent, {
    accessibilityRole: undefined,
    role: 'tooltip',
    testID: 'tooltip-surface-content',
  });

  const { content: popoverContent, contentIsPlaceholder, open, ...sharedState } = popoverState;

  return {
    ...sharedState,
    content,
    contentUserStyle,
    hideDelay,
    showDelay,
    visible: open,
  };
}
