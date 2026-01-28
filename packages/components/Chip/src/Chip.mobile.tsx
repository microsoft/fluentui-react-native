/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { Children } from 'react';
import { Pressable, I18nManager } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Chip.styling';
import type { ChipType, ChipProps, ChipState } from './Chip.types';
import { chipName } from './Chip.types';
import { useChip } from './useChip';

export const chipLookup = (layer: string, userProps: ChipProps, state: ChipState): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (layer === 'medium' && !userProps['size']) ||
    layer === userProps['shape'] ||
    (layer === 'circular' && !userProps['shape']) ||
    layer === userProps['chipColor'] ||
    (layer === 'rtl' && I18nManager.isRTL) ||
    (layer === 'selected' && state && state.selected)
  );
};

export const Chip = compose<ChipType>({
  displayName: chipName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    icon: Icon,
    text: Text,
    iconPressable: Pressable,
  },
  useRender: (userProps: ChipProps, useSlots: UseSlots<ChipType>) => {
    const chip = useChip(userProps);
    const Slots = useSlots(userProps, (layer) => chipLookup(layer, userProps, chip.state));

    return (final: ChipProps, ...children: ReactNode[]) => {
      const { closeIconVisibile, iconProps, iconPressFunction, size, showCloseIcon, closeIconAccessibilityLabel, ...mergedProps } =
        mergeProps(chip.props, final);
      const showIcon = size === 'medium' || showCloseIcon;

      const iconCore = <Slots.icon accessible={false} {...iconProps} />;
      const iconWithPressable = (
        <Slots.iconPressable accessibilityRole="button" accessibilityLabel={closeIconAccessibilityLabel} onPress={iconPressFunction}>
          {iconCore}
        </Slots.iconPressable>
      );

      return (
        <Slots.root accessible {...mergedProps}>
          {iconProps && showIcon && (closeIconVisibile ? iconWithPressable : iconCore)}
          {Children.map(children, (child, i) => {
            if (typeof child === 'string') {
              const textProps: any = { accessible: false, key: `text-${i}` };
              return <Slots.text {...textProps}>{child}</Slots.text>;
            }
            return child;
          })}
        </Slots.root>
      );
    };
  },
});

export default Chip;
