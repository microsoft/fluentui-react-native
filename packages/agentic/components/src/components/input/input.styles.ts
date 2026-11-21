import { StyleSheet } from 'react-native';
import type { ColorValue, TextStyle, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import {
  colorToken,
  defineComponentTokens,
  getComponentTokens,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { InputSize, InputVariant, InputVisualState } from './input.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const inputStyles = StyleSheet.create({
  root: { alignSelf: 'stretch', flexDirection: 'column', overflow: 'hidden' },
  contents: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  iconTextStack: { alignItems: 'center', flexDirection: 'row', flexGrow: 1, flexShrink: 1, minWidth: 0 },
  iconEnd: { alignItems: 'center', flexDirection: 'row', flexShrink: 0, minWidth: 0 },
  textInput: { backgroundColor: 'transparent', borderWidth: 0, flexGrow: 1, flexShrink: 1, minWidth: 0, padding: 0 },
  underline: { left: 0, position: 'absolute', right: 0, bottom: 0 },
});

type InputAxes = { size: InputSize; variant: InputVariant; visualState: InputVisualState };
const slots = {
  root: { style: { borderRadius: numericToken }, props: {} },
  contents: {
    style: {
      minHeight: numericToken,
      gap: numericToken,
      borderWidth: numericToken,
      borderColor: colorToken,
      paddingTop: numericToken,
      paddingBottom: numericToken,
    },
    props: {},
  },
  iconTextStack: { style: { gap: numericToken, paddingStart: numericToken, paddingEnd: numericToken }, props: {} },
  iconEnd: { style: { gap: numericToken, paddingEnd: numericToken }, props: {} },
  textInput: { style: { fontFamily: stringToken, fontSize: numericToken, color: colorToken }, props: { placeholderTextColor: colorToken } },
  underline: { style: { borderBottomWidth: numericToken, borderBottomColor: colorToken }, props: {} },
  underlineFocus: { style: { borderBottomWidth: numericToken, borderBottomColor: colorToken }, props: {} },
  icon: { style: {}, props: iconTokenProps },
};
type InputDomains = typeof slots;
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.input': ComponentTokenPatch<InputAxes, InputDomains>;
  }
}
const inputTokenDefinition = defineComponentTokens<InputAxes, InputDomains>({ id: 'furn.input', slots, schema });

export type InputResolvedStyles = {
  root: ViewStyle;
  contents: ViewStyle;
  iconTextStack: ViewStyle;
  iconEnd: ViewStyle;
  underline: ViewStyle;
  underlineFocus: ViewStyle;
  textInput: TextStyle;
  icon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
  placeholderTextColor?: ColorValue;
};

export function getInputVisualState(state: {
  disabled: boolean;
  error: boolean;
  readOnly: boolean;
  focused: boolean;
  pressed: boolean;
  hovered: boolean;
}): InputVisualState {
  if (state.disabled) return 'disabled';
  if (state.error) return 'error';
  if (state.readOnly) return 'readOnly';
  if (state.focused) return 'focused';
  if (state.pressed) return 'pressed';
  if (state.hovered) return 'hovered';
  return 'rest';
}

export function getInputResolvedStyles(state: ThemeState & InputAxes & { focusVisible?: boolean }): InputResolvedStyles {
  const focusVisible = state.visualState !== 'disabled' && (state.focusVisible ?? state.visualState === 'focused');
  const chromeState = { ...state, visualState: state.visualState === 'focused' && !focusVisible ? ('rest' as const) : state.visualState };
  const tokens = getComponentTokens(state, inputTokenDefinition);
  const root = resolveTokenStates(tokens.root, state).style;
  const field = resolveTokenStates(tokens.contents, chromeState).style;
  const underline = resolveTokenStates(tokens.underline, chromeState).style;
  const underlineFocus = resolveTokenStates(tokens.underlineFocus, state).style;
  const stack = resolveTokenStates(tokens.iconTextStack, state).style;
  const end = resolveTokenStates(tokens.iconEnd, state).style;
  const editor = resolveTokenStates(tokens.textInput, state);
  const icon = resolveTokenStates(tokens.icon, state).props;
  const outline = state.variant === 'outline';
  const sideStroke = outline ? (field.borderWidth ?? 0) : 0;
  const bottomStroke = outline ? sideStroke : (underline.borderBottomWidth ?? 0);
  const inset = (padding: number | undefined, stroke: number) => Math.max(0, (padding ?? 0) - stroke);
  return {
    root,
    contents: {
      ...inputStyles.contents,
      ...field,
      paddingTop: inset(field.paddingTop, sideStroke),
      paddingBottom: inset(field.paddingBottom, bottomStroke),
    },
    iconTextStack: {
      ...inputStyles.iconTextStack,
      ...stack,
      paddingStart: inset(stack.paddingStart, sideStroke),
      paddingEnd: inset(stack.paddingEnd, sideStroke),
    },
    iconEnd: { ...inputStyles.iconEnd, ...end, paddingEnd: inset(end.paddingEnd, sideStroke) },
    underline: { ...inputStyles.underline, ...underline },
    underlineFocus: { ...inputStyles.underline, ...underlineFocus, bottom: bottomStroke, opacity: focusVisible ? 1 : 0 },
    textInput: { ...inputStyles.textInput, ...editor.style },
    icon: { ...icon },
    placeholderTextColor: editor.props.placeholderTextColor,
  };
}
