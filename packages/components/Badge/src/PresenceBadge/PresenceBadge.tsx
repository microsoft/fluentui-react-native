/** @jsxRuntime classic */
/** @jsx withSlots */
import { View, Platform } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots, mergeProps } from '@fluentui-react-native/framework';
import { Svg, Path } from 'react-native-svg';

import { stylingSettings } from './PresenceBadge.styling';
import type { PresenceBadgeType, PresenceBadgeProps } from './PresenceBadge.types';
import { presenceBadgeName } from './PresenceBadge.types';
import { getIconPath } from './stylingUtils';
import { useBadge } from '../useBadge';

export const prensenceBadgeLookup = (layer: string, userProps: PresenceBadgeProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['size'] ||
    layer === userProps['shape'] ||
    (layer === 'circular' && !userProps['shape']) ||
    layer === userProps['status'] ||
    (layer === 'outOfOffice' && userProps['outOfOffice'])
  );
};

export const PresenceBadge = compose<PresenceBadgeType>({
  displayName: presenceBadgeName,
  ...stylingSettings,
  slots: {
    root: View,
    svg: Svg,
  },
  useRender: (userProps: PresenceBadgeProps, useSlots: UseSlots<PresenceBadgeType>) => {
    const badge = useBadge(userProps).props as PresenceBadgeProps;
    const Slots = useSlots(badge, (layer) => prensenceBadgeLookup(layer, badge));

    return (final: PresenceBadgeProps) => {
      const { size, status, outOfOffice, ...mergedProps } = mergeProps(badge, final);
      const isOutOfOffice = outOfOffice || false;
      const hasDifferentIconsBySize = Platform.OS === 'ios' || Platform.OS === 'android';
      const path = getIconPath(status, isOutOfOffice, size);

      return (
        <Slots.root {...mergedProps} accessible={true}>
          <Slots.svg
            viewBox={`
            0 0
            ${hasDifferentIconsBySize ? Slots.svg({}).props.style.width : 16}
            ${hasDifferentIconsBySize ? Slots.svg({}).props.style.height : 16}`}
            fill="none"
          >
            <Path fill="currentColor" d={path} />
          </Slots.svg>
        </Slots.root>
      );
    };
  },
});
