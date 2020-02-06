import * as React from 'react';
import { Image, View, Text } from 'react-native';
import { IPersonaCoinProps, PersonaSize, PersonaCoinColor } from './PersonaCoin.types';
import { convertCoinColor, getPresenceIconSource, getSizeConfig } from './PersonaCoinHelper';
import { StyleSheet } from 'react-native';

interface IPersonaCoinInitials {
  size: number;
  fontSize: number;
  coinColor?: PersonaCoinColor;
  initials?: string;
}

const Initials: React.FunctionComponent<IPersonaCoinInitials> = (props: IPersonaCoinInitials) => {
  const { size, fontSize, coinColor, initials } = props;

  return (
    <View
      style={{
        borderRadius: size / 2,
        width: size,
        height: size,
        backgroundColor: convertCoinColor(coinColor),
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize, color: 'white' }}>{initials}</Text>
    </View>
  );
};

export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  const { imageUrl, imageDescription, size, initials, coinColor, style: propStyle, presence } = props;
  const normalizedSize = size === undefined ? PersonaSize.size40 : size;

  const { coinSize: physicalSize, iconSize, initialsFontSize: initialFontSize } = getSizeConfig(normalizedSize);

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
        <Initials fontSize={initialFontSize} initials={initials} coinColor={coinColor} size={physicalSize} />
      )}
      {!!presence && iconSize > 0 && (
        <Image source={getPresenceIconSource(presence)} style={{ position: 'absolute', width: iconSize, height: iconSize }} />
      )}
    </View>
  );
};
