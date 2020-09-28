import { ViewProps } from 'react-native';
import { IForegroundColorTokens } from '@fluentui-react-native/tokens';

export const separatorName = 'Separator';

interface SeparatorPropTokens {
  /**
   * Specifies whether the separator is vertical or horizontal. If true, then it's vertical.
   * @defaultValue 'false'
   */
  vertical?: boolean;
}

export interface SeparatorTokens extends IForegroundColorTokens, SeparatorPropTokens {
  /**
   * Specifies the width of the separator. This will be interpreted as DIPs on Windows and Android, but as points on Mac and iOS.
   * @defaultValue 1
   */
  separatorWidth?: number;
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
