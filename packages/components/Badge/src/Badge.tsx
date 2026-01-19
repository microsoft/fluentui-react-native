/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { Children } from 'react';
import { View, I18nManager } from 'react-native';

import { Shadow } from '@fluentui-react-native/experimental-shadow';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Badge.styling';
import type { BadgeType, BadgeProps } from './Badge.types';
import { badgeName } from './Badge.types';
import { useBadge } from './useBadge';

export const badgeLookup = (layer: string, userProps: BadgeProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    (!userProps['appearance'] && layer === 'filled') ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === 'medium') ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'circular') ||
    layer === userProps['badgeColor'] ||
    (!userProps['badgeColor'] && layer === 'brand') ||
    (I18nManager.isRTL && layer === 'rtl')
  );
};

export const Badge = compose<BadgeType>({
  displayName: badgeName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    text: Text,
    shadow: Shadow,
  },
  useRender: (userProps: BadgeProps, useSlots: UseSlots<BadgeType>) => {
    const iconProps = createIconProps(userProps.icon);
    const badge = useBadge(userProps);

    const Slots = useSlots(userProps, (layer) => badgeLookup(layer, userProps));

    return (final: BadgeProps, ...children: ReactNode[]) => {
      const { icon, iconPosition, size, ...mergedProps } = mergeProps(badge, final);
      const showContent = size !== 'tiny' && size !== 'extraSmall';
      const showIcon = size !== 'tiny';
      return (
        <Slots.shadow>
          <Slots.root {...mergedProps}>
            {icon && showIcon && iconPosition === 'before' && <Slots.icon accessible={false} {...iconProps} />}
            {showContent &&
              Children.map(children, (child, i) =>
                typeof child === 'string' ? (
                  <Slots.text accessible={false} key={`text-${i}`}>
                    {child}
                  </Slots.text>
                ) : (
                  child
                ),
              )}
            {icon && showIcon && iconPosition === 'after' && <Slots.icon accessible={false} {...iconProps} />}
          </Slots.root>
        </Slots.shadow>
      );
    };
  },
});

export default Badge;
