import { useLayoutEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { desktopControls } from '../../common/desktopControls';
import { uniqueByKey } from '../../common/keyedCollection';
import { usePanelFocus } from '../../common/usePanelFocus';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Dialog } from '../dialog/dialog';
import type { SimpleNavProps, SimpleNavState } from './simple-nav.types';

export function useSimpleNav_unstable({
  items: supplied,
  currentValue,
  currentDescription,
  onNavigate,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  presentation = 'inline',
  density = 'comfortable',
  open,
  defaultOpen,
  onOpenChange,
  openerRef,
  accessibilityLabel,
  closeLabel,
  collapseLabel,
  expandLabel,
  header,
  footer,
  breakpoints,
  availableWidth,
  style: userStyle,
  ...rootProps
}: SimpleNavProps): SimpleNavState {
  if (presentation === 'overlay' && !desktopControls) throw new Error('SimpleNav overlay requires a qualified native DialogWindow host.');
  if (
    breakpoints &&
    (!Number.isFinite(availableWidth) ||
      !Number.isFinite(breakpoints.hideBelow) ||
      !Number.isFinite(breakpoints.railBelow) ||
      breakpoints.hideBelow < 0 ||
      breakpoints.hideBelow >= breakpoints.railBelow)
  ) {
    throw new TypeError('SimpleNav requires ordered nonnegative breakpoints and a finite containing width.');
  }
  const [shrunken, setShrunken] = useControllableValue<boolean>(collapsed, defaultCollapsed);
  const [shown, setShown] = useControllableValue<boolean>(open, defaultOpen ?? presentation === 'inline');
  const measured = breakpoints ? (availableWidth ?? 0) : Infinity;
  const inline = presentation === 'inline';
  const forcedRail = inline && breakpoints !== undefined && measured < breakpoints.railBelow;
  const visible = !!shown && (!inline || !breakpoints || measured >= breakpoints.hideBelow);
  const rail = inline && (!!shrunken || forcedRail);
  const hasToggle = inline && !forcedRail && !!collapseLabel?.trim() && !!expandLabel?.trim();
  const items = uniqueByKey(supplied, (entry) => entry.key).filter((entry) => entry.label.trim());
  const toggleKey = '\u0000toggle';
  const focus = usePanelFocus(
    new Set(visible ? [...items.map((entry) => entry.key), ...(hasToggle ? [toggleKey] : [])] : []),
    inline ? openerRef : undefined,
  );
  const lastOffset = useRef({ x: 0, y: 0 });
  const bodyMount = useRef({ visible: false, offset: lastOffset.current });
  const offset = visible && !bodyMount.current.visible ? lastOffset.current : bodyMount.current.offset;
  useLayoutEffect(() => {
    bodyMount.current = { visible, offset };
  }, [offset, visible]);
  useAccessibilityLabelWarning({
    componentName: 'SimpleNav',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'SimpleNav: provide a localized navigation name.',
  });
  return {
    ...useThemeState(),
    items,
    currentValue,
    currentDescription,
    density,
    presentation,
    visible,
    rail,
    focus,
    select: onNavigate,
    headerContent: rail ? undefined : header,
    footerContent: rail ? undefined : footer,
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false, collapsable: false }),
    overlay: useOptionalSlot(
      Dialog,
      inline
        ? null
        : {
            title: accessibilityLabel,
            open: visible,
            closeLabel,
            triggerRef: openerRef,
            onOpenChange: (next) => {
              if (next === shown) return;
              setShown(next);
              onOpenChange?.(next);
            },
          },
    ),
    panel: useSlot(View, { role: 'navigation', accessible: true, accessibilityLabel, focusable: false }),
    body: useSlot(ScrollView, {
      contentOffset: offset,
      onScroll: (event) => {
        lastOffset.current = event.nativeEvent.contentOffset;
      },
      scrollEventThrottle: 16,
    }),
    header: useOptionalSlot(View, hasToggle || (!rail && header != null) ? {} : null),
    footer: useOptionalSlot(View, !rail && footer != null ? {} : null),
    toggle: useOptionalSlot(
      Button,
      hasToggle
        ? {
            ...commandPressProps(() => {
              setShrunken(!rail);
              onCollapsedChange?.(!rail);
            }, false),
            accessibilityLabel: rail ? expandLabel : collapseLabel,
            accessibilityState: { expanded: !rail },
            appearance: 'subtle',
            size: 'small',
            leadingIcon: { fontSource: { codepoint: 0x2261 } },
            tooltip: rail ? expandLabel : collapseLabel,
            ref: (instance) => focus.setRef(toggleKey, instance),
            onFocus: () => focus.onFocus(toggleKey),
            onBlur: () => focus.onBlur(toggleKey),
          }
        : null,
    ),
  };
}
