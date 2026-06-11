import type RN from 'react-native';
import type { ViewAdditions, CursorValue, AccessibilityAnnotationInfo, HandledKeyEvent, NativeKeyEvent, KeyEventHandler } from './platformProps';

export type { HandledKeyEvent, NativeKeyEvent, KeyEventHandler };

/**
 * Build up the styles type by combining the base ViewStyle with the cross-platform extensions
 * the React Native forks add (currently just `cursor`).
 */
export type IViewStyle = RN.ViewStyle & { cursor?: CursorValue };

// list of props to do special handling for
type ExcludedViewProps = 'style' | 'accessibilityRole' | 'accessibilityState' | 'keyDownEvents' | 'keyUpEvents' | 'onKeyDown' | 'onKeyUp';

// merge the base React Native view props with the platform-neutral fork additions, defaulting to
// the base props in case of overlap
type MergedViewProps = RN.ViewProps & Omit<ViewAdditions, keyof RN.ViewProps>;

/**
 * The complete set of view props accepted by Fluent UI components with additional cross-platform props added
 */
export interface IViewProps extends Omit<MergedViewProps, ExcludedViewProps> {
  // accessibility annotation is a Win32/Windows concept
  accessibilityAnnotation?: AccessibilityAnnotationInfo;
  // accessibility role is the common (base) set across platforms
  accessibilityRole?: RN.AccessibilityRole;
  // merge structs for accessibilityState with the desktop additions
  accessibilityState?: RN.AccessibilityState & {
    multiselectable?: boolean;
    required?: boolean;
    readOnly?: boolean;
  };
  // keyboard events (unified across platforms)
  onKeyDown?: KeyEventHandler;
  onKeyUp?: KeyEventHandler;
  keyDownEvents?: HandledKeyEvent[];
  keyUpEvents?: HandledKeyEvent[];

  // use the combined style type
  style?: RN.StyleProp<IViewStyle>;
}
