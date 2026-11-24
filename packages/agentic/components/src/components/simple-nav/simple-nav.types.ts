import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, Slot } from '@fluentui-react-native/framework-base';
import type { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import type { PanelFocus } from '../../common/usePanelFocus';
import type { Button } from '../button/button';
import type { Dialog } from '../dialog/dialog';
import type { NavDestination, NavProps } from '../nav/nav.types';
import type { NavItemLeading } from '../nav-item/nav-item.types';

export type SimpleNavDestination = Omit<NavDestination, 'leading' | 'secondaryActions'> & { leading: NavItemLeading };
export type SimpleNavBreakpoints = { railBelow: number; hideBelow: number };
type Sizing = { breakpoints?: never; availableWidth?: never } | { breakpoints: SimpleNavBreakpoints; availableWidth: number };
export type SimpleNavProps = Omit<NavProps, 'items' | 'expandedKeys' | 'defaultExpandedKeys' | 'onExpandedChange'> &
  Sizing & {
    items: readonly SimpleNavDestination[];
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    collapseLabel?: string;
    expandLabel?: string;
  };

export type SimpleNavState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    overlay: OptionalSlot<typeof Dialog>;
    panel: Slot<typeof View>;
    body: Slot<typeof ScrollView>;
    header: OptionalSlot<typeof View>;
    footer: OptionalSlot<typeof View>;
    toggle: OptionalSlot<typeof Button>;
  }> & {
    items: readonly SimpleNavDestination[];
    currentValue?: string;
    currentDescription?: string;
    density: NonNullable<NavProps['density']>;
    presentation: NonNullable<NavProps['presentation']>;
    visible: boolean;
    rail: boolean;
    focus: PanelFocus;
    select: NavProps['onNavigate'];
    headerContent?: NavProps['header'];
    footerContent?: NavProps['footer'];
    userStyle?: StyleProp<ViewStyle>;
  };
