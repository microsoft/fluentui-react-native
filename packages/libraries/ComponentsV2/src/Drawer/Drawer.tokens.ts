import type {DrawerSize} from './Drawer.types';

export const drawerSizeTokens: Record<DrawerSize, number | `${number}%`> = {
  full: '100%',
  large: 480,
  medium: 360,
  small: 280,
};
