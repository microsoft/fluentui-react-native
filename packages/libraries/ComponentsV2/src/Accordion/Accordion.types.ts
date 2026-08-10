import type * as React from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import type { InteractionEvent, PressablePropsExtended } from '@fluentui/react-native';

export type AccordionItemValue = string | number;
export type AccordionHeaderSize = 'small' | 'medium' | 'large' | 'extra-large';
export type AccordionExpandIconPosition = 'start' | 'end';
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface AccordionToggleData {
  openItems: AccordionItemValue[];
  value: AccordionItemValue;
}

export interface AccordionCollapseMotion {
  /**
   * Expand and collapse duration in milliseconds.
   * @default 200
   */
  duration?: number;

  /**
   * Animates panel opacity together with height.
   * @default true
   */
  animateOpacity?: boolean;
}

export interface AccordionProps extends Omit<ViewProps, 'children'> {
  children: React.ReactNode;

  /**
   * Allows every item to be closed.
   * @default false
   */
  collapsible?: boolean;

  /**
   * Initially open items for an uncontrolled Accordion.
   */
  defaultOpenItems?: readonly AccordionItemValue[];

  /**
   * Allows more than one item to be open.
   * @default false
   */
  multiple?: boolean;

  /**
   * Controlled open items.
   */
  openItems?: readonly AccordionItemValue[];

  /**
   * Called when a header requests an open-state change.
   */
  onToggle?: (event: InteractionEvent, data: AccordionToggleData) => void;
}

export interface AccordionItemProps extends Omit<ViewProps, 'children'> {
  children: React.ReactNode;

  /**
   * Prevents interaction with this item.
   * @default false
   */
  disabled?: boolean;

  /**
   * Stable value used by Accordion state and onToggle.
   */
  value: AccordionItemValue;
}

export interface AccordionHeaderProps
  extends Omit<PressablePropsExtended, 'children' | 'disabled' | 'onPress'> {
  children: React.ReactNode;

  /**
   * Decorative icon rendered beside the header content.
   */
  icon?: React.ReactNode;

  /**
   * Replaces the default expand chevron.
   */
  expandIcon?: React.ReactNode;

  /**
   * Positions the expand icon before or after the content.
   * @default 'start'
   */
  expandIconPosition?: AccordionExpandIconPosition;

  /**
   * Native heading level exposed by the header container.
   * @default 2
   */
  headingLevel?: AccordionHeadingLevel;

  /**
   * Uses compact inline header content alignment.
   * @default false
   */
  inline?: boolean;

  /**
   * Header typography and height.
   * @default 'medium'
   */
  size?: AccordionHeaderSize;
}

export interface AccordionPanelProps extends Omit<ViewProps, 'children'> {
  children: React.ReactNode;

  /**
   * Configures expand and collapse animation.
   */
  collapseMotion?: AccordionCollapseMotion;

  /**
   * Style for the measured inner panel content.
   */
  contentStyle?: StyleProp<ViewStyle>;
}
