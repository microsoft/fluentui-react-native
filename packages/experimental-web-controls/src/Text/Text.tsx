import { ITextComponent } from './Text.types';
import { compose } from '@uifabric/foundation-compose';
import { foregroundColorTokens, textTokens } from '../tokens/index';
import { loadTextSettings } from './Text.settings';

loadTextSettings();

export const Text = compose<ITextComponent>({
  className: 'RNFText',
  slots: {
    root: {
      slotType: 'div',
      styleFactories: [textTokens, foregroundColorTokens]
    }
  }
});

export default Text;
