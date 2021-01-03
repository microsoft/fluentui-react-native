import { ImageURISource, ViewProps } from 'react-native';

export const nativeButtonName = 'NativeButton';

export interface NativeButtonProps {
  /*
   * Name of the icon to show on the Button.
   */
  image?: ImageURISource;
  /*
   * Text to show on the Button.
   */
  title?: string;
  /*
   * ButtonStyle wrapped enum
   */
  buttonStyle?: NativeButtonStyle;
  /*
   * A button can be enabled or disabled.
   */
  isEnabled?: boolean;
  /*
   * A callback to call on button click event
   */
  onPress?: () => void;
}

export interface NativeButtonTokens {
  /*
   * Button background color for rest state
   */
  accentColor?: string;
}

export type NativeButtonStyle = 'primary' | 'secondary' | 'borderless' | 'acrylic';
export type NativeButtonViewProps = NativeButtonProps & NativeButtonTokens & ViewProps;

export interface NativeButtonSlotProps {
  root: NativeButtonViewProps;
}

export interface NativeButtonType {
  props: NativeButtonProps;
  tokens: NativeButtonTokens;
  slotProps: NativeButtonSlotProps;
}
