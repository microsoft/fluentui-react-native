import { ViewStyle, ViewProps } from 'react-native';
import { styleFunction } from '@uifabricshared/foundation-tokens';
import { IPersonaTokens } from './Persona.types';
import { ITheme } from '@uifabricshared/theming-ramp';

function _buildRootStyles(): ViewProps {
  const rootStyle: ViewStyle = {
    flexDirection: 'row'
  };

  return { style: rootStyle };
}

export const buildPersonaRootStyles = styleFunction<ViewProps, IPersonaTokens, ITheme>(_buildRootStyles, []);
