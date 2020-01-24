import { ViewProps } from 'react-native';
import { IForegroundColorTokens } from '../../tokens';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const separatorName = 'RNFSeparator';

interface ISeparatorPropTokens {
  /**
   * Specifies whether the separator is vertical or horizontal. If true, then it's vertical.
   * @defaultValue 'false'
   */
  vertical?: boolean;
}

export interface ISeparatorTokens extends IForegroundColorTokens, ISeparatorPropTokens {
  /**
   * Specifies the width of the separator. This will be interpreted as DIPs on Windows and Android, but as points on Mac and iOS.
   * @defaultValue 1
   */
  separatorWidth?: number;
}

export interface ISeparatorProps extends ViewProps, ISeparatorPropTokens {
  /**
   * Specifies where the text or image should be aligned in the separator, when the separator has a text or image label.
   * @defaultValue 'center'
   */
  alignContent?: 'start' | 'center' | 'end';
}

export interface ISeparatorType {
  props: ISeparatorProps;
  slotProps: {
    root: IViewWin32Props;
  };
  tokens: ISeparatorTokens;
}
