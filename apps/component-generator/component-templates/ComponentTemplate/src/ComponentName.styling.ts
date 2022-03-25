import { componentName, ComponentNameTokens, ComponentNameSlotProps, ComponentNameProps } from './ComponentName.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';
import { defaultComponentNameTokens } from './ComponentNameTokens';

export const componentNameStates: (keyof ComponentNameTokens)[] = ['small', 'medium', 'large'];

export const stylingSettings: UseStylingOptions<ComponentNameProps, ComponentNameSlotProps, ComponentNameTokens> = {
  tokens: [defaultComponentNameTokens, componentName],
  states: componentNameStates,
  slotProps: {
    root: buildProps(
      (tokens: ComponentNameTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          width: 300,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    text: buildProps(
      (tokens: ComponentNameTokens, theme: Theme) => {
        return {
          style: {
            color: tokens.color,
            ...fontStyles.from(tokens, theme),
          },
        };
      },
      ['color', ...fontStyles.keys],
    ),
  },
};
