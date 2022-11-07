/** @jsx withSlots */
import {
  fontStyles,
  withSlots,
  UseTokens,
  useFluentTheme,
  mergeStyles,
  compressible,
  patchTokens,
  FontWeightValue,
} from '@fluentui-react-native/framework';
import { useKeyProps } from '@fluentui-react-native/interactive-hooks';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { I18nManager, Platform, Text as RNText } from 'react-native';
import { textName, TextProps, TextTokens } from './Text.types';
import { useTextTokens } from './TextTokens';
import React from 'react';

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
    onKeyDown,
    keyUpEvents,
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
  // get the tokens from the theme
  let [tokens, cache] = useTokens(theme);

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

  const onAccTap = React.useCallback(
    (event?) => {
      onAccessibilityTap ? onAccessibilityTap() : onPress(event);
    },
    [onPress, onAccessibilityTap],
  );

  // override tokens from props
  [tokens, cache] = patchTokens(tokens, cache, {
    color,
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

  const filteredProps = {
    onKeyUp: Platform.OS === (('win32' as any) || 'windows') ? onKeyUp : undefined,
    keyUpEvents: Platform.OS === (('win32' as any) || 'windows') ? keyUpEvents : undefined,
    validKeysUp: undefined,
    onKeyDown: Platform.OS === (('win32' as any) || 'windows') ? onKeyDown : undefined,
    keyDownEvents: Platform.OS === (('win32' as any) || 'windows') ? keyDownEvents : undefined,
    validKeysDown: undefined,
    onAccessibilityTap: Platform.OS === (('win32' as any) || 'windows') ? onAccTap : undefined,
  };

  // return a continuation function that allows this text to be compressed
  return (extra: TextProps, children: React.ReactNode) => {
    const mergedProps = {
      ...rest,
      ...keyProps,
      ...filteredProps,
      ...extra,
      onPress,
      numberOfLines: truncate || !wrap ? 1 : 0,
      style: mergeStyles(tokenStyle, props.style, extra?.style),
    };
    return (
      <RNText ellipsizeMode={!wrap && !truncate ? 'clip' : 'tail'} {...mergedProps}>
        {children}
      </RNText>
    );
  };
}, useTextTokens);
Text.displayName = textName;

export default Text;
