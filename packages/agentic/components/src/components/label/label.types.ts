import type { StyleProp, TextStyle, View, ViewStyle } from 'react-native';

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
  root: Slot<typeof View>;
  /** Label text; defaults to `Label`. Replacements must remain non-interactive. */
  content: Slot<typeof Text>;
  /** Decorative trailing marker, rendered only while required. Null suppresses it. */
  requiredIndicator: OptionalSlot<typeof Text>;
};

export type LabelStateProps = {
  /** Visual mirror only; the associated native control owns disabled semantics. */
  disabled?: boolean;
  /** Shows a decorative marker; does not set required semantics on a control. */
  required?: boolean;
  size?: LabelSize;
  weight?: LabelWeight;
};

export type LabelExposedViewProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessibilityRole' | 'focusable' | 'role' | 'tabIndex'> & {
  children?: never;
};

export type LabelProps = LabelStateProps & ComponentProps<LabelSlots, LabelExposedViewProps>;

export type LabelState = ComponentState<LabelSlots> &
  Required<LabelStateProps> &
  ThemeState & {
    userStyle?: StyleProp<ViewStyle>;
    userContentStyle?: StyleProp<TextStyle>;
    userRequiredIndicatorStyle?: StyleProp<TextStyle>;
  };
