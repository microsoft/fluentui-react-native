/** @jsxRuntime classic */
/** @jsx withSlots */
import type { ReactNode } from 'react';
import { Children, useCallback } from 'react';
import { Pressable, I18nManager } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots, mergeProps } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
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
      const { icon, size, showCloseIcon, closeIconAccessibilityLabel, closeIconOnPress, ...mergedProps } = mergeProps(chip.props, final);
      const iconProps = createIconProps(icon);
      const showIcon = size === 'medium' || showCloseIcon;
      const closeIconVisibile = showCloseIcon && chip.state.selected;

      const iconPressFunction = useCallback(
        (e: InteractionEvent) => {
          if (closeIconVisibile && closeIconOnPress) {
            closeIconOnPress(e);
          }
        },
        [chip.state.selected, showCloseIcon, closeIconOnPress],
      );

      const iconCore = <Slots.icon accessible={false} {...iconProps} />;
      const iconWithPressable = (
        <Slots.iconPressable accessibilityRole="button" accessibilityLabel={closeIconAccessibilityLabel} onPress={iconPressFunction}>
          {iconCore}
        </Slots.iconPressable>
      );

      return (
        <Slots.root accessible {...mergedProps}>
          {icon && showIcon && (closeIconVisibile ? iconWithPressable : iconCore)}
          {Children.map(children, (child, i) =>
            typeof child === 'string' ? (
              <Slots.text accessible={false} key={`text-${i}`}>
                {child}
              </Slots.text>
            ) : (
              child
            ),
          )}
        </Slots.root>
      );
    };
  },
});

export default Chip;
