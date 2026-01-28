/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import React, { Children } from 'react';
import { View, I18nManager } from 'react-native';

import { Shadow } from '@fluentui-react-native/experimental-shadow';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './CounterBadge.styling';
import type { CounterBadgeType, CounterBadgeProps } from './CounterBadge.types';
import { counterBadgeName } from './CounterBadge.types';
import { useCounterBadge } from './useCounterBadge';

export const counterBadgeLookup = (layer: string, userProps: CounterBadgeProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (layer === 'large' && !userProps['size']) ||
    layer === userProps['shape'] ||
    (layer === 'circular' && !userProps['shape']) ||
    layer === userProps['badgeColor'] ||
    (layer === 'rtl' && I18nManager.isRTL) ||
    (layer === 'list' && userProps.list)
  );
};

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
    const Slots = useSlots(badge.props, (layer) => counterBadgeLookup(layer, badge.props));

    return (final: CounterBadgeProps, ...children: ReactNode[]) => {
      const { count, icon, iconPosition = 'before', overflowCount, dot, ...mergedProps } = mergeProps(badge.props, final);
      const { showBadge } = badge.state;
      const displayCount = count && count > overflowCount ? `${overflowCount}+` : `${count}`;
      const hasChildren = Children.toArray(children)[0];

      return showBadge || hasChildren ? (
        <Slots.shadow>
          <Slots.root {...mergedProps}>
            {!dot && (
              <React.Fragment>
                {icon && iconPosition === 'before' && <Slots.icon accessible={false} {...iconProps} />}
                {!hasChildren && <Slots.text>{displayCount}</Slots.text>}
                {Children.map(children, (child, i) => {
                  if (typeof child === 'string') {
                    const textProps: any = { key: `text-${i}` };
                    return <Slots.text {...textProps}>{child}</Slots.text>;
                  }
                  return child;
                })}
                {icon && iconPosition === 'after' && <Slots.icon accessible={false} {...iconProps} />}
              </React.Fragment>
            )}
          </Slots.root>
        </Slots.shadow>
      ) : null;
    };
  },
});
