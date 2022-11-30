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
import { useFontMetricsScaleFactors } from '@fluentui-react-native/experimental-native-font-metrics';

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

  // TODO(#2268): Remove once RN Core properly supports Dynamic Type scaling
  const fontMetricsScaleFactors = useFontMetricsScaleFactors();

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

  // TODO(#2268): Remove once RN Core properly supports Dynamic Type scaling
  const dynamicTypeVariant = Platform.OS === 'ios' ? tokens.dynamicTypeRamp : undefined;

  // override tokens from props
  [tokens, cache] = patchTokens(tokens, cache, {
    color,
    variant,
    fontFamily: font == 'base' ? 'primary' : font,
    fontSize: globalTokens.font['size' + size],
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

  // [TODO(#2268): Remove once RN Core properly supports Dynamic Type scaling
  let scaleStyleAdjustments: TextTokens = emptyProps;
  // tokenStyle.fontSize and tokenStyle.lineHeight can also be strings (e.g., "14px").
  // Therefore, we only support scaling for number-based size values in order to avoid any messy calculations.
  if (dynamicTypeVariant !== undefined && typeof tokenStyle.fontSize === 'number' && typeof tokenStyle.lineHeight === 'number') {
    const scaleFactor = fontMetricsScaleFactors[dynamicTypeVariant] ?? 1;
    scaleStyleAdjustments = {
      fontSize: tokenStyle.fontSize * scaleFactor,
      lineHeight: tokenStyle.lineHeight * scaleFactor,
    };
  }
  // ]TODO(#2268)

  const isWinPlatform = Platform.OS === (('win32' as any) || 'windows');
  const filteredProps = {
    onKeyUp: isWinPlatform ? onKeyUp : undefined,
    keyUpEvents: isWinPlatform ? keyUpEvents : undefined,
    validKeysUp: undefined,
    onKeyDown: isWinPlatform ? onKeyDown : undefined,
    keyDownEvents: isWinPlatform ? keyDownEvents : undefined,
    validKeysDown: undefined,
    onAccessibilityTap: isWinPlatform ? onAccTap : undefined,
  };

  // return a continuation function that allows this text to be compressed
  return (extra: TextProps, children: React.ReactNode) => {
    const mergedProps = {
      ...rest,
      ...keyProps,
      ...filteredProps,
      ...extra,
      ...(dynamicTypeVariant !== undefined && { allowFontScaling: false }), // TODO(#2268): Remove once RN Core properly supports Dynamic Type scaling
      onPress,
      numberOfLines: truncate || !wrap ? 1 : 0,
      style: mergeStyles(tokenStyle, props.style, extra?.style, scaleStyleAdjustments),
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
