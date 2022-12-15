import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    rootHorizontalPadding: globalTokens.size160,
    color: t.colors.neutralForeground3,
    variant: 'body1',
    labelMarginLeft: globalTokens.size160,
    subtextVariant: 'caption1',
    flexDirection: 'row',
    alignItems: 'center',
    labelPositionBelow: {
      flexDirection: 'column',
      marginLeft: globalTokens.sizeNone,
    },

    radioViewSize: 24,
    radioOuterCircleSize: 20,
    radioInnerCircleSize: 10,
    radioBorderStyle: 'solid',
    radioBorderWidth: globalTokens.stroke.width15,

    // Unselected, Rest
    radioBorder: t.colors.neutralStrokeAccessible,
    radioVisibility: 0,

    disabled: {
      // Unselected, Disabled
      radioBorder: t.colors.neutralStrokeDisabled,
      radioVisibility: 0,
    },

    selected: {
      // Selected, Rest
      radioBorder: t.colors.brandBackground,
      radioFill: t.colors.brandForeground1,
      radioVisibility: 1,

      disabled: {
        // Selected, Disabled
        radioBorder: t.colors.brandBackgroundDisabled,
        radioFill: t.colors.brandForegroundDisabled2,
        radioVisibility: 1,
      },
    },
  } as RadioTokens);
