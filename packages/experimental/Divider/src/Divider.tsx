/** @jsx withSlots */
/** @jsxFrag */
import React from 'react';
import { View, ViewProps } from 'react-native';
import { dividerName, DividerProps, DividerTokens } from './Divider.types';
import { withSlots, compressible, UseTokens, useSlot, useFluentTheme, patchTokens, mergeStyles } from '@fluentui-react-native/framework';
import { TextV1 as Text, TextProps } from '@fluentui-react-native/text';
import { IconV1 as Icon, IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import { useDividerTokens } from './DividerTokens';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { colorsFromPropsAndTheme, useDividerSlotProps } from './Divider.styling';

export const Divider = compressible<DividerProps, DividerTokens>((props: DividerProps, useTokens: UseTokens<DividerTokens>) => {
  const { alignContent = 'center', appearance = 'default', color, icon, insetSize = 0, vertical = false } = props;

  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  // We want to patch our initial tokens from useTokens() with the token values below because they are dependent on the above props.
  // With compressible, we can also access our tokens at the final rendering stage, which we will need to correctly set our divider height.
  [tokens, cache] = patchTokens(tokens, cache, {
    flexAfter: alignContent === 'end' ? 0 : 1,
    flexBefore: alignContent === 'start' ? 0 : 1,
    minHeight: vertical ? globalTokens.size240 : 0,
    ...colorsFromPropsAndTheme({ appearance, color }, theme),
  });

  // get slot props from these tokens
  const { rootProps, beforeLineProps, afterLineProps, wrapperProps, textProps, iconProps } = useDividerSlotProps(
    { icon, insetSize, vertical },
    tokens,
  );

  // build slots
  const RootSlot = useSlot<ViewProps>(View, rootProps);
  const BeforeLineSlot = useSlot<ViewProps>(View, beforeLineProps);
  const AfterLineSlot = useSlot<ViewProps>(View, afterLineProps);
  const WrapperSlot = useSlot<ViewProps>(View, wrapperProps);
  const TextSlot = useSlot<TextProps>(Text, textProps);
  const IconSlot = useSlot<IconProps>(Icon, iconProps);

  return (final: DividerProps, ...children: React.ReactNode[]) => {
    props = { alignContent, appearance, color, icon, insetSize, vertical, ...final };
    // change root style if there is a text child
    let textContent: string;
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string') {
        textContent = child;
      }
    });

    const hasContent = textContent !== undefined || props.icon !== undefined;

    // This style must be set here because we need to know if text content is passed in the final render to set the height correctly
    const mergedProps = {
      ...rootProps,
      style: mergeStyles(rootProps, props.vertical && textContent ? { minHeight: 84 } : {}),
    };

    return (
      <RootSlot {...mergedProps}>
        <BeforeLineSlot />
        {hasContent && (
          <>
            <WrapperSlot>
              {textContent && <TextSlot>{textContent}</TextSlot>}
              {props.icon && !textContent && <IconSlot />}
            </WrapperSlot>
            <AfterLineSlot />
          </>
        )}
      </RootSlot>
    );
  };
}, useDividerTokens);
Divider.displayName = dividerName;
