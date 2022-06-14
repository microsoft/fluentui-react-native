/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { shadow, ShadowType, ShadowProps } from './Shadow.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Shadow.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useShadow } from './useShadow';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the Shadow.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the Shadow
 * @returns Whether the styles that are assigned to the layer should be applied to the Shadow
 */
export const shadowLookup = (layer: string, userProps: ShadowProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

// export const Shadow = compose<ShadowType>({
//   displayName: shadow,
//   ...stylingSettings,
//   slots: {
//     root: View,
//   },
//   useRender: (userProps: ShadowProps, useSlots: UseSlots<ShadowType>) => {
//     const shadowProps = useShadow(userProps);
//     const Slots = useSlots(userProps, (layer) => shadowLookup(layer, userProps));

//     return (final: ShadowProps, ...children: React.ReactNode[]) => {
//       const { depth, ...mergedProps } = mergeProps(shadowProps, final);

//       return <Slots.root {...mergedProps}>{children}</Slots.root>;
//     };
//   },
// });

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
