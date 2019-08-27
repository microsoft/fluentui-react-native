import { ILinkSettings } from './Link.types';
import { augmentPlatformTheme } from '@uifabric/theming-react-native';

export function loadLinkSettings(): void {
  const linkSettings: ILinkSettings = {
    root: {},
    content: {
      fontFamily: 'primary',
      fontSize: 'medium',
      fontWeight: 'medium',
      color: 'link',
      style: {
        margin: 0,
        textDecoration: 'underline'
      }
    },
    _overrides: {
      disabled: {
        content: {
          color: 'linkDisabled'
        }
      },
      hovered: {
        content: {
          color: 'linkHovered'
        }
      },
      visited: {
        content: {
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
