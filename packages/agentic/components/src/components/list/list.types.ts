import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import type { ListItemProps, ListItemSelectionMode, ListItemSize } from '../list-item/list-item.types';

export type ListEntry = { key: string; label: string; disabled?: boolean; testID?: string };
export type ListItemPresentation = Pick<ListItemProps, 'icon' | 'selectedIcon'> & { secondaryContent?: string };
export type ListNavigationMode = 'passive' | 'items';
export type ListActionDetail = { preventSelection(): void };

export type ListProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    items: readonly ListEntry[];
    renderItem?: (item: ListEntry) => ListItemPresentation;
    navigationMode?: ListNavigationMode;
    selectionMode?: ListItemSelectionMode;
    selectedKeys?: readonly string[];
    defaultSelectedKeys?: readonly string[];
    onSelectionChange?: (keys: readonly string[], details: { key: string }) => void;
    onAction?: (key: string, detail: ListActionDetail) => void;
    size?: ListItemSize;
    accessibilityLabel?: string;
  };

export type ListState = ThemeState &
  ComponentState<{ root: Slot<typeof View> }> & {
    items: readonly ListEntry[];
    renderItem?: ListProps['renderItem'];
    navigationMode: ListNavigationMode;
    selectionMode: ListItemSelectionMode;
    size: ListItemSize;
    itemSize: ListItemSize;
    selected: ReadonlySet<string>;
    userStyle?: StyleProp<ViewStyle>;
    focus: KeyedFocus;
    activate(key: string, mechanism: 'primary' | 'space' | 'select'): void;
  };
