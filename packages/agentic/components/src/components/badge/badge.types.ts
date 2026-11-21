import type { StyleProp, View, ViewStyle } from 'react-native';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
  SlotProp,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';
import type { Text } from '../text/text';

export type BadgeAppearance = 'tint' | 'outline' | 'filled';
export type BadgeColor = 'danger' | 'success' | 'warning' | 'informative';
export type BadgeSize = 'small' | 'medium';
export type BadgeShape = 'circular' | 'rounded';
export type BadgeLayout = 'iconAndText' | 'iconOnly' | 'counter' | 'dot';

export type BadgeSlots = {
  /**
   * The badge container.
   */
  root: Slot<typeof View>;

  /**
   * The optional leading icon.
   */
  leadingIcon: OptionalSlot<typeof Icon>;

  /**
   * The badge label.
   */
  content: OptionalSlot<typeof Text>;

  /**
   * The optional trailing icon.
   */
  trailingIcon: OptionalSlot<typeof Icon>;
};

type BadgeCommonProps = {
  color?: BadgeColor;
  size?: BadgeSize;
};

type BadgeStatusProps = BadgeCommonProps & {
  appearance?: Exclude<BadgeAppearance, 'filled'>;
  shape?: BadgeShape;
  count?: never;
};

type BadgeIconAndTextProps = BadgeStatusProps & {
  layout?: 'iconAndText';
  content?: OptionalSlot<typeof Text>;
  leadingIcon?: OptionalSlot<typeof Icon>;
  trailingIcon?: OptionalSlot<typeof Icon>;
  leadingIconVisible?: boolean;
  trailingIconVisible?: boolean;
};

type BadgeIconOnlyProps = BadgeStatusProps & {
  layout: 'iconOnly';
  leadingIcon?: SlotProp<typeof Icon>;
  content?: never;
  trailingIcon?: never;
  leadingIconVisible?: never;
  trailingIconVisible?: never;
};

type BadgeNotificationProps = BadgeCommonProps & {
  appearance?: 'filled';
  content?: never;
  leadingIcon?: never;
  trailingIcon?: never;
  leadingIconVisible?: never;
  trailingIconVisible?: never;
} & ({ layout: 'counter'; count: number | string; shape?: BadgeShape } | { layout: 'dot'; count?: never; shape?: 'circular' });

export type BadgeStateProps = BadgeIconAndTextProps | BadgeIconOnlyProps | BadgeNotificationProps;

export type BadgeExposedViewProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessibilityRole' | 'focusable'>;

export type BadgeProps = BadgeStateProps & ComponentProps<BadgeSlots, BadgeExposedViewProps>;

export type BadgeState = ComponentState<BadgeSlots> &
  Omit<ThemeState, 'appearance'> & {
    appearance: BadgeAppearance;
    color: BadgeColor;
    size: BadgeSize;
    shape: BadgeShape;
    layout: BadgeLayout;
    iconOnly: boolean;
    leadingIconVisible: boolean;
    trailingIconVisible: boolean;
    hasContent: boolean;
    hasLeadingIcon: boolean;
    hasTrailingIcon: boolean;
    themeState: ThemeState;
    tintStyle?: ViewStyle;
    userStyle?: StyleProp<ViewStyle>;
  };
