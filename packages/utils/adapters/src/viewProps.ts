import type RN from 'react-native';
import type Windows from 'react-native-windows';
import type MacOS from 'react-native-macos';
import type Win32 from '@office-iss/react-native-win32';
import type { EventPhase } from 'react-native-windows';

/**
 * Build up the styles type by combining the base ViewStyle with platform specific extensions,
 * omitting any overlapping keys to prevent conflicts.
 */

export type IViewStyle = RN.ViewStyle & Omit<Windows.ViewStyle & Win32.ViewStyle & MacOS.ViewStyle, keyof RN.ViewStyle>;

/**
 * Set up a merged key event to use
 */

export interface HandledKeyEvent extends MacOS.HandledKeyEvent {
  code?: string;
  eventPhase?: typeof EventPhase.None | typeof EventPhase.Capturing | typeof EventPhase.AtTarget | typeof EventPhase.Bubbling;
}
export type NativeKeyEvent = RN.NativeSyntheticEvent<HandledKeyEvent>;
export type KeyEventHandler = (event: NativeKeyEvent) => void;

// list of props to do special handling for
type ExcludedViewProps = 'style' | 'accessibilityRole' | 'accessibilityState' | 'keyDownEvents' | 'keyUpEvents' | 'onKeyDown' | 'onKeyUp';
// merge the view props from each platform, defaulting to React Native base props in case of overlap
type MergedViewProps = RN.ViewProps & Omit<Windows.ViewProps & MacOS.ViewProps & Win32.ViewProps, keyof RN.ViewProps>;

/**
 * The complete set of view props accepted by Fluent UI components with additional cross-platform props added
 */
export interface IViewProps extends Omit<MergedViewProps, ExcludedViewProps> {
  // annotation for Win32 is the same as windows with one additional optional property
  accessibilityAnnotation?: Win32.ViewProps['accessibilityAnnotation'];
  // accessible role should union the types, use adapters to fork settings
  accessibilityRole?: RN.AccessibilityRole & Windows.AccessibilityRole & Win32.AccessibilityRole & MacOS.AccessibilityRole;
  // merge structs for accessibilityState
  accessibilityState?: RN.AccessibilityState & Windows.AccessibilityState & Win32.AccessibilityState & MacOS.AccessibilityState;
  // keyboard events
  onKeyDown?: KeyEventHandler;
  onKeyUp?: KeyEventHandler;
  keyDownEvents?: HandledKeyEvent[];
  keyUpEvents?: HandledKeyEvent[];

  // use the combined style type
  style?: RN.StyleProp<IViewStyle>;
}
