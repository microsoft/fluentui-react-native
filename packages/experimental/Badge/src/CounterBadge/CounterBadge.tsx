/** @jsx withSlots */
import { Children, ReactNode } from 'react';
import { View } from 'react-native';
import { counterBadgeName, CounterBadgeType, CounterBadgeProps } from './CounterBadge.types';
import { compose, withSlots, mergeProps, UseSlots } from '@fluentui-react-native/framework';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { stylingSettings } from './CounterBadge.styling';
import { Icon } from '@fluentui-react-native/icon';
import { badgeLookup } from '../Badge';
import { useCounterBadge } from './useCounterBadge';
import { TextV1 as Text } from '@fluentui-react-native/text';

export const CounterBadge = compose<CounterBadgeType>({
  displayName: counterBadgeName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    text: Text,
  },
  useRender: (userProps: CounterBadgeProps, useSlots: UseSlots<CounterBadgeType>) => {
    const iconProps = createIconProps(userProps.icon);
    const badge = useCounterBadge(userProps);

    const Slots = useSlots(badge.props, (layer) => badgeLookup(layer, badge.props));

    return (final: CounterBadgeProps, ...children: ReactNode[]) => {
      const { count, icon, iconPosition = 'before', overflowCount, ...mergedProps } = mergeProps(badge.props, final);
      const { showBadge } = badge.state;
      const displayCount = count && count > overflowCount ? `${overflowCount}+` : `${count}`;
      return showBadge ? (
        <Slots.root {...mergedProps}>
          {icon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          <Slots.text>{displayCount}</Slots.text>
          {Children.map(children, (child, i) => (typeof child === 'string' ? <Slots.text key={`text-${i}`}>{child}</Slots.text> : child))}
          {icon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      ) : null;
    };
  },
});
