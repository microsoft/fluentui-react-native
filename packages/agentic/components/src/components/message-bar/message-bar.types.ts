import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Icon } from '../../primitives/icon/icon';
import type { Button } from '../button/button';
import type { CommandPress } from '../button/commandPress';
import type { Text } from '../text/text';

export type MessageBarStatus = 'information' | 'warning' | 'error' | 'success';
export type MessageBarAction = { label: string; onPress: CommandPress };
type Dismiss = { onDismiss?: never; dismissLabel?: never } | { onDismiss: () => void; dismissLabel: string };
export type MessageBarProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> &
  Dismiss & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    status?: MessageBarStatus;
    title?: string;
    content: string;
    actions?: readonly [] | readonly [MessageBarAction] | readonly [MessageBarAction, MessageBarAction];
    announce?: boolean;
    announcementKey?: string;
    messageTestID?: string;
    dismissTestID?: string;
  };
export type MessageBarState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    row: Slot<typeof View>;
    message: Slot<typeof View>;
    statusIcon: Slot<typeof Icon>;
    title: OptionalSlot<typeof Text>;
    content: Slot<typeof Text>;
    actions: OptionalSlot<typeof View>;
    firstAction: OptionalSlot<typeof Button>;
    secondAction: OptionalSlot<typeof Button>;
    dismiss: OptionalSlot<typeof Button>;
  }> & { status: MessageBarStatus; hasContent: boolean; userStyle?: StyleProp<ViewStyle> };
