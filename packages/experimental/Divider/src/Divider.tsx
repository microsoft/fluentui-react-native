/** @jsx withSlots */
/** @jsxFrag */
import { View, ViewProps } from 'react-native';
import { dividerName, DividerProps, DividerTokens } from './Divider.types';
import { withSlots, compressible, UseTokens, useSlot, useFluentTheme, patchTokens, mergeStyles } from '@fluentui-react-native/framework';
import { Text, TextProps } from '@fluentui-react-native/text';
import { IconV1, IconPropsV1 } from '@fluentui-react-native/icon';
import React from 'react';
import { useDividerTokens } from './DividerTokens';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { colorsFromAppearance, getDividerSlotProps } from './Divider.styling';

export const Divider = compressible<DividerProps, DividerTokens>((props: DividerProps, useTokens: UseTokens<DividerTokens>) => {
  const { alignContent = 'center', appearance = 'default', color, icon, insetSize = 0, vertical = false } = props;

  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  // call patch function to manually change token values from props (this is done by the lookup function in compose components)
  [tokens, cache] = patchTokens(tokens, cache, {
    color,
    insetSize,
    vertical,
    ...colorsFromAppearance(appearance, theme),
    contentPadding: globalTokens.size80,
    flexAfter: alignContent === 'end' ? 0 : 1,
    flexBefore: alignContent === 'start' ? 0 : 1,
    minHeight: props.vertical ? globalTokens.size240 : 0,
  });

  // get slot props from these tokens
  const {
    root: rootProps,
    beforeLine: beforeLineProps,
    afterLine: afterLineProps,
    wrapper: wrapperProps,
    text: textProps,
    icon: iconProps,
  } = React.useMemo(() => getDividerSlotProps(tokens, theme, icon), [tokens, theme, icon]);

  // build slots
  const RootSlot = useSlot<ViewProps>(View, rootProps);
  const BeforeLineSlot = useSlot<ViewProps>(View, beforeLineProps);
  const AfterLineSlot = useSlot<ViewProps>(View, afterLineProps);
  const WrapperSlot = useSlot<ViewProps>(View, wrapperProps);
  const TextSlot = useSlot<TextProps>(Text, textProps);
  const IconSlot = useSlot<IconPropsV1>(IconV1, iconProps);

  return (final: DividerProps, ...children: React.ReactNode[]) => {
    props = { ...props, ...final };
    // change root style if there is a text child
    let textContent: string;
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string') {
        textContent = child;
      }
    });

    const hasContent = textContent !== undefined || props.icon !== undefined;

    // This style must be set here because we need to know if text content is passed in the final render
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
