import { ITextProps } from './Text.types';
import { compose } from '@uifabricshared/foundation-compose';
import { foregroundColorTokens, textTokens } from '../tokens/index';
import { settings } from './Text.settings';

export const Text = compose<ITextProps>({
  displayName: 'Text',
  settings,
  slots: {
    root: {
      slotType: 'div',
      styleFactories: [textTokens, foregroundColorTokens]
    }
  }
});

export default Text;
