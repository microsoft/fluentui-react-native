import { ITextType } from './Text.types';
import { compose } from '@uifabricshared/foundation-compose';
import { foregroundColorTokens, textTokens } from '../tokens/index';
import { settings } from './Text.settings';

export const Text = compose<ITextType>({
  displayName: 'Text',
  settings,
  slots: {
    root: { slotType: 'div' }
  },
  styles: {
    root: [textTokens, foregroundColorTokens]
  }
});

export default Text;
