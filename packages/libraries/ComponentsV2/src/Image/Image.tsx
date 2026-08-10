import * as React from 'react';
import {Image as NativeImage, StyleSheet, View} from 'react-native';
import type {ImageProps as NativeImageProps, ImageStyle, StyleProp} from 'react-native';

export interface ImageProps extends NativeImageProps {
  bordered?: boolean;
  block?: boolean;
  fit?: 'center' | 'contain' | 'cover' | 'none';
  shadow?: boolean;
  shape?: 'circular' | 'rounded' | 'square';
  style?: StyleProp<ImageStyle>;
}

export function Image({bordered, block, fit = 'cover', shadow, shape = 'square', style, ...props}: ImageProps): React.ReactElement {
  return (
    <View style={[block && styles.block, shadow && styles.shadow]}>
      <NativeImage
        {...props}
        resizeMode={fit === 'none' ? 'center' : fit}
        style={[styles.image, bordered && styles.bordered, shape === 'rounded' && styles.rounded, shape === 'circular' && styles.circular, block && styles.blockImage, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {alignSelf: 'stretch'},
  blockImage: {width: '100%'},
  bordered: {borderColor: '#d1d1d1', borderWidth: 1},
  circular: {borderRadius: 999},
  image: {height: 160, width: 240},
  rounded: {borderRadius: 8},
  shadow: {elevation: 8, shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 8},
});
