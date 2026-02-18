/** @jsxImportSource @fluentui-react-native/framework-base */
import { View, Platform } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';
import { extractStyle, mergeProps } from '@fluentui-react-native/framework-base';
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
    (!userProps['shape'] && layer === 'circular') ||
    layer === userProps['status'] ||
    (userProps['outOfOffice'] && layer === 'outOfOffice')
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
    const badge = useBadge(userProps) as PresenceBadgeProps;
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
            ${hasDifferentIconsBySize ? extractStyle(Slots.svg({})).width : 16}
            ${hasDifferentIconsBySize ? extractStyle(Slots.svg({})).height : 16}`}
            fill="none"
          >
            <Path fill="currentColor" d={path} />
          </Slots.svg>
        </Slots.root>
      );
    };
  },
});
