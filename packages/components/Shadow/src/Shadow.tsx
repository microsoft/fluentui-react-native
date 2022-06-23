import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps } from './Shadow.types';

export const Shadow: React.FunctionComponent<ShadowProps> = (props: ShadowProps) => {
  const noOffset = { width: 0, height: 0 };
  const neutralShadowAmbient = { shadowOffset: noOffset, shadowOpacity: 0.12, shadowRadius: 2 };
  const neutralShadowAmbientDarker = { shadowOffset: noOffset, shadowOpacity: 0.2, shadowRadius: 8 };
  const ambientShadow = {
    '2': neutralShadowAmbient,
    '4': neutralShadowAmbient,
    '8': neutralShadowAmbient,
    '16': neutralShadowAmbient,
    '28': neutralShadowAmbientDarker,
    '64': neutralShadowAmbientDarker,
  };
  const keyShadow = {
    '2': { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.14, shadowRadius: 2 },
    '4': { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.14, shadowRadius: 4 },
    '8': { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8 },
    '16': { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 16 },
    '28': { shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.24, shadowRadius: 28 },
    '64': { shadowOffset: { width: 0, height: 32 }, shadowOpacity: 0.24, shadowRadius: 64 },
  };

  return (
    <View style={ambientShadow[props.depth]}>
      <View style={keyShadow[props.depth]}>{props.children}</View>
    </View>
  );
};
