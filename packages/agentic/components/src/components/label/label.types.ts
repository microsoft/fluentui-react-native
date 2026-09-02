import type { StyleProp, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { Text } from '../text/text';

export type LabelSize = 'small' | 'medium' | 'large';
export type LabelWeight = 'regular' | 'strong';

export type LabelSlots = {
  /**
   * The label container.
   */
  root: Slot<typeof View>;

  /**
   * The label text. Renders `Label` when the caller supplies nothing.
   */
  content: Slot<typeof Text>;

  /**
   * The trailing required indicator. Renders only while `required` is set.
   */
  requiredIndicator: OptionalSlot<typeof Text>;
};

export type LabelStateProps = {
  /**
   * Mirrors the disabled affordance of the associated control. This changes foreground color only; the associated
   * control owns the disabled state that assistive technology announces.
   */
  disabled?: boolean;

  /**
   * Shows the trailing required indicator. The indicator is decorative, so the associated control still has to
   * report that it is required.
   */
  required?: boolean;

  /**
   * The size scale, matched to the size of the associated control.
   */
  size?: LabelSize;

  /**
   * The emphasis weight of the label text and the required indicator.
   */
  weight?: LabelWeight;
};

/**
 * Label owns the root accessibility role and focusability, and takes its text through the `content` slot rather
 * than through children.
 */
export type LabelExposedViewProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessibilityRole' | 'focusable'> & {
  children?: never;
};

export type LabelProps = LabelStateProps & ComponentProps<LabelSlots, LabelExposedViewProps>;

export type LabelState = ComponentState<LabelSlots> &
  Required<LabelStateProps> &
  ThemeState & {
    userStyle?: StyleProp<ViewStyle>;
  };
