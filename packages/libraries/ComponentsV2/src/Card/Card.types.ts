import type * as React from 'react';
import type { ViewProps } from 'react-native';

import type { InteractionEvent, PressablePropsExtended } from '@fluentui/react-native';

export const cardAppearances = ['filled', 'filled-alternative', 'outline', 'subtle'] as const;
export const cardFocusModes = ['off', 'no-tab', 'tab-exit', 'tab-only'] as const;
export const cardOrientations = ['horizontal', 'vertical'] as const;
export const cardSizes = ['small', 'medium', 'large'] as const;

export type CardAppearance = (typeof cardAppearances)[number];
export type CardFocusMode = (typeof cardFocusModes)[number];
export type CardOrientation = (typeof cardOrientations)[number];
export type CardSize = (typeof cardSizes)[number];
export type CardInteractionEvent = InteractionEvent;

export interface CardSelectionChangeData {
  selected: boolean;
}

export interface CardProps extends Omit<PressablePropsExtended, 'children' | 'disabled'> {
  /**
   * Controls the visual surface treatment.
   * @default 'filled'
   */
  appearance?: CardAppearance;

  /**
   * Card content, usually CardHeader, CardPreview, and CardFooter.
   */
  children?: React.ReactNode;

  /**
   * Initially selected state for an uncontrolled selectable card.
   * A card becomes selectable when this, selected, or onSelectionChange is provided.
   * @default false
   */
  defaultSelected?: boolean;

  /**
   * Prevents card invocation and selection.
   * @default false
   */
  disabled?: boolean;

  /**
   * A custom top-trailing action, such as a Checkbox.
   */
  floatingAction?: React.ReactNode;

  /**
   * Selects native focus participation. All non-off values make the card a
   * focus target; traversal is delegated to the host platform.
   * @default 'off', or 'no-tab' for interactive cards
   */
  focusMode?: CardFocusMode;

  /**
   * Arranges direct children vertically or horizontally.
   * @default 'vertical'
   */
  orientation?: CardOrientation;

  /**
   * Called when a selectable card requests a new selected state.
   */
  onSelectionChange?: (event: CardInteractionEvent, data: CardSelectionChangeData) => void;

  /**
   * Web-compatible card-surface invocation callback.
   */
  onClick?: (event: CardInteractionEvent) => void;

  /**
   * Controlled selected state.
   * @default false
   */
  selected?: boolean;

  /**
   * Controls card padding, gap, and corner radius.
   * @default 'medium'
   */
  size?: CardSize;
}

export interface CardHeaderProps extends Omit<ViewProps, 'children'> {
  /**
   * Trailing content, typically a button or menu trigger.
   */
  action?: React.ReactNode;

  /**
   * Supplemental content displayed under the header.
   */
  description?: React.ReactNode;

  /**
   * Primary header content. children is used when header is not supplied.
   */
  header?: React.ReactNode;

  /**
   * Leading image, avatar, or icon.
   */
  image?: React.ReactNode;

  children?: React.ReactNode;
}

export interface CardFooterProps extends Omit<ViewProps, 'children'> {
  /**
   * Trailing action content.
   */
  action?: React.ReactNode;

  children?: React.ReactNode;
}

export interface CardPreviewProps extends Omit<ViewProps, 'children'> {
  /**
   * Full-bleed preview content.
   */
  children?: React.ReactNode;

  /**
   * A 32x32 overlay positioned at the bottom-leading edge of the preview.
   */
  logo?: React.ReactNode;
}
