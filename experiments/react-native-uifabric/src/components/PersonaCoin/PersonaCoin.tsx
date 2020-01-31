import * as React from 'react';
import { Image, View, Text } from 'react-native';
import { IPersonaCoinProps, PersonaSize } from './PersonaCoin.types';
import { getPhysicalSize, getFontSize } from './PersonaCoinHelper';

export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  const { imageUrl, size, initials } = props;
  const physicalSize = getPhysicalSize(size || PersonaSize.size40);
  
  if (imageUrl) {
    return (
      <Image 
        style={{borderRadius: physicalSize / 2, width: physicalSize, height: physicalSize}}
        source={{uri: imageUrl, width: physicalSize, height: physicalSize}}
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
          backgroundColor: 'green', 
          justifyContent: 'center', 
          alignItems: 'center'}}>
          <Text style={{fontSize, color: 'white'}}>{initials}</Text>
      </View>
    );
  }
};