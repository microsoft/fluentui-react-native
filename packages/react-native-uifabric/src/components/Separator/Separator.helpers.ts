import { ISeparatorTokens } from './Separator.types';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { IViewWin32Props } from '@office-iss/react-native-win32';

const _keyProps: (keyof ISeparatorTokens)[] = ['separatorWidth', 'vertical'];

function _processor(tokenProps: ISeparatorTokens): IViewWin32Props {
  return {
    style: {
      borderLeftWidth: (tokenProps.vertical && tokenProps.separatorWidth) || undefined,
      borderTopWidth: (!tokenProps.vertical && tokenProps.separatorWidth) || undefined
    }
  };
}

export const separatorTokenProcessor = styleFunction<IViewWin32Props, ISeparatorTokens, ITheme>(_processor, _keyProps);
