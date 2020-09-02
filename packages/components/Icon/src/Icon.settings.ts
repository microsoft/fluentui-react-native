import { iconName, IIconType } from './Icon.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IIconType> = [
  {
    tokens: {
      color: 'menuItemText',
      backgroundColor: 'menuBackground'
    },
    root: {
      accessible: true,
      accessibilityRole: 'image'
    }
  },
  iconName
];