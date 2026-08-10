import type * as React from 'react';
import type { ViewProps } from 'react-native';

import type { PressablePropsExtended } from '@fluentui/react-native';

export type BreadcrumbSize = 'small' | 'medium' | 'large';
export type BreadcrumbFocusMode = 'arrow' | 'tab';

export interface BreadcrumbProps extends ViewProps {
  /**
   * Selects the native focus-navigation model. Tab follows the platform tab
   * order; arrow relies on the platform's directional focus navigation.
   * @default 'tab'
   */
  focusMode?: BreadcrumbFocusMode;

  /**
   * Controls the size of descendant items, buttons, and dividers.
   * @default 'medium'
   */
  size?: BreadcrumbSize;

  children?: React.ReactNode;
}

export interface BreadcrumbItemProps extends ViewProps {
  /**
   * Overrides the size inherited from Breadcrumb.
   */
  size?: BreadcrumbSize;

  children?: React.ReactNode;
}

export interface BreadcrumbButtonProps
  extends Omit<PressablePropsExtended, 'children' | 'disabled'> {
  /**
   * Identifies the current page. Current buttons expose selected and disabled
   * accessibility state and do not invoke their action.
   * @default false
   */
  current?: boolean;

  /**
   * Prevents interaction and removes the button from focus navigation.
   * @default false
   */
  disabled?: boolean;

  /**
   * Applies disabled semantics while retaining focus navigation.
   * @default false
   */
  disabledFocusable?: boolean;

  /**
   * Optional leading icon.
   */
  icon?: React.ReactNode;

  /**
   * Overrides the size inherited from Breadcrumb.
   */
  size?: BreadcrumbSize;

  /**
   * Truncates string content. True uses the Fluent recommendation of 30
   * characters; a number supplies a custom maximum.
   * @default true
   */
  truncate?: boolean | number;

  /**
   * Overrides the accessibility hint used as the native tooltip description.
   */
  tooltip?: string;

  children?: React.ReactNode;
}

export interface BreadcrumbDividerProps extends ViewProps {
  /**
   * Overrides the size inherited from Breadcrumb.
   */
  size?: BreadcrumbSize;

  /**
   * Replaces the default chevron divider.
   */
  children?: React.ReactNode;
}

export type PartitionBreadcrumbItemsOptions<T> = {
  items: readonly T[];
  maxDisplayedItems?: number;
  overflowIndex?: number;
};

export type PartitionBreadcrumbItems<T> = {
  startDisplayedItems: readonly T[];
  overflowItems?: readonly T[];
  endDisplayedItems?: readonly T[];
};
