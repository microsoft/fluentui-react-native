import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ReactNode, RefObject } from 'react';
import type { ScrollView, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { HierarchyNode } from '../../common/keyedHierarchy';
import type { PanelFocus } from '../../common/usePanelFocus';
import type { Dialog } from '../dialog/dialog';
import type { NavItemAction, NavItemDensity, NavItemLeading } from '../nav-item/nav-item.types';

type Entry = {
  key: string;
  label: string;
  leading?: NavItemLeading;
  disabled?: boolean;
  testID?: string;
  secondaryActions?: readonly NavItemAction[];
};
export type NavDestination = Entry & { type?: 'destination'; children?: never };
export type NavCategory = Entry & { type: 'category'; children: readonly NavEntry[] };
export type NavEntry = NavDestination | NavCategory;
export type NavPresentation = 'inline' | 'overlay';

export type NavProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    items: readonly NavEntry[];
    currentValue?: string;
    currentDescription?: string;
    onNavigate(key: string): void;
    expandedKeys?: readonly string[];
    defaultExpandedKeys?: readonly string[];
    onExpandedChange?: (keys: readonly string[], details: { key: string }) => void;
    presentation?: NavPresentation;
    density?: NavItemDensity;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    openerRef?: RefObject<{ focus(): void } | null>;
    accessibilityLabel: string;
    closeLabel?: string;
    header?: ReactNode;
    footer?: ReactNode;
  };

export type NavState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    overlay: OptionalSlot<typeof Dialog>;
    panel: Slot<typeof View>;
    body: Slot<typeof ScrollView>;
    header: OptionalSlot<typeof View>;
    footer: OptionalSlot<typeof View>;
  }> & {
    open: boolean;
    presentation: NavPresentation;
    density: NavItemDensity;
    rows: readonly HierarchyNode<NavEntry>[];
    expanded: ReadonlySet<string>;
    currentValue?: string;
    currentDescription?: string;
    currentAncestors: ReadonlySet<string>;
    select: NavProps['onNavigate'];
    expand(key: string, open: boolean): void;
    focus: PanelFocus;
    headerContent?: ReactNode;
    footerContent?: ReactNode;
    userStyle?: StyleProp<ViewStyle>;
  };
