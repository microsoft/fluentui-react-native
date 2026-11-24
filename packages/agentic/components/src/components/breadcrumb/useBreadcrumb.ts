import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useFocusTarget, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import type { FocusTarget } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import type { BreadcrumbAncestor, BreadcrumbProps, BreadcrumbState } from './breadcrumb.types';

export function useBreadcrumb_unstable({
  items,
  size = 'medium',
  leadingIcon,
  accessibilityLabel,
  overflowLabel,
  style: userStyle,
  ...rootProps
}: BreadcrumbProps): BreadcrumbState {
  const [width, setWidth] = useState(0);
  const [widths, setWidths] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [open, setOpen] = useState(false);
  const [restoreOnClose, setRestoreOnClose] = useState(true);
  const active = useRef<{ key: string; inPopover: boolean } | undefined>(undefined);
  const targets = useRef(new Map<string, FocusTarget>());
  const triggerFocus = useFocusTarget();
  const current = items[items.length - 1];
  const currentLocation = {
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: current?.label,
    focusable: false,
    tooltip: current?.label,
  };
  const keyOf = (key: string, label: string) => JSON.stringify([key, label, size]);
  useEffect(() => {
    const live = new Set(items.map((entry) => JSON.stringify([entry.key, entry.label, size])));
    setWidths((previous) => {
      if ([...previous.keys()].every((key) => live.has(key))) return previous;
      return new Map([...previous].filter(([key]) => live.has(key)));
    });
  }, [items, size]);
  const register = useCallback((key: string, inPopover: boolean, target: FocusTarget) => {
    const identity = `${inPopover ? 'overflow' : 'visible'}:${key}`;
    targets.current.set(identity, target);
    return () => {
      if (targets.current.get(identity) === target) targets.current.delete(identity);
    };
  }, []);
  const onNavigate = (item: BreadcrumbAncestor, inPopover: boolean) => {
    if (inPopover) {
      active.current = undefined;
      setRestoreOnClose(false);
      setOpen(false);
    }
    if (item.onNavigate) item.onNavigate();
    else void Linking.openURL(item.url).catch(() => console.warn('Breadcrumb: the platform could not open the URL.'));
  };
  useAccessibilityLabelWarning({
    componentName: 'Breadcrumb',
    accessibilityLabel: accessibilityLabel.trim() && overflowLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'Breadcrumb: provide localized names for the trail and overflow action.',
  });
  const theme = useThemeState();
  const layout: BreadcrumbState['layout'] = { leading: [], overflow: [], trailing: [], typography: {}, separator: {}, triggerWidth: 0 };
  return {
    ...theme,
    items,
    width,
    measure(key, label, measuredWidth) {
      const identity = keyOf(key, label);
      setWidths((previous) => (previous.get(identity) === measuredWidth ? previous : new Map(previous).set(identity, measuredWidth)));
    },
    getWidth: (item) => widths.get(keyOf(item.key, item.label)),
    size,
    userStyle,
    layout,
    overflowLabel,
    open,
    restoreOnClose,
    triggerFocus,
    reconcileFocus: ({ leading, trailing, overflow }) => {
      const focused = active.current;
      const stillHidden = focused && overflow.some((entry) => entry.key === focused.key);
      if (focused && focused.inPopover !== Boolean(stillHidden)) {
        active.current = undefined;
        if (overflow.length) {
          if (open) setOpen(false);
          else triggerFocus.focusTarget.requestFocus('restore');
        } else {
          const visible = [...leading, ...trailing];
          const key = visible.find((entry) => entry.key === focused.key)?.key ?? visible[0]?.key;
          if (key) targets.current.get(`visible:${key}`)?.requestFocus('restore');
        }
      }
      if (open && !overflow.length) setOpen(false);
    },
    register,
    onNavigate,
    onLinkFocus: (key, inPopover) => {
      active.current = { key, inPopover };
    },
    onLinkBlur: (key, inPopover) => {
      if (active.current?.key === key && active.current.inPopover === inPopover) active.current = undefined;
    },
    onOpenChange: (next) => {
      if (next) setRestoreOnClose(true);
      if (!next && active.current?.inPopover) active.current = undefined;
      setOpen(next);
    },
    onOverflowKeys: (key, event) => {
      const native = event.nativeEvent;
      if (event.defaultPrevented || native.altKey || native.ctrlKey || native.metaKey || native.shiftKey) return;
      const delta = native.key === 'ArrowUp' ? -1 : native.key === 'ArrowDown' ? 1 : 0;
      if (!delta) return;
      event.preventDefault?.();
      event.stopPropagation?.();
      const index = layout.overflow.findIndex((entry) => entry.key === key);
      const next = index < 0 ? undefined : layout.overflow[index + delta];
      if (next) targets.current.get(`overflow:${next.key}`)?.requestFocus('keyboard');
    },
    root: useSlot(View, {
      ...rootProps,
      accessible: true,
      accessibilityRole: 'group',
      accessibilityLabel,
      focusable: false,
      onLayout: (event) => setWidth(event.nativeEvent.layout.width),
    }),
    measureRow: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none' }),
    leadingIcon: useOptionalSlot(Icon, leadingIcon, { transform: (props) => ({ ...props, ...hiddenFromAccessibilityProps }) }),
    current: useSlot(View, currentLocation),
    currentLabel: useSlot(Text, { ...hiddenFromAccessibilityProps, children: current?.label }),
  };
}
