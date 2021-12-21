/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { CompoundButtonPropsWithInnerRef, compoundButtonName, CompoundButtonType, CompoundButtonProps } from './CompoundButton.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './CompoundButton.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps, IFocusable } from '@fluentui-react-native/interactive-hooks';
import { buttonLookup } from '../Button';

const CompoundButtonComposed = compose<CompoundButtonType>({
  displayName: compoundButtonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
    secondaryContent: Text,
    contentContainer: View,
  },
  render: (userProps: CompoundButtonPropsWithInnerRef, useSlots: UseSlots<CompoundButtonType>) => {
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: CompoundButtonPropsWithInnerRef, ...children: React.ReactNode[]) => {
      const { icon, secondaryContent, iconPosition, accessibilityLabel, ...mergedProps } = mergeProps(button.props, final);
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
          {icon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          <Slots.contentContainer>
            {React.Children.map(children, (child) =>
              typeof child === 'string' ? <Slots.content key="content">{child}</Slots.content> : child,
            )}
            {secondaryContent && <Slots.secondaryContent key="secondaryContent">{secondaryContent}</Slots.secondaryContent>}
          </Slots.contentContainer>
          {icon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      );
    };
  },
});

export const CompoundButton = React.forwardRef<IFocusable, CompoundButtonProps>((props, ref) => (
  <CompoundButtonComposed {...props} innerRef={ref} />
));

export default CompoundButton;
