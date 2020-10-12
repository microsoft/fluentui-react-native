/** @jsx withSlots */
import * as React from 'react';
import { Image, View } from 'react-native';
import { CompoundButtonProps, compoundButtonName, CompoundButtonType } from './CompoundButton.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './CompoundButton.styling';
import { filterImageProps } from '@fluentui-react-native/adapters';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';

export const CompoundButton = compose<CompoundButtonType>({
  displayName: compoundButtonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Image,
    content: Text,
    secondaryContent: Text,
    contentContainer: View,
  },
  filters: {
    icon: filterImageProps,
  },
  render: (userProps: CompoundButtonProps, useSlots: UseSlots<CompoundButtonType>) => {
    const button = useButton(userProps);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => button.state[layer] || userProps[layer]);

    // now return the handler for finishing render
    return (final: CompoundButtonProps, ...children: React.ReactNode[]) => {
      const { icon, content, secondaryContent, ...mergedProps } = mergeProps(button.props, final);

      return (
        <Slots.root {...mergedProps}>
          {icon && <Slots.icon key="icon" source={{ uri: icon }} />}
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
