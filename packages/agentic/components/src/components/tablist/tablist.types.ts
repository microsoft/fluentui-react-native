import type * as React from 'react';
import type { View, ViewProps } from 'react-native';

import type { ComponentProps, ComponentState, OwnedRootProps, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

export type TabListOrientation = 'horizontal' | 'vertical';

export type TabKeyEvent = {
  nativeEvent?: {
    key?: string;
  };
  preventDefault?: () => void;
};

export type TabListStateProps = {
  /**
   * Whether arrow navigation wraps from the last enabled Tab to the first and
   * from the first to the last.
   *
   * @default true
   */
  circularNavigation?: boolean;

  /**
   * Initial selected Tab value when selection is uncontrolled. The first
   * enabled Tab is selected when this is omitted.
   */
  defaultSelectedValue?: string;

  /**
   * Disables interaction and keyboard focus for every child Tab.
   *
   * @default false
   */
  disabled?: boolean;

  /** Called whenever a child Tab requests selection. */
  onSelectionChange?: (value: string) => void;

  /**
   * The layout and arrow-key axis.
   *
   * @default horizontal
   */
  orientation?: TabListOrientation;

  /**
   * Controlled selected Tab value.
   */
  selectedValue?: string;

  /**
   * Whether arrow navigation also requests selection.
   *
   * @default true
   */
  selectionFollowsFocus?: boolean;
};

export type TabListExposedViewProps = OwnedRootProps<
  PropsWithRefOf<typeof View>,
  'accessibilityRole' | 'accessibilityState' | 'accessible' | 'focusable'
>;

export type TabListSlots = {
  root: Slot<typeof View>;
};

export type TabListProps = TabListStateProps &
  ComponentProps<TabListSlots, TabListExposedViewProps> & {
    children: React.ReactNode;
  };

export type TabListState = ComponentState<TabListSlots> &
  ThemeState & {
    children: React.ReactNode;
    contextValue: import('./TabListContext').TabListContextValue;
    orientation: TabListOrientation;
    userStyle: ViewProps['style'];
  };
