/** @jsx withSlots */
import * as React from 'react';
<<<<<<< HEAD
import { Platform, Pressable, View } from 'react-native';
=======
import { Platform, View } from 'react-native';
>>>>>>> 62b0f3d5c5d04004dafba11b9690536c78b59e2c
import { fabName, FABProps, FABType } from './FAB.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './FAB.styling';
import { compose, mergeProps, withSlots, UseSlots, memoize } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { Shadow } from '@fluentui-react-native/experimental-shadow';
import { extractMarginAndroid } from '../Button';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
const buttonLookup = (layer: string, state: IPressableState, userProps: FABProps): boolean => {
  return (
    state[layer] || userProps[layer] || (layer === 'hasContent' && !userProps.iconOnly) || (layer === 'hasIconBefore' && userProps.icon)
  );
};

export const FAB = compose<FABType>({
  displayName: fabName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
    ripple: Pressable,
    shadow: Shadow,
  },
  useRender: (userProps: FABProps, useSlots: UseSlots<FABType>) => {
    const { icon, ...rest } = userProps;

    const iconProps = createIconProps(userProps.icon);
    const button = useButton(rest);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: FABProps, ...children: React.ReactNode[]) => {
      const { iconOnly, accessibilityLabel, showContent = true, ...mergedProps } = mergeProps(button.props, final);

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
          {icon && <Slots.icon {...iconProps} />}
          {showContent &&
            React.Children.map(children, (child) =>
              typeof child === 'string' ? <Slots.content key="content">{child}</Slots.content> : child,
            )}
<<<<<<< HEAD
        </React.Fragment>
=======
        </Slots.root>
>>>>>>> 62b0f3d5c5d04004dafba11b9690536c78b59e2c
      );

      const hasShadow = Platform.OS === 'ios';
      const hasRipple = Platform.OS === 'android';

      if (hasShadow) {
        return (
          <Slots.shadow>
            <Slots.root {...mergedProps} accessibilityLabel={label}>
              {buttonContent}
            </Slots.root>
          </Slots.shadow>
        );
      } else if (hasRipple) {
        const [extractedMargin, styleWithoutMargin] = extractMarginAndroid(mergedProps.style);
        return (
          <Slots.root style={extractedMargin}>
            <Slots.ripple
              accessibilityLabel={label}
              {...mergedProps}
              style={styleWithoutMargin}
              onPressIn={memoize(() => {
                mergedProps.setRippleStateAndroid(true);
                mergedProps.onPressIn?.();
              })}
              onPressOut={memoize(() => {
                mergedProps.setRippleStateAndroid(false);
                mergedProps.onPressOut?.();
              })}
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
