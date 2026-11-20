import type { TextStyle, ViewStyle } from 'react-native';
import { defineComponentTokens, getGapStyleValue, resolveTokenStates } from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens, ComponentTokenPatch, TokenState } from '@fluentui-react-native/design/styling';
import { colorToken, dimensionToken, enumToken, iconTokenProps, numericToken, stringToken } from '../../common/tokenFields';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { ButtonState } from './button.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const buttonSizeAxis = ['size', ['small', 'medium', 'large']] as const;
const buttonTokenAxes = [
  buttonSizeAxis,
  ['shape', ['rounded', 'square', 'circle']],
  ['iconOnly', [false, true]],
  ['appearance', ['primary', 'secondary', 'outline', 'subtle']],
  ['selected', [false, true]],
  ['visualState', ['rest', 'hovered', 'pressed', 'disabled']],
] as const;

const buttonTokenDomains = {
  root: {
    style: {
      alignItems: enumToken('flex-start', 'flex-end', 'center', 'stretch', 'baseline'),
      alignSelf: enumToken('auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'),
      borderStyle: enumToken('solid', 'dotted', 'dashed'),
      flexDirection: enumToken('row', 'column', 'row-reverse', 'column-reverse'),
      justifyContent: enumToken('flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'),
      borderWidth: numericToken,
      minHeight: dimensionToken,
      minWidth: dimensionToken,
      borderRadius: dimensionToken,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      gap: getGapStyleValue,
      backgroundColor: colorToken,
      borderColor: colorToken,
    },
    props: {},
  },
  content: {
    style: {
      flexShrink: numericToken,
      textAlign: enumToken('auto', 'left', 'right', 'center', 'justify'),
      fontFamily: stringToken,
      fontSize: numericToken,
      lineHeight: numericToken,
      fontWeight: enumToken<TextStyle['fontWeight'][]>(
        'normal',
        'bold',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
        100,
        200,
        300,
        400,
        500,
        600,
        700,
        800,
        900,
        'ultralight',
        'thin',
        'light',
        'regular',
        'medium',
        'semibold',
        'condensedBold',
        'condensed',
        'heavy',
        'black',
      ),
      color: colorToken,
    },
    props: {},
  },
  icon: { style: {}, props: iconTokenProps },
};

type ButtonAxes = typeof buttonTokenAxes;
type ButtonDomains = typeof buttonTokenDomains;
type ButtonTokenState = TokenState<ButtonAxes>;
export type ButtonTokens = CompiledComponentTokens<ButtonAxes, ButtonDomains>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.button': ComponentTokenPatch<ButtonAxes, ButtonDomains>;
  }
}

export const buttonTokenDefinition = defineComponentTokens({
  id: 'furn.button',
  axes: buttonTokenAxes,
  slots: buttonTokenDomains,
  schema,
});

export function getButtonVisualState(disabled: boolean, pressed: boolean, hovered: boolean): ButtonTokenState['visualState'] {
  return disabled ? 'disabled' : pressed ? 'pressed' : hovered ? 'hovered' : 'rest';
}

export function resolveButtonChrome(state: ButtonState): {
  root: ViewStyle;
  content: TextStyle;
  icon: Pick<IconElementProps, 'color' | 'width' | 'height'>;
} {
  const { buttonTokens } = state;
  const root = resolveTokenStates(buttonTokens.root, state).style;
  const content = resolveTokenStates(buttonTokens.content, state).style;
  const icon = resolveTokenStates(buttonTokens.icon, state).props;
  return { root, content, icon };
}
