import { ITextComponent, ITextRenderData, ITextProps } from './Text.types';
import { compose } from '@uifabric/foundation-compose';
import { textTokenKeys, foregroundColorKeys, processTextTokens, processForegroundTokens } from '../tokens/index';
import { mergeSettings } from '@uifabric/theme-settings';
import { loadTextSettings } from './Text.settings';

loadTextSettings();

export const Text = compose<ITextComponent>({
  className: 'RNFText',
  tokenProcessors: [
    {
      keyProps: (textTokenKeys as (keyof ITextProps)[]).concat(foregroundColorKeys),
      processor: (keyProps: ITextProps, data: ITextRenderData) => {
        const toMerge = { root: {} };
        processTextTokens(keyProps, toMerge.root);
        processForegroundTokens(keyProps, toMerge.root);
        return mergeSettings(data.slotProps, toMerge);
      }
    }
  ],
  slots: {
    root: 'div'
  }
});

export default Text;
