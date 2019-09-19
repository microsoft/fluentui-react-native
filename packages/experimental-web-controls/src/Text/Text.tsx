import { ITextComponent, ITextSlotProps } from './Text.types';
import { compose, IUseOpinionatedStyling } from '@uifabric/foundation-compose';
import { foregroundColorTokens, textTokens } from '../tokens/index';
import { loadTextSettings } from './Text.settings';
import { mergeSettings } from '@uifabric/foundation-settings';

loadTextSettings();

export const Text = compose<ITextComponent>({
  displayName: 'Text',
  settings: ['RNFText'],
  slots: {
    root: {
      slotType: 'div',
      styleFactories: [textTokens, foregroundColorTokens]
    }
  },
  usePrepareProps: (props: ITextProps, useStyling: IUseOpinionatedStyling<ITextProps>) => {
    const slotProps = useStyling(props);
    return mergeSettings(slotProps, { root: props });
  }
});

export default Text;
