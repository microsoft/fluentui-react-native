/** @jsx withSlots */
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { buttonName, ButtonType, ButtonProps } from './Button.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings, getDefaultSize } from './Button.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from './useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps, IPressableState } from '@fluentui-react-native/interactive-hooks';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
export const buttonLookup = (layer: string, state: IPressableState, userProps: ButtonProps): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === getDefaultSize()) ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'rounded') ||
    (layer === 'hovered' && state[layer] && !userProps.loading) ||
    (layer === 'hasContent' && !userProps.iconOnly) ||
    (layer === 'hasIconAfter' && (userProps.icon || userProps.loading) && userProps.iconPosition === 'after') ||
    (layer === 'hasIconBefore' && (userProps.icon || userProps.loading) && (!userProps.iconPosition || userProps.iconPosition === 'before'))
  );
};

const extractMarginAndroid = (style) => {
  const marginKeys = [
    'margin',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginStart',
    'marginEnd',
    'marginVertical',
    'marginHorizontal',
  ];
  const extractedMargin = {},
    mask = {};
  marginKeys.forEach((key) => {
    if (style && style[key]) {
      extractedMargin[key] = style[key];
      mask[key] = 0;
    }
  });
  return [extractedMargin, { ...style, ...mask }];
};

export const Button = compose<ButtonType>({
  displayName: buttonName,
  ...stylingSettings,
  slots: {
    root: View,
    ripple: Pressable,
    icon: Icon,
    content: Text,
  },
  useRender: (userProps: ButtonProps, useSlots: UseSlots<ButtonType>) => {
    const [rippledPressed, setRippleState] = React.useState(false);
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) =>
      buttonLookup(layer, { ...button.state, pressed: rippledPressed || button.state.pressed }, userProps),
    );

    // now return the handler for finishing render
    return (final: ButtonProps, ...children: React.ReactNode[]) => {
      const { icon, iconOnly, iconPosition, loading, accessibilityLabel, ...mergedProps } = mergeProps(button.props, final);

      const shouldShowIcon = !loading && icon;
      if (__DEV__ && iconOnly) {
        React.Children.forEach(children, (child) => {
          if (typeof child === 'string') {
            console.warn('iconOnly should not be set when Button has content.');
          }
        });
      }

      let childText = '';
      if (accessibilityLabel === undefined) {
        React.Children.forEach(children, (child) => {
          if (typeof child === 'string') {
            childText = child; // We only automatically support the one child string.
          }
        });
      }
      const label = accessibilityLabel ?? childText;
      const buttonContent = (
        <React.Fragment>
          {loading && <ActivityIndicator />}
          {shouldShowIcon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          {React.Children.map(children, (child) =>
            typeof child === 'string' ? <Slots.content key="content">{child}</Slots.content> : child,
          )}
          {shouldShowIcon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </React.Fragment>
      );

      const hasRipple = Platform.OS === 'android';
      if (hasRipple) {
        const [extractedMargin, styleWithoutMargin] = extractMarginAndroid(mergedProps.style);
        return (
          <Slots.root style={extractedMargin}>
            <Slots.ripple
              accessibilityLabel={label}
              {...mergedProps}
              style={styleWithoutMargin}
              onPressIn={() => {
                setRippleState(true);
                mergedProps.onPressIn?.();
              }}
              onPressOut={() => {
                setRippleState(false);
                mergedProps.onPressOut?.();
              }}
            >
              {buttonContent}
            </Slots.ripple>
          </Slots.root>
        );
      } else {
        return (
          <Slots.root {...mergedProps} accessibilityLabel={label}>
            {buttonContent}
          </Slots.root>
        );
      }
    };
  },
});
