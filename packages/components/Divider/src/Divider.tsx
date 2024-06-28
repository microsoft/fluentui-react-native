/** @jsxRuntime classic */
/** @jsx withSlots */
/** @jsxFrag */
import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

import { withSlots, compressible, useSlot, useFluentTheme, patchTokens, mergeProps } from '@fluentui-react-native/framework';
import type { UseTokens } from '@fluentui-react-native/framework';
import { IconV1 as Icon } from '@fluentui-react-native/icon';
import type { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';
import type { TextProps } from '@fluentui-react-native/text';

import { colorsFromAppearance, getBeforeLineSlotProps, getRootSlotProps, useDividerSlotProps } from './Divider.styling';
import { dividerName } from './Divider.types';
import type { DividerProps, DividerTokens } from './Divider.types';
import { useDividerTokens } from './DividerTokens';

export const Divider = compressible<DividerProps, DividerTokens>((props: DividerProps, useTokens: UseTokens<DividerTokens>) => {
  // Set default values for props
  props = {
    alignContent: 'center',
    appearance: 'default',
    insetSize: 0,
    vertical: false,
    ...props,
  };

  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  // We want to patch our initial tokens from useTokens() with the token values below because they are dependent on the above props.
  // With compressible, we can also access our tokens at the final rendering stage, which we will need to correctly set our divider height.
  [tokens, cache] = patchTokens(tokens, cache, {
    flexAfter: props.alignContent === 'end' ? 0 : 1,
    flexBefore: props.alignContent === 'start' ? 0 : 1,
    ...colorsFromAppearance(props.appearance, tokens, theme),
  });

  // get slot props from these tokens
  const { rootProps, beforeLineProps, afterLineProps, wrapperProps, textProps, iconProps } = useDividerSlotProps(props, tokens, theme);

  // build slots
  const RootSlot = useSlot<ViewProps>(View, rootProps);
  const BeforeLineSlot = useSlot<ViewProps>(View, beforeLineProps);
  const AfterLineSlot = useSlot<ViewProps>(View, afterLineProps);
  const WrapperSlot = useSlot<ViewProps>(View, wrapperProps);
  const TextSlot = useSlot<TextProps>(Text, textProps);
  const IconSlot = useSlot<IconProps>(Icon, iconProps);

  return (final: DividerProps, ...children: React.ReactNode[]) => {
    final = mergeProps(props, final);
    // change root style if there is a text child
    let textContent: string;
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string') {
        textContent = child;
      }
    });

    const hasContent = textContent !== undefined || props.icon !== undefined;

    // Patch styling / props of root and beforeLine slots if there's content
    const finalRootProps = getRootSlotProps(final, rootProps, hasContent);
    const finalBeforeLineProps = getBeforeLineSlotProps(beforeLineProps, hasContent);

    return (
      <RootSlot {...finalRootProps}>
        <BeforeLineSlot {...finalBeforeLineProps} />
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
