import * as React from 'react';
import { Image, View, Text } from 'react-native';
import { IPersonaCoinProps, PersonaSize, PersonaCoinColor } from './PersonaCoin.types';
import { getPhysicalSize, getFontSize, convertCoinColor } from './PersonaCoinHelper';
import { StyleSheet } from 'react-native';

interface IPersonaCoinInitials {
  size: number;
  fontSize: number;
  coinColor?: PersonaCoinColor;
  initials?: string;
}

const Initials: React.FunctionComponent<IPersonaCoinInitials> = (props: IPersonaCoinInitials) => {
  const { size, fontSize, coinColor, initials } = props;
  const backgroundColor = convertCoinColor(coinColor);

  return (
    <View
      style={{
        borderRadius: size / 2,
        width: size,
        height: size,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize, color: 'white' }}>{initials}</Text>
    </View>
  );
};

export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  const { imageUrl, imageDescription, size, initials, coinColor, style: propStyle } = props;
  const normalizedSize = size === undefined ? PersonaSize.size40 : size;

  const physicalSize = getPhysicalSize(normalizedSize);

  const rootStyle = StyleSheet.flatten([
    propStyle,
    {
      width: physicalSize,
      height: physicalSize
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
        <Initials fontSize={getFontSize(normalizedSize)} initials={initials} coinColor={coinColor} size={physicalSize} />
      )}
    </View>
  );
};
