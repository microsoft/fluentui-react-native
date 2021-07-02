import { submenuName, SubmenuType } from './Submenu.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<SubmenuType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      beakWidth: 20,
      borderColor: 'buttonBorder',
      borderWidth: 1,
      gapSpace: 0,
      minPadding: 0,
    },
    root: {
      accessibilityRole: 'menu',
      directionalHint: 'rightTopEdge',
    },
    container: {
      style: {
        padding: 1,
      },
    },
  },
  submenuName,
];
