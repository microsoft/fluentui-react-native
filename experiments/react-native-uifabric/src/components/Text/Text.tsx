import { textName, ITextType } from './Text.types';
import { compose } from '@uifabricshared/foundation-compose';
import { Text as RNText } from 'react-native';
import { filterTextProps } from '../../utilities/RenderHelpers';
import { foregroundColorTokens, textTokens } from '../../tokens';
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

export default Text;
