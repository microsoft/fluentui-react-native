import { ViewProps, ColorValue } from 'react-native';

interface SeparatorPropTokens {
  /**
   * Specifies whether the separator is vertical or horizontal. If true, then it's vertical.
   * @defaultValue 'false'
   */
  vertical?: boolean;
}

export interface SeparatorTokens extends SeparatorPropTokens {
  /**
   * Specifies the width of the separator. This will be interpreted as DIPs on Windows and Android, but as points on Mac and iOS.
   * @defaultValue 1
   */
  separatorWidth?: number;

  /**
   * Specifies the color of the separator
   */
  color?: ColorValue;
}

export interface SeparatorProps extends ViewProps, SeparatorPropTokens {
  /**
   * Specifies where the text or image should be aligned in the separator, when the separator has a text or image label.
   * @defaultValue 'center'
   * Not yet supported
   */
  // alignContent?: 'start' | 'center' | 'end';
}

export interface SeparatorType {
  props: SeparatorProps;
  slotProps: {
    root: ViewProps;
  };
  tokens: SeparatorTokens;
}
