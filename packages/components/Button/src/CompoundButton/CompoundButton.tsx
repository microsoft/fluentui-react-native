/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './CompoundButton.styling';
import type { CompoundButtonProps, CompoundButtonType } from './CompoundButton.types';
import { compoundButtonName } from './CompoundButton.types';
import { buttonLookup, getFocusBorderStyle } from '../Button';
import { useButton } from '../useButton';

export const CompoundButton = compose<CompoundButtonType>({
  displayName: compoundButtonName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    icon: Icon,
    content: Text,
    secondaryContent: Text,
    contentContainer: View,
    focusInnerBorder: Platform.OS === ('win32' as any) && View,
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
          {shouldShowIcon && iconPosition === 'before' && <Slots.icon {...iconProps} accessible={false} />}
          <Slots.contentContainer>
            {React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                const contentProps: any = { accessible: false, key: 'content' };
                return <Slots.content {...contentProps}>{child}</Slots.content>;
              }
              return child;
            })}
            {(() => {
              if (secondaryContent) {
                const secondaryContentProps: any = { accessible: false, key: 'secondaryContent' };
                return <Slots.secondaryContent {...secondaryContentProps}>{secondaryContent}</Slots.secondaryContent>;
              }
              return null;
            })()}
          </Slots.contentContainer>
          {shouldShowIcon && iconPosition === 'after' && <Slots.icon {...iconProps} accessible={false} />}
          {button.state.focused &&
            !!button.state.measuredHeight &&
            !!button.state.measuredWidth &&
            button.state.shouldUseTwoToneFocusBorder && (
              <Slots.focusInnerBorder
                style={getFocusBorderStyle(button.state.measuredHeight, button.state.measuredWidth)}
                accessible={false}
                focusable={false}
              />
            )}
        </Slots.root>
      );
    };
  },
});
