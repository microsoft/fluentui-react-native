import * as React from 'react';
import { Image, View } from 'react-native';
import { IPersonaCoinProps, PersonaSize } from './PersonaCoin.types';
import { convertCoinColor, getPresenceIconSource, getSizeConfig } from './PersonaCoin.helpers';
import { StyleSheet } from 'react-native';
import { Initials } from './PersonaCoinInitials';

export const PersonaCoinCore: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  const { imageUrl, imageDescription, size, initials, coinColor, style: propStyle, presence } = props;
  const normalizedSize = size === undefined ? PersonaSize.size40 : size;

  const { physicalCoinSize: physicalSize, iconSize, initialsFontSize: initialFontSize } = getSizeConfig(normalizedSize);

  const rootStyle = StyleSheet.flatten([
    propStyle,
    {
      width: physicalSize,
      height: physicalSize,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    }
  ]);

  return (
    <View style={rootStyle}>
      {imageUrl ? (
        <Image
          accessibilityLabel={imageDescription}
          style={{ borderRadius: physicalSize / 2, width: physicalSize, height: physicalSize }}
          source={{ uri: imageUrl, width: physicalSize, height: physicalSize }}
          resizeMode="cover"
        />
      ) : (
        <Initials
          fontSize={initialFontSize}
          initials={initials}
          backgroundColor={convertCoinColor(coinColor)}
          color="white"
          size={physicalSize}
        />
      )}
      {!!presence && iconSize > 0 && (
        <Image source={getPresenceIconSource(presence)} style={{ position: 'absolute', width: iconSize, height: iconSize }} />
      )}
    </View>
  );
};
