import type { AccessibilityState, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { Icon } from '../../primitives/icon/icon';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

export type AccordionLayout = 'chevronStart' | 'chevronEnd';
export type AccordionSize = 'small';

export type AccordionSlots = {
  /**
   * The root container for the accordion item.
   */
  root: Slot<typeof View>;

  /**
   * The visible title for the accordion header.
   */
  title: OptionalSlot<typeof Text>;

  /**
   * The optional leading icon shown before the title.
   */
  leadingIcon: OptionalSlot<typeof Icon>;

  /**
   * Custom body content shown when the accordion is expanded.
   */
  bodyContent: OptionalSlot<typeof View>;
};

export type AccordionStateSlots = AccordionSlots & {
  header: Slot<typeof Pressable>;
  body: Slot<typeof View>;
  chevronContainer: Slot<typeof View>;
  chevron: Slot<typeof Icon>;
};

export type AccordionStateProps = {
  /**
   * Places the chevron before or after the title block.
   */
  layout?: AccordionLayout;
  /**
   * Whether the body panel is visible. Supplying this prop makes expansion externally driven, so the accordion renders
   * what it is given and reports header presses through `onExpandedChange`.
   */
  expanded?: boolean;
  /**
   * The initial expanded value when expansion is internally driven. Ignored while `expanded` is supplied.
   */
  defaultExpanded?: boolean;
  /**
   * Forces the visual focus state when provided.
   */
  focused?: boolean;
  /**
   * Announces the accordion header when the visible title is not sufficient.
   */
  accessibilityLabel?: string;
  /**
   * Optional accessibility hint for the header button.
   */
  accessibilityHint?: string;
  /**
   * Preserves unrelated consumer accessibility state values while the component owns expanded state.
   */
  accessibilityState?: AccessibilityState;
  /**
   * Notifies consumers with the next expanded value whenever a header press changes expansion, in both the externally
   * driven and internally driven cases.
   */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * The only currently defined size.
   */
  size?: AccordionSize;
};

export type AccordionRootProps = OwnedRootProps<
  PropsWithRefOf<typeof View>,
  'accessible' | 'accessibilityHint' | 'accessibilityLabel' | 'accessibilityRole' | 'accessibilityState' | 'focusable'
>;

export type AccordionProps = AccordionStateProps & ComponentProps<AccordionSlots, AccordionRootProps>;

export type AccordionState = ComponentState<AccordionStateSlots> &
  Required<Pick<AccordionStateProps, 'layout' | 'size'>> &
  ThemeState &
  PressableState & {
    expanded: boolean;
    focusVisualProps?: FocusVisualProps;
    focused: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };
