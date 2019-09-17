import { ILinkSettings } from './Link.types';
import { augmentPlatformTheme } from '@uifabric/theming-react-native';

export function loadLinkSettings(): void {
  const linkSettings: ILinkSettings = {
    root: {
      fontFamily: 'primary',
      fontSize: 'medium',
      fontWeight: 'medium',
      color: 'link',
      style: {
        margin: 0,
        textDecoration: 'underline'
      }
    },
    _precedence: ['visited', 'hovered', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        root: {
          color: 'linkDisabled'
        }
      },
      hovered: {
        root: {
          color: 'linkHovered'
        }
      },
      pressed: {
        root: {
          color: 'linkPressed'
        }
      },
      visited: {
        root: {
          color: 'linkVisited'
        }
      }
    }
  };

   augmentPlatformTheme({
    settings: {
      RNFLink: linkSettings
    }
  });
}
