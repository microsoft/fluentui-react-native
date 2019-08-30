import { ITextComponent } from './Text.types';
import { compose } from '@uifabric/foundation-compose';
import { foregroundColorTokens, textTokens } from '../tokens/index';
import { loadTextSettings } from './Text.settings';
import { token } from '@uifabric/foundation-tokens';

loadTextSettings();

export const Text = compose<ITextComponent>({
  className: 'RNFText',
  tokens: [token(textTokens, 'root'), token(foregroundColorTokens, 'root')],
  slots: {
    root: 'div'
  }
});

export default Text;
