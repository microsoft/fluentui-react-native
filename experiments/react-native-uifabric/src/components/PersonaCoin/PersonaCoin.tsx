import * as React from 'react';
import { Image } from 'react-native';
import { IPersonaCoinProps, PersonaSize } from './PersonaCoin.types';
import { ViewWin32, TextWin32 } from '@office-iss/react-native-win32';

function getPhysicalSize(size: PersonaSize): number {
  switch (size) {
    case PersonaSize.size8: return 8;
    case PersonaSize.size24: return 24;
    case PersonaSize.size32: return 32;
    case PersonaSize.size40: return 40;
    case PersonaSize.size48: return 48;
    case PersonaSize.size56: return 56;
    case PersonaSize.size72: return 72;
    case PersonaSize.size100: return 100;
  }
}

function getFontSize(size: PersonaSize): number {
  switch (size) {
    case PersonaSize.size8: return 8;
    case PersonaSize.size24: return 10;
    case PersonaSize.size32: return 12;
    case PersonaSize.size40: return 14;
    case PersonaSize.size48: return 16;
    case PersonaSize.size56: return 18;
    case PersonaSize.size72: return 20;
    case PersonaSize.size100: return 36;
  }
}


export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  const { imageUrl, size, initials } = props;
  const physicalSize = getPhysicalSize(size || PersonaSize.size40);
  
  const showImage = !!imageUrl;
  if (showImage) {
    return (
      <Image 
        style={{borderRadius: physicalSize / 2, width: physicalSize, height: physicalSize}}
        source={{uri: imageUrl, width: physicalSize, height: physicalSize}}
      />
    );
  } else {
    const fontSize = getFontSize(size || PersonaSize.size40);
    return (
      <ViewWin32
        style={{
          borderRadius: physicalSize / 2, 
          width: physicalSize, 
          height: physicalSize,
          backgroundColor: 'green', 
          justifyContent: 'center', 
          alignItems: 'center'}}>
          <TextWin32 style={{fontSize: fontSize, color: 'white'}}>{initials}</TextWin32>
      </ViewWin32>
    );
  }
};