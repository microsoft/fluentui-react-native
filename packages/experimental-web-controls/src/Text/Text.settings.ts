import { ITextSettings } from './Text.types';
import { augmentPlatformTheme } from '@uifabric/theming-react-native';

export function loadTextSettings(): void {
  const textSettings: ITextSettings = {
    root: {
      fontFamily: 'primary',
      fontSize: 'medium',
      fontWeight: 'medium',
      color: 'bodyText',
      style: {
        margin: 0
      }
    },
    _overrides: {
      disabled: {
        root: {
          style: {
            color: 'bodyTextDisabled'
          }
        }
      }
    },
    _precedence: ['disabled']
  };

  augmentPlatformTheme({
    settings: {
      RNFText: textSettings
    }
  });
}
