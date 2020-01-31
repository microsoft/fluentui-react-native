import * as React from 'react';
import { Image } from 'react-native';
import { IPersonaCoinProps, PersonaSize } from './PersonaCoin.types';

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

export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  const { imageUrl, size } = props;
  const physicalSize = getPhysicalSize(size || PersonaSize.size40);
  return (
      <Image 
        style={{borderRadius: physicalSize / 2, width: physicalSize, height: physicalSize}}
        source={{uri: imageUrl, width: physicalSize, height: physicalSize}}
      />
  )
};
