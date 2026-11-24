import { useLayoutEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Text } from '../text/text';
import type { DrawerProps, DrawerState } from './drawer.types';

export function useDrawer_unstable({
  position = 'start',
  size = 'medium',
  customSize,
  availableExtent,
  title,
  children,
  footer,
  closeLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  onCloseFocus,
  closeTestID,
  style: userStyle,
  ...rootProps
}: DrawerProps): DrawerState {
  const [present = false, setPresent] = useControllableValue(open, defaultOpen);
  const validExtent = size !== 'custom' || (Number.isFinite(customSize) && customSize! > 0);
  const visible = present && !!title.trim() && validExtent;
  const [closing, setClosing] = useState(false);
  useLayoutEffect(() => {
    if (!closing) return;
    setClosing(false);
    if (!present) onCloseFocus?.();
  }, [closing, onCloseFocus, present]);
  const close = closeLabel?.trim()
    ? () => {
        if (!present) return;
        setClosing(true);
        setPresent(false);
        onOpenChange?.(false, { reason: 'close' });
      }
    : undefined;
  return {
    ...useThemeState(),
    open: visible,
    position,
    size,
    customSize,
    availableExtent,
    userStyle,
    children,
    root: useSlot(View, {
      ...rootProps,
      ...(visible ? { accessible: false } : hiddenFromAccessibilityProps),
      role: visible ? 'group' : undefined,
      accessibilityLabel: visible ? title : undefined,
      focusable: false,
    }),
    header: useSlot(View, {}),
    heading: useSlot(View, { accessible: true, accessibilityRole: 'header', accessibilityLabel: title, focusable: false }),
    title: useSlot(Text, { ...hiddenFromAccessibilityProps, variant: 'functionalTitleSmall', children: title }),
    body: useSlot(ScrollView, { focusable: false }),
    footer: useOptionalSlot(View, footer ? { children: footer } : null),
    close: useOptionalSlot(
      Button,
      close
        ? {
            ...commandPressProps(close, false),
            accessibilityLabel: closeLabel,
            testID: closeTestID,
            appearance: 'subtle',
            size: 'small',
            leadingIcon: { fontSource: semanticIconSources.dismiss },
          }
        : null,
    ),
  };
}
