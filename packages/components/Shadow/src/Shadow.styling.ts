import { shadow, ShadowTokens, ShadowSlotProps, ShadowProps } from './Shadow.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultShadowTokens } from './ShadowTokens';

export const stylingSettings: UseStylingOptions<ShadowProps, ShadowSlotProps, ShadowTokens> = {
  tokens: [defaultShadowTokens, shadow],
  slotProps: {
    root: buildProps((tokens: ShadowTokens, theme: Theme) => ({
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        justifyContent: 'center',
        ...borderStyles.from(tokens, theme),
        ...layoutStyles.from(tokens, theme),
      },
    })),
  },
};
