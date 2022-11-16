/** @jsx withSlots */
import React, { Children, ReactNode } from 'react';
import { View } from 'react-native';
import { counterBadgeName, CounterBadgeType, CounterBadgeProps } from './CounterBadge.types';
import { compose, withSlots, mergeProps, UseSlots } from '@fluentui-react-native/framework';
import { stylingSettings } from './CounterBadge.styling';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { badgeLookup } from '../Badge';
import { useCounterBadge } from './useCounterBadge';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Shadow } from '@fluentui-react-native/experimental-shadow';

export const CounterBadge = compose<CounterBadgeType>({
  displayName: counterBadgeName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    text: Text,
    shadow: Shadow,
  },
  useRender: (userProps: CounterBadgeProps, useSlots: UseSlots<CounterBadgeType>) => {
    const iconProps = createIconProps(userProps.icon);
    const badge = useCounterBadge(userProps);

    const Slots = useSlots(badge.props, (layer) => badgeLookup(layer, badge.props));

    return (final: CounterBadgeProps, ...children: ReactNode[]) => {
      const { count, icon, iconPosition = 'before', overflowCount, dot, ...mergedProps } = mergeProps(badge.props, final);
      const { showBadge } = badge.state;
      const displayCount = count && count > overflowCount ? `${overflowCount}+` : `${count}`;
      const hasChildren = Children.toArray(children)[0];

      return showBadge ? (
        <Slots.shadow>
          <Slots.root {...mergedProps}>
            {!dot && (
              <React.Fragment>
                {icon && iconPosition === 'before' && <Slots.icon accessible={false} {...iconProps} />}
                {!hasChildren && <Slots.text>{displayCount}</Slots.text>}
                {Children.map(children, (child, i) =>
                  typeof child === 'string' ? <Slots.text key={`text-${i}`}>{child}</Slots.text> : child,
                )}
                {icon && iconPosition === 'after' && <Slots.icon accessible={false} {...iconProps} />}
              </React.Fragment>
            )}
          </Slots.root>
        </Slots.shadow>
      ) : null;
    };
  },
});
