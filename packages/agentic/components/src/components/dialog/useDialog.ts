import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { desktopControls } from '../../common/desktopControls';
import { uniqueByKey } from '../../common/keyedCollection';
import { semanticIconSources } from '../../common/iconSources';
import { usePopupPresence } from '../../common/usePopupPresence';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Text } from '../text/text';
import type { DialogOpenChangeReason, DialogProps, DialogState } from './dialog.types';

export function useDialog_unstable({
  type = 'modal',
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  children,
  actions: supplied = [],
  closeLabel,
  onDismissRequest,
  initialFocusRef,
  returnFocusRef,
  triggerRef,
  windowTestID,
  style: userStyle,
  ...rootProps
}: DialogProps): DialogState {
  if (!desktopControls?.DialogWindow) throw new Error('Dialog requires a native DialogWindow registration.');
  const { width, height } = useWindowDimensions();
  const [footerWidth, setFooterWidth] = useState<number>();
  const actions = uniqueByKey(supplied, (action) => action.key).filter((action) => action.label.trim());
  const valid = !!title.trim() && (type !== 'alert' || actions.length > 0);
  const presence = usePopupPresence<DialogOpenChangeReason>({ open, defaultOpen, onOpenChange, disabled: !valid });
  const dismiss = () => {
    if (type === 'alert' || !presence.presented) return;
    onDismissRequest?.();
    presence.requestOpen(false, 'dismiss');
  };
  useAccessibilityLabelWarning({
    componentName: 'Dialog',
    accessibilityLabel: valid ? title : undefined,
    requireLabel: true,
    warning: 'Dialog: provide a localized title and a resolving action for alerts.',
  });
  return {
    ...useThemeState(),
    actions,
    children,
    approve(action) {
      if (!presence.presented) return;
      action.onPress?.();
      presence.requestOpen(false, 'resolve');
    },
    width,
    height,
    stackFooter: (footerWidth ?? width) < 320,
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false, collapsable: false }),
    window: useSlot(desktopControls.DialogWindow, {
      shown: presence.presented,
      mode: type,
      windowLabel: title,
      testID: windowTestID,
      onWindowEvent: ({ nativeEvent }) => {
        const { kind } = nativeEvent;
        if (kind === 'presented' && presence.latest.current.presented) {
          initialFocusRef?.current?.focus();
        } else if (kind === 'dismiss-request') {
          dismiss();
        } else if (kind === 'focus-return') {
          (returnFocusRef ?? triggerRef)?.current?.focus();
        } else if (['owner-lost', 'native-close', 'presentation-refused'].includes(kind) && presence.latest.current.presented) {
          presence.latchDismissed();
          presence.requestOpen(false, 'native-close');
        }
      },
    }),
    surface: useSlot(View, { collapsable: false }),
    header: useSlot(View, {}),
    title: useSlot(Text, { accessibilityRole: 'header', children: title }),
    close: useOptionalSlot(
      Button,
      type !== 'alert' && closeLabel?.trim()
        ? {
            ...commandPressProps(dismiss, false),
            accessibilityLabel: closeLabel,
            appearance: 'subtle',
            size: 'small',
            leadingIcon: { fontSource: semanticIconSources.dismiss },
          }
        : null,
    ),
    body: useOptionalSlot(ScrollView, children != null ? {} : null),
    footer: useOptionalSlot(View, actions.length ? { onLayout: (event) => setFooterWidth(event.nativeEvent.layout.width) } : null),
  };
}
