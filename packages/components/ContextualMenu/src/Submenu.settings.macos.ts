import { submenuName, SubmenuType } from './Submenu.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { I18nManager } from 'react-native';

export const settings: IComposeSettings<SubmenuType> = [
  {
    root: {
      accessibilityRole: 'menu',
      directionalHint: I18nManager.isRTL ? 'leftTopEdge' : 'rightTopEdge',
    },
    container: {
      style: {
        padding: 5,
        flex: 1,
      },
    },
    scrollView: {
      contentContainerStyle: {
        flexDirection: 'column',
        flexGrow: 1,
      },
    },
  },
  submenuName,
];
