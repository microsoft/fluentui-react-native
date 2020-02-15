import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ViewStyle, ViewProps, ImageProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end'
};

const _rootKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'horizontalIconAlignment', 'verticalIconAlignment'];

function _buildRootStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ViewProps {
  const rootStyle: ViewStyle = {
    flexDirection: 'row'
  };

  const { coinSize, horizontalIconAlignment, verticalIconAlignment } = tokenProps;

  if (coinSize) {
    rootStyle.width = coinSize;
    rootStyle.height = coinSize;
  }

  rootStyle.justifyContent = nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'];
  rootStyle.alignItems = nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'];

  return { style: rootStyle };
}

const _photoKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize'];

export const buildPersonaCoinRootStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(_buildRootStyles, _rootKeyProps);

function _buildPersonaCoinContentStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ImageProps {
  const { coinSize } = tokenProps;
  if (coinSize && coinSize <= 0) {
    throw new Error(`Invalid value of ${coinSize} for 'coinSize'.`);
  }

  return {
    source: { uri: '' },
    style: !!coinSize && {
      borderRadius: coinSize / 2
    }
  };
}

export const buildPersonaCoinContentStyles = styleFunction<ImageProps, IPersonaCoinTokens, ITheme>(
  _buildPersonaCoinContentStyles,
  _photoKeyProps
);
