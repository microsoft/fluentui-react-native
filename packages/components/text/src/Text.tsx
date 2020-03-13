import { textName, ITextType } from './Text.types';
import { compose, IComposeTypecast } from '@uifabricshared/foundation-compose';
import { Text as RNText } from 'react-native';
import { filterTextProps, ITextPropsWin32 } from '@fluentui-react-native/adapters';
import { foregroundColorTokens, textTokens } from '@fluentui-react-native/tokens';
import { settings } from './Text.settings';

export const Text = compose<ITextType>({
  displayName: textName,
  settings,
  slots: {
    root: { slotType: RNText, filter: filterTextProps }
  },
  styles: {
    root: [textTokens, foregroundColorTokens]
  }
});

export const TextWin32 = Text as IComposeTypecast<ITextType<ITextPropsWin32>>;

export default Text;
