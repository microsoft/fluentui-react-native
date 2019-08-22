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
    content: {},
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
      visited: {
        root: {
          color: 'linkVisited'
        }
      }
    },
    _precedence: ['hovered', 'visited', 'disabled']
  };

  augmentPlatformTheme({
    settings: {
      RNFLink: linkSettings
    }
  });
}
