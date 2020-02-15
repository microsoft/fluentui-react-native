import { styleFunction } from '@uifabricshared/foundation-tokens';
import { ViewStyle, ViewProps, TextProps, ImageProps } from 'react-native';
import { IPersonaCoinTokens } from './PersonaCoin.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { getSizeConfig, PersonaSizeConfig, convertCoinColor } from './PersonaCoin.helpers';
import { defaultSize, defaultColor } from './PersonaCoin.settings';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end'
};

function calculateEffectiveSizes(tokens: IPersonaCoinTokens): PersonaSizeConfig {
  const { size, coinSize, iconSize, initialsSize } = tokens;
  
  if (size) {
    return getSizeConfig(size);
  } else if (coinSize) {
    return { 
      physicalSize: coinSize,
      iconSize: iconSize || 0,
      initialsSize: initialsSize || 0
    };
  } else {
    return getSizeConfig(defaultSize);
  }
}

const _rootKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size', 'horizontalIconAlignment', 'verticalIconAlignment'];

function _buildRootStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ViewProps {
  const rootStyle: ViewStyle = {
    flexDirection: 'row'
  };

  const { physicalSize } = calculateEffectiveSizes(tokenProps);
  rootStyle.width = physicalSize;
  rootStyle.height = physicalSize;
  
  const { horizontalIconAlignment, verticalIconAlignment } = tokenProps;
  rootStyle.justifyContent = nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'];
  rootStyle.alignItems = nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'];

  return { style: rootStyle };
}

const _photoKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size'];

export const buildRootStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(_buildRootStyles, _rootKeyProps);

function _buildPhotoStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ImageProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);

  return {
    source: { uri: '' },
    style: {
      borderRadius: physicalSize / 2,
      width: physicalSize,
      height: physicalSize
    }
  };
}

export const buildPhotoStyles = styleFunction<ImageProps, IPersonaCoinTokens, ITheme>(
  _buildPhotoStyles,
  _photoKeyProps
);

const _initialsKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'initialsSize', 'size'];

function _buildInitialsStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): TextProps {
  const { initialsSize } = calculateEffectiveSizes(tokenProps);

  return {
    style: {
      fontSize: initialsSize,
    }
  };
}

export const buildInitialsStyles = styleFunction<TextProps, IPersonaCoinTokens, ITheme>(
  _buildInitialsStyles,
  _initialsKeyProps
);

const _initialsBackgroundKeyProps: (keyof IPersonaCoinTokens)[] = ['coinSize', 'size', 'coinColor', 'backgroundColor'];

function _buildInitialsBackgroundStyles(tokenProps: IPersonaCoinTokens/*, theme: ITheme*/): ViewProps {
  const { physicalSize } = calculateEffectiveSizes(tokenProps);

  const { backgroundColor, coinColor } = tokenProps;
  let effectiveBackgroundColor: string;
  if (coinColor) {
    effectiveBackgroundColor = convertCoinColor(coinColor);
  } else if (backgroundColor) {
    effectiveBackgroundColor = backgroundColor;
  } else {
    effectiveBackgroundColor = convertCoinColor(defaultColor);
  }
  
  return {
    style: {
      borderRadius: physicalSize / 2,
      width: physicalSize,
      height: physicalSize,
      flexGrow: 1, 
      alignSelf: 'stretch', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: effectiveBackgroundColor
    }
  };
}

export const buildInitialsBackgroundStyles = styleFunction<ViewProps, IPersonaCoinTokens, ITheme>(
  _buildInitialsBackgroundStyles,
  _initialsBackgroundKeyProps
);

const _iconKeyProps: (keyof IPersonaCoinTokens)[] = ['iconSize', 'size', 'coinSize'];

function _buildIconStyles(tokenProps: IPersonaCoinTokens /*, theme: ITheme */): ImageProps {
  const { iconSize } = calculateEffectiveSizes(tokenProps);

  return {
    source: {uri: ''},
    style: {
      position: 'absolute',
      width: iconSize,
      height: iconSize
    }
  };
}

export const buildIconStyles = styleFunction<ImageProps, IPersonaCoinTokens, ITheme>(
  _buildIconStyles,
  _iconKeyProps
);

