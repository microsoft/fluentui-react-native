import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { InputTokens } from './Input.types';

export const defaultInputTokens: TokenSettings<InputTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.ghostBackground,
    color: t.colors.brandBackground,
    borderColor: t.colors.brandBackground,
    iconColor: 'black',
    iconSize: 24,
    dismissIconColor: 'black',
    dismissIconSize: 24,
    variant: 'caption2',
    assistiveTextColor: 'red',
    assistiveTextFont: 'caption2',
    inputTextFont: 'body1',
    spacingIconContent: 16,
    paddingHorizontal: 16,
    spacingInputVertical: 12,
    spacingAssistiveTextVertical: 4,
    spacingLabelTop: 12,
    spacingInputSecondary: 8,
    spacingDismissIconStart: 8,
    spacingAssistiveTextStart: 16 + 24,
    spacingLabelStart: 16 + 24,
  } as InputTokens);
