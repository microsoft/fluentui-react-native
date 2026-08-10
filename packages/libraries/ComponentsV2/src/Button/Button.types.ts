import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { InteractionEvent, PressablePropsExtended } from '@fluentui/react-native';

export const buttonAppearances = ['secondary', 'primary', 'outline', 'subtle', 'transparent'] as const;
export const buttonShapes = ['rounded', 'circular', 'square'] as const;
export const buttonSizes = ['small', 'medium', 'large'] as const;

export type ButtonAppearance = (typeof buttonAppearances)[number];
export type ButtonShape = (typeof buttonShapes)[number];
export type ButtonSize = (typeof buttonSizes)[number];

export interface ButtonFontIcon {
  fontSource: {
    codepoint: number;
    fontFamily: string;
    fontSize?: number;
  };
}

export type ButtonIcon = React.ReactNode | ButtonFontIcon;

export interface ButtonProps extends Omit<PressablePropsExtended, 'children' | 'disabled' | 'onPress'> {
  /**
   * Controls the visual emphasis of the button.
   * @default 'secondary'
   */
  appearance?: ButtonAppearance;

  children?: React.ReactNode;

  /**
   * Removes the button from the focus order and prevents activation.
   * @default false
   */
  disabled?: boolean;

  /**
   * Shows disabled visuals and prevents activation while keeping the button focusable.
   * @default false
   */
  disabledFocusable?: boolean;

  /**
   * Content displayed alongside the button label.
   */
  icon?: ButtonIcon;

  /**
   * Treats the button as icon-only. When omitted it is inferred from icon content and no label.
   */
  iconOnly?: boolean;

  /**
   * Positions the icon relative to button content.
   * @default 'before'
   */
  iconPosition?: 'before' | 'after';

  /**
   * Replaces the icon with an activity indicator and prevents activation.
   * @default false
   */
  loading?: boolean;

  /**
   * Invoked when the user activates the button.
   */
  onClick?: (event: InteractionEvent) => void;

  /**
   * Controls the outer geometry of the button.
   * @default 'rounded'
   */
  shape?: ButtonShape;

  /**
   * Controls button dimensions and typography.
   * @default 'medium'
   */
  size?: ButtonSize;
}

export interface CompoundButtonProps extends ButtonProps {
  /**
   * Secondary text displayed below the primary content.
   */
  secondaryContent?: React.ReactNode;
}

export interface MenuButtonProps extends Omit<ButtonProps, 'iconPosition'> {
  /**
   * Indicates whether the associated menu is visible. The owner of the menu controls this value.
   * @default false
   */
  expanded?: boolean;

  /**
   * The trailing menu disclosure icon. A Fluent chevron is rendered when omitted.
   */
  menuIcon?: React.ReactNode;
}

export type SplitButtonPrimaryActionProps = Partial<Omit<ButtonProps, 'children'>>;

export type SplitButtonMenuActionProps = Partial<Omit<MenuButtonProps, 'children' | 'icon'>>;

export interface SplitButtonProps extends Omit<ButtonProps, 'iconOnly' | 'iconPosition' | 'style'> {
  /**
   * Indicates whether the menu owned by the secondary action is visible.
   * @default false
   */
  expanded?: boolean;

  /**
   * The trailing menu disclosure icon.
   */
  menuIcon?: React.ReactNode;

  /**
   * Invoked when the secondary menu action is activated.
   */
  onMenuClick?: (event: InteractionEvent) => void;

  /**
   * Overrides for the primary action. This is the native equivalent of Fluent UI Web's
   * `primaryActionButton` slot props.
   */
  primaryActionButton?: SplitButtonPrimaryActionProps;

  /**
   * Overrides for the menu action. This is the native equivalent of Fluent UI Web's
   * `menuButton` slot props.
   */
  menuButton?: SplitButtonMenuActionProps;

  /**
   * Applies static layout styles to the non-interactive SplitButton container.
   */
  style?: StyleProp<ViewStyle>;
}

export interface ToggleButtonOnCheckedChangeData {
  checked: boolean;
}

export interface ToggleButtonProps extends ButtonProps {
  /**
   * The controlled pressed state.
   */
  checked?: boolean;

  /**
   * The initial pressed state when the component is uncontrolled.
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Uses the high-contrast checked treatment rather than a color-only selection treatment.
   * @default false
   */
  isAccessible?: boolean;

  /**
   * Invoked with the requested pressed state after activation.
   */
  onCheckedChange?: (event: InteractionEvent, data: ToggleButtonOnCheckedChangeData) => void;
}
