import type * as React from 'react';
import type { NativeSyntheticEvent, StyleProp, Text as NativeText, TargetedEvent, TextStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { FontIconSource, IconElementProps, IconProps } from '../../primitives/icon/icon.types';

export type LinkSlots = {
  root: Slot<typeof NativeText>;
  content: OptionalSlot<typeof NativeText>;
  icon: OptionalSlot<typeof Icon>;
};

/** A text-backed trailing glyph that can render safely inside Link's native Text root. */
export type LinkIconProps = IconElementProps & {
  as?: React.ComponentType<IconProps>;
  fontSource: FontIconSource;
  imageSource?: never;
  svgSource?: never;
};

export type LinkTypeSet = 'functional' | 'content';

/**
 * Focus props that the Windows and macOS text implementations support but that the shared React Native
 * `Text` typings do not declare. They are redeclared here rather than imported from a platform fork so a
 * single type graph stays free of conflicting fork definitions.
 */
export type LinkFocusProps = {
  /** Whether the link participates in the tab order. Defaults to the enabled state. */
  focusable?: boolean;
  /** Raised when the link loses focus. */
  onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  /** Raised when the link receives focus. */
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
};

export type LinkStateProps = {
  /** Blocks presses and navigation, leaves the tab order, and selects the disabled foreground. */
  disabled?: boolean;
  /** Keeps the underline visible at rest and lets the surrounding text style supply the typography. */
  inline?: boolean;
  /** Selects the typographic family used when the link is not inline. */
  typeSet?: LinkTypeSet;
};

export type LinkNavigationProps = {
  /** Receives a rejection from the platform linking module. Without it the rejection is left untouched. */
  onNavigationError?: (error: unknown) => void;
  /** Destination opened through the platform linking module after `onPress` returns. */
  url?: string;
};

export type LinkRootProps = OwnedRootProps<PropsWithRefOf<typeof NativeText> & LinkFocusProps>;

export type LinkProps = LinkStateProps &
  LinkNavigationProps &
  Omit<ComponentProps<LinkSlots, LinkRootProps>, 'icon'> & {
    icon?: LinkIconProps | null;
  };

export type LinkState = ComponentState<LinkSlots> &
  Required<LinkStateProps> &
  ThemeState &
  Pick<PressableState, 'focused' | 'pressed'> & {
    /** Whether the label draws its underline in the resolved state. */
    underlined: boolean;
    userStyle?: StyleProp<TextStyle>;
  };
