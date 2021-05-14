import { buttonName, ButtonTokens, ButtonSlotProps, ButtonProps } from './Button.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';
import { buttonStates, defaultButtonTokens } from './ButtonTokens';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { ImageProps } from 'react-native';

export const stylingSettings: UseStylingOptions<ButtonProps, ButtonSlotProps, ButtonTokens> = {
  tokens: [defaultButtonTokens, buttonName],
  states: buttonStates,
  slotProps: {
    root: buildProps(
      (tokens: ButtonTokens, theme: Theme) =>
        ({
          style: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            justifyContent: 'center',
            width: tokens.width,
            paddingStart: 16,
            paddingEnd: 16,
            backgroundColor: tokens.backgroundColor,
            ...borderStyles.from(tokens, theme),
            ...layoutStyles.from(tokens, theme),
          },
        } as React.PropsWithRef<IViewWin32Props>),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    content: buildProps(
      (tokens: ButtonTokens, theme: Theme) =>
        ({
          style: {
            color: tokens.color,
            ...fontStyles.from(tokens, theme),
          },
        } as TextProps),
      ['color', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ButtonTokens) =>
        ({
          style: {
            tintColor: tokens.iconColor,
          },
        } as ImageProps),
      ['iconColor'],
    ),
  },
};
