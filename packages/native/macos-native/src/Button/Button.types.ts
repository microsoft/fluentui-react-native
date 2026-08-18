import type { ViewProps } from 'react-native';

/**
 * The AppKit bezel styles applicable to a push button. `glass` renders the floating,
 * translucent "Liquid Glass" material introduced in macOS 26 (Tahoe) and falls back to
 * the default rounded bezel on older macOS versions.
 * https://developer.apple.com/documentation/appkit/nsbutton/bezelstyle-swift.enum
 */
export type ButtonBezelStyle =
  | 'rounded'
  | 'regularSquare'
  | 'texturedRounded'
  | 'texturedSquare'
  | 'shadowlessSquare'
  | 'circular'
  | 'help'
  | 'smallSquare'
  | 'roundRect'
  | 'recessed'
  | 'roundedDisclosure'
  | 'inline'
  | 'glass';

/**
 * Thin wrapper around the AppKit `NSButton` control, configured as a momentary push button.
 * https://developer.apple.com/documentation/appkit/nsbutton
 */
export interface ButtonProps extends ViewProps {
  /** The button's title text. */
  title?: string;
  /** Bezel/visual style of the button. Defaults to 'rounded'. */
  bezelStyle?: ButtonBezelStyle;
  /** Disables user interaction with the button. */
  disabled?: boolean;
  /** Native tooltip shown on hover. */
  tooltip?: string;
  /** Fired when the user clicks the button. */
  onPress?: () => void;
}
