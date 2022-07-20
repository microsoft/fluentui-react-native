/** @jsx withSlots */
import { Children, ReactNode } from 'react';
import { View } from 'react-native';
import { badgeName, BadgeType, BadgeProps } from './Badge.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { compose, withSlots, UseSlots, mergeProps } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { stylingSettings } from './Badge.styling';
import { useBadge } from './useBadge';

export const badgeLookup = (layer: string, userProps: BadgeProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    (!userProps['appearance'] && layer === 'filled') ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === 'large') ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'rounded')
  );
};

export const Badge = compose<BadgeType>({
  displayName: badgeName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    text: Text,
  },
  useRender: (userProps: BadgeProps, useSlots: UseSlots<BadgeType>) => {
    const iconProps = createIconProps(userProps.icon);
    const badge = useBadge(userProps);

    const Slots = useSlots(userProps, (layer) => badgeLookup(layer, userProps));

    return (final: BadgeProps, ...children: ReactNode[]) => {
      const { icon, iconPosition = 'before', ...mergedProps } = mergeProps(badge, final);
      return (
        <Slots.root {...mergedProps}>
          {icon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          {Children.map(children, (child) => (typeof child === 'string' ? <Slots.text key="text">{child}</Slots.text> : child))}
          {icon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      );
    };
  },
});

export default Badge;
