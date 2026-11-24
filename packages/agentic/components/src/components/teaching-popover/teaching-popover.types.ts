import type { ReactNode } from 'react';
import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, Slot } from '@fluentui-react-native/framework-base';
import type { Image, ImageSourcePropType, View } from 'react-native';
import type { Button } from '../button/button';
import type { Popover } from '../popover/popover';
import type { PopoverProps } from '../popover/popover.types';
import type { Text } from '../text/text';

export type TeachingPopoverStep = { key: string; title: string; body: string; image?: ImageSourcePropType };
export type TeachingPopoverAction = { label: string; onPress: () => void };
export type TeachingPopoverProps = Pick<
  PopoverProps,
  'trigger' | 'surface' | 'open' | 'defaultOpen' | 'onOpenChange' | 'placement' | 'align'
> &
  Partial<Pick<PopoverProps, 'ref' | 'style' | 'testID' | 'tooltip'>> & {
    title: string;
    children?: ReactNode;
    image?: ImageSourcePropType;
    steps?: readonly TeachingPopoverStep[];
    step?: string;
    defaultStep?: string;
    onStepChange?: (key: string, data: { reason: 'next' | 'back' }) => void;
    formatStep?: (position: number, total: number) => string;
    nextLabel?: string;
    backLabel?: string;
    closeLabel?: string;
    primaryAction?: TeachingPopoverAction;
    secondaryAction?: TeachingPopoverAction;
    onFinish?: () => void;
  };

export type TeachingPopoverState = ThemeState &
  ComponentState<{
    root: Slot<typeof Popover>;
    content: Slot<typeof View>;
    header: Slot<typeof View>;
    title: Slot<typeof Text>;
    body: OptionalSlot<typeof Text>;
    image: OptionalSlot<typeof Image>;
    footer: OptionalSlot<typeof View>;
    progress: OptionalSlot<typeof Text>;
    close: OptionalSlot<typeof Button>;
    primary: OptionalSlot<typeof Button>;
    secondary: OptionalSlot<typeof Button>;
  }> & { children?: ReactNode; label: string; stepKey?: string; stepAnnouncement: string };
