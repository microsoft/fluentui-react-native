import { ImageURISource } from 'react-native';

export const nativeButtonName = 'NativeButton';

export interface NativeButtonProps {
  /*
   * Text to show on the Button.
   */
  title?: string;
  /*
   * Name of the icon to show on the Button.
   */
  image?: ImageURISource;
  /*
   * Should the button image be tinted
   */
  isImageTinted?: boolean;
  /*
   * ButtonStyle wrapped enum
   */
  buttonStyle?: NativeButtonStyle;
  /*
   * A button can be enabled or disabled.
   */
  enabled?: boolean;
  /*
   * A callback to call on button click event
   */
  onPress?: () => void;
}

export interface NativeButtonTokens {
  /*
   * Button background color
   * (only works for macOS)
   */
  accentColor?: string;
}

// iOS maps acrylic to primary style since it's a mac specifc style
export type NativeButtonStyle = 'primary' | 'secondary' | 'borderless' | 'acrylic';
export type NativeButtonViewProps = NativeButtonProps & NativeButtonTokens;

export interface NativeButtonType {
  props: NativeButtonProps;
  tokens: NativeButtonTokens;
  slotProps: {
    root: NativeButtonViewProps;
  };
}
