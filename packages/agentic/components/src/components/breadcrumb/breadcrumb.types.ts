import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentState,
  FocusKeyboardEvent,
  FocusTarget,
  OptionalSlot,
  PropsWithRefOf,
  Slot,
  SlotProp,
  useFocusTarget,
} from '@fluentui-react-native/framework-base';
import type { StyleProp, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Icon } from '../../primitives/icon/icon';
import type { LinkDestination } from '../link/link.types';
import type { PopoverOpenChangeData } from '../popover/popover.types';
import type { Text } from '../text/text';

export type BreadcrumbSize = 'small' | 'medium' | 'large';
export type BreadcrumbAncestor = LinkDestination & { key: string; label: string; testID?: string };
export type BreadcrumbCurrent = { key: string; label: string; url?: never; onNavigate?: never };
export type BreadcrumbItems = readonly [...BreadcrumbAncestor[], BreadcrumbCurrent];
export type BreadcrumbProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    items: BreadcrumbItems;
    size?: BreadcrumbSize;
    leadingIcon?: SlotProp<typeof Icon>;
    accessibilityLabel: string;
    overflowLabel: string;
  };

export type BreadcrumbPartition = {
  leading: readonly BreadcrumbAncestor[];
  overflow: readonly BreadcrumbAncestor[];
  trailing: readonly BreadcrumbAncestor[];
};
export type BreadcrumbResolvedLayout = BreadcrumbPartition & {
  typography: TextStyle;
  separator: { width?: number; height?: number; color?: TextStyle['color'] };
  triggerWidth: number;
};

export type BreadcrumbState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    measureRow: Slot<typeof View>;
    leadingIcon: OptionalSlot<typeof Icon>;
    current: Slot<typeof View>;
    currentLabel: Slot<typeof Text>;
  }> & {
    items: BreadcrumbItems;
    width: number;
    measure(key: string, label: string, width: number): void;
    getWidth(item: BreadcrumbAncestor | BreadcrumbCurrent): number | undefined;
    size: BreadcrumbSize;
    userStyle?: StyleProp<ViewStyle>;
    overflowLabel: string;
    open: boolean;
    restoreOnClose: boolean;
    triggerFocus: ReturnType<typeof useFocusTarget>;
    reconcileFocus(partition: BreadcrumbPartition): void;
    register(key: string, inPopover: boolean, target: FocusTarget): () => void;
    onLinkFocus(key: string, inPopover: boolean): void;
    onLinkBlur(key: string, inPopover: boolean): void;
    onOverflowKeys(key: string, event: FocusKeyboardEvent): void;
    onOpenChange(open: boolean, data: PopoverOpenChangeData): void;
    onNavigate(item: BreadcrumbAncestor, inPopover: boolean): void;
    layout: BreadcrumbResolvedLayout;
  };
