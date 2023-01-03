/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { CompoundButtonProps, compoundButtonName, CompoundButtonType } from './CompoundButton.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './CompoundButton.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { buttonLookup } from '../Button';

export const CompoundButton = compose<CompoundButtonType>({
  displayName: compoundButtonName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    icon: Icon,
    content: Text,
    secondaryContent: Text,
    contentContainer: View,
  },
  useRender: (userProps: CompoundButtonProps, useSlots: UseSlots<CompoundButtonType>) => {
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: CompoundButtonProps, ...children: React.ReactNode[]) => {
      const { icon, iconOnly, secondaryContent, iconPosition, loading, accessibilityLabel, ...mergedProps } = mergeProps(
        button.props,
        final,
      );

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

        if (secondaryContent) {
          childText += ' ' + secondaryContent;
        }
      }
      const label = accessibilityLabel ?? childText;

      return (
        <Slots.root {...mergedProps} accessibilityLabel={label}>
          {loading && <ActivityIndicator />}
          {shouldShowIcon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          <Slots.contentContainer>
            {React.Children.map(children, (child) =>
              typeof child === 'string' ? <Slots.content key="content">{child}</Slots.content> : child,
            )}
            {secondaryContent && <Slots.secondaryContent key="secondaryContent">{secondaryContent}</Slots.secondaryContent>}
          </Slots.contentContainer>
          {shouldShowIcon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      );
    };
  },
});
