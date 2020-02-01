import * as React from 'react';
import { Image, View, Text } from 'react-native';
import { IPersonaCoinProps, PersonaSize } from './PersonaCoin.types';
import { getPhysicalSize, getFontSize, convertCoinColor } from './PersonaCoinHelper';

export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  const { imageUrl, imageDescription, size, initials, coinColor } = props;
  
  const physicalSize = getPhysicalSize(size || PersonaSize.size40);
  const backgroundColor = convertCoinColor(coinColor);
  
  if (imageUrl) {
    return (
      <Image 
        accessibilityLabel={imageDescription}
        style={{borderRadius: physicalSize / 2, width: physicalSize, height: physicalSize}}
        source={{uri: imageUrl, width: physicalSize, height: physicalSize}}
        resizeMode='cover'
      />
    );
  } else {
    const fontSize = getFontSize(size || PersonaSize.size40);

    return (
      <View
        style={{
          borderRadius: physicalSize / 2, 
          width: physicalSize, 
          height: physicalSize,
          backgroundColor, 
          justifyContent: 'center', 
          alignItems: 'center'}}>
          <Text style={{fontSize, color: 'white'}}>{initials}</Text>
      </View>
    );
  }
};