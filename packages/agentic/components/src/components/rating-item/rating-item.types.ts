import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { View } from 'react-native';
import type { Icon } from '../../primitives/icon/icon';

export type RatingItemFill = 'empty' | 'half' | 'full';
export type RatingItemSize = 'small' | 'medium' | 'large';

export type RatingItemProps = Partial<Pick<PropsWithRefOf<typeof View>, 'ref' | 'testID'>> & {
  fill?: RatingItemFill;
  size?: RatingItemSize;
  preview?: RatingItemFill;
  disabled?: boolean;
};

export type RatingItemTokenState = {
  size: RatingItemSize;
  fill: RatingItemFill;
  visualState: 'rest' | 'disabled';
};

export type RatingItemState = ThemeState &
  RatingItemTokenState &
  ComponentState<{
    root: Slot<typeof View>;
    frame: Slot<typeof View>;
    mask: OptionalSlot<typeof View>;
    base: Slot<typeof Icon>;
    overlay: OptionalSlot<typeof Icon>;
  }>;
