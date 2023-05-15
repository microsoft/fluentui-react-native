/** @jsx withSlots */
import type { ReactNode } from 'react';
import { Children } from 'react';
import { Pressable, I18nManager } from 'react-native';

import { Shadow } from '@fluentui-react-native/experimental-shadow';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots, mergeProps } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Badge.styling';
import type { BadgeType, BadgeProps, BadgeState } from './Badge.types';
import { badgeName } from './Badge.types';
import { useBadge } from './useBadge';

export const badgeLookup = (layer: string, userProps: BadgeProps, state: BadgeState): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (layer === 'large' && !userProps['size']) ||
    layer === userProps['shape'] ||
    (layer === 'circular' && !userProps['shape']) ||
    layer === userProps['badgeColor'] ||
    (layer === 'rtl' && I18nManager.isRTL) ||
    (layer === 'selected' && state && state.selected)
  );
};

export const Badge = compose<BadgeType>({
  displayName: badgeName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    icon: Icon,
    text: Text,
    shadow: Shadow,
  },
  useRender: (userProps: BadgeProps, useSlots: UseSlots<BadgeType>) => {
    const iconProps = createIconProps(userProps.icon);
    const badge = useBadge(userProps);

    const Slots = useSlots(userProps, (layer) => badgeLookup(layer, userProps, badge.state));

    return (final: BadgeProps, ...children: ReactNode[]) => {
      const { icon, iconPosition, size, ...mergedProps } = mergeProps(badge.props, final);
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
