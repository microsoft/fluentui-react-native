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
    const Slots = useSlots(userProps, layer => button.state[layer] || userProps[layer]);

    // now return the handler for finishing render
    return (final: CompoundButtonProps, ...children: React.ReactNode[]) => {
      const { icon, content, secondaryContent, ...mergedProps } = mergeProps(button.props, final);

      return (
        <Slots.root {...mergedProps}>
          {icon && <Slots.icon {...iconProps} />}
          {(content || secondaryContent) && (
            <Slots.contentContainer>
              {content && <Slots.content key="content">{content}</Slots.content>}
              {secondaryContent && <Slots.secondaryContent key="secondaryContent">{secondaryContent}</Slots.secondaryContent>}
            </Slots.contentContainer>
          )}
          {children}
        </Slots.root>
      );
    };
  },
});

export default CompoundButton;
