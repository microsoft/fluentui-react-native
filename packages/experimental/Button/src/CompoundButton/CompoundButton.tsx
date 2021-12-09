/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { CompoundButtonProps, compoundButtonName, CompoundButtonType } from './CompoundButton.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './CompoundButton.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { buttonLookup } from '../Button';

export const CompoundButton = compose<CompoundButtonType>({
  displayName: compoundButtonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
    secondaryContent: Text,
    contentContainer: View,
  },
  render: (userProps: CompoundButtonProps, useSlots: UseSlots<CompoundButtonType>) => {
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);

    // grab the styled slots
    const Slots = useSlots(userProps, layer => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: CompoundButtonProps, ...children: React.ReactNode[]) => {
      const { icon, secondaryContent, iconPosition, ...mergedProps } = mergeProps(button.props, final);

      return (
        <Slots.root {...mergedProps}>
          {icon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          {React.Children.map(children, (child) => (
            <Slots.contentContainer>
              {typeof child === 'string' ? <Slots.content key="content">{child}</Slots.content> : child}
              {secondaryContent && <Slots.secondaryContent key="secondaryContent">{secondaryContent}</Slots.secondaryContent>}
            </Slots.contentContainer>
          ))}
          {icon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      );
    };
  },
});

export default CompoundButton;
