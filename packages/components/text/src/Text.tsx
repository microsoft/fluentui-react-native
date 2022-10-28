/** @jsx withSlots */
import {
  applyTokenLayers,
  compressible,
  fontStyles,
  FontWeightValue,
  mergeStyles,
  useSlot,
  UseTokens,
  useFluentTheme,
  patchTokens,
  withSlots,
} from '@fluentui-react-native/framework';
import { useAsPressable, useKeyProps } from '@fluentui-react-native/interactive-hooks';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { I18nManager, Platform, Text as RNText } from 'react-native';
import { textName, TextProps, TextTokens } from './Text.types';
import { useTextTokens } from './TextTokens';
import React from 'react';

const textState: (keyof TextTokens)[] = ['hovered', 'focused', 'pressed'];

const emptyProps = {};
export const Text = compressible<TextProps, TextTokens>((props: TextProps, useTokens: UseTokens<TextTokens>) => {
  if (props === undefined) {
    props = emptyProps;
  }

  // split out color and variant from props
  const {
    align = undefined,
    block,
    color,
    font,
    italic,
    onAccessibilityTap,
    onKeyUp,
    keyUpEvents,
    onKeyDown,
    keyDownEvents,
    onPress,
    size,
    strikethrough,
    style,
    truncate = false,
    underline,
    variant,
    weight,
    wrap = true,
    ...rest
  } = props;

  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  /* Only if onPress is set */
  const pressable = useAsPressable({ ...rest, onPress });
  const textOnPress = React.useCallback(
    (e) => {
      if (onPress) {
        onPress(e);
      }
      e.stopPropagation();
    },
    [onPress],
  );
  const keyProps = useKeyProps(textOnPress, ' ', 'Enter');
  [tokens] = applyTokenLayers(tokens, textState, cache, (layer) => pressable.state[layer]);

  const textAlign = I18nManager.isRTL
    ? align === 'start'
      ? 'right'
      : align === 'end'
      ? 'left'
      : align
    : align === 'start'
    ? 'left'
    : align === 'end'
    ? 'right'
    : align;

  const onAccTap = React.useCallback(
    (event?) => {
      onAccessibilityTap ? onAccessibilityTap() : onPress(event);
    },
    [onPress, onAccessibilityTap],
  );

  // override tokens from props
  [tokens, cache] = patchTokens(tokens, cache, {
    color: color ?? tokens.color,
    variant,
    fontFamily: font == 'base' ? 'primary' : font,
    fontSize: globalTokens.font.size[size],
    fontWeight: globalTokens.font.weight[weight] as FontWeightValue,
    // leave it undefined for tokens to be set by user
    fontStyle: italic ? 'italic' : undefined,
    textAlign: textAlign,
    textDecorationLine:
      underline && strikethrough ? 'underline line-through' : underline ? 'underline' : strikethrough ? 'line-through' : undefined,
  });

  // now build the text style from tokens that can be shared between different Text instances
  const [tokenStyle] = cache(
    () => ({
      margin: 0,
      color: tokens.color,
      fontStyle: tokens.fontStyle,
      textAlign: tokens.textAlign,
      textDecorationLine: tokens.textDecorationLine,
      ...fontStyles.from(tokens, theme),
    }),
    ['color', 'fontStyle', 'textAlign', 'textDecorationLine', ...fontStyles.keys],
  );

  /*These callbacks are not implemented on iOS/macOS, and cause Redboxes if passed in. Limit to only windows/win32 for now*/
  const filteredProps = {
    onKeyUp: Platform.OS === (('win32' as any) || 'windows') ? onKeyUp : undefined,
    keyUpEvents: Platform.OS === (('win32' as any) || 'windows') ? keyUpEvents : undefined,
    validKeysUp: undefined,
    onKeyDown: Platform.OS === (('win32' as any) || 'windows') ? onKeyDown : undefined,
    keyDownEvents: Platform.OS === (('win32' as any) || 'windows') ? keyDownEvents : undefined,
    validKeysDown: undefined,
    onMouseEnter: Platform.OS === (('win32' as any) || 'windows') ? pressable.props.onMouseEnter : undefined,
    onMouseLeave: Platform.OS === (('win32' as any) || 'windows') ? pressable.props.onMouseLeave : undefined,
    onAccessibilityTap: Platform.OS === (('win32' as any) || 'windows') ? onAccTap : undefined,
  };

  const mergedProps = {
    ...rest,
    ...keyProps,
    ...pressable.props,
    ...filteredProps,
    numberOfLines: truncate || !wrap ? 1 : 0,
    style: mergeStyles(tokenStyle, props.style),
  };

  const RootSlot = useSlot<TextProps>(RNText, mergedProps);

  return (_final: TextProps, children: React.ReactNode) => {
    return <RootSlot ellipsizeMode={!wrap && !truncate ? 'clip' : 'tail'}>{children}</RootSlot>;
  };
}, useTextTokens);
Text.displayName = textName;

export default Text;
