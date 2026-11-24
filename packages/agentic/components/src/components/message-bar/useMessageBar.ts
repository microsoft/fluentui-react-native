import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { Icon } from '../../primitives/icon/icon';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Text } from '../text/text';
import type { MessageBarAction, MessageBarProps, MessageBarState } from './message-bar.types';

const actionProps = (action?: MessageBarAction) =>
  action?.label.trim() ? { content: action.label, size: 'small' as const, ...commandPressProps(action.onPress, false) } : null;

export function useMessageBar_unstable({
  status = 'information',
  content,
  title,
  actions,
  onDismiss,
  dismissLabel,
  announce = true,
  announcementKey,
  messageTestID,
  dismissTestID,
  style: userStyle,
  ...rootProps
}: MessageBarProps): MessageBarState {
  const hasContent = !!content.trim();
  const heading = title?.trim() ? title : undefined;
  const message = heading ? `${heading}. ${content}` : content;
  const lastAnnouncement = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!hasContent) {
      lastAnnouncement.current = undefined;
      return;
    }
    const identity = JSON.stringify([announcementKey, status, message]);
    if (lastAnnouncement.current === identity) return;
    lastAnnouncement.current = identity;
    if (!announce) return;
    if (Platform.OS === 'macos' && typeof AccessibilityInfo.announceForAccessibilityWithOptions === 'function') {
      AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: status === 'information' || status === 'success' });
    } else {
      AccessibilityInfo.announceForAccessibility?.(message);
    }
  }, [announce, announcementKey, hasContent, message, status]);
  const first = actionProps(actions?.[0]);
  const second = actionProps(actions?.[1]);
  return {
    ...useThemeState(),
    status,
    hasContent,
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    row: useSlot(View, { accessible: false, focusable: false }),
    message: useSlot(View, {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: message,
      testID: messageTestID,
      focusable: false,
    }),
    statusIcon: useSlot(Icon, hiddenFromAccessibilityProps),
    title: useOptionalSlot(Text, heading ? { ...hiddenFromAccessibilityProps, children: heading } : null),
    content: useSlot(Text, { ...hiddenFromAccessibilityProps, children: content }),
    actions: useOptionalSlot(View, first || second ? { accessible: false, focusable: false } : null),
    firstAction: useOptionalSlot(Button, first),
    secondAction: useOptionalSlot(Button, second),
    dismiss: useOptionalSlot(
      Button,
      onDismiss && dismissLabel?.trim()
        ? {
            ...commandPressProps(onDismiss, false),
            accessibilityLabel: dismissLabel,
            testID: dismissTestID,
            leadingIcon: { ...hiddenFromAccessibilityProps, fontSource: semanticIconSources.dismiss },
          }
        : null,
    ),
  };
}
