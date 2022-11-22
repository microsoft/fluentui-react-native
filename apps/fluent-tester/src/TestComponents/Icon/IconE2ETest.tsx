/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Icon } from '@fluentui-react-native/icon';
import { ICON_ACCESSIBILITY_LABEL } from './consts';
import { RasterImageIconProps } from '@fluentui-react-native/icon';
import { testImage } from '../Common/iconExamples';

export const E2ETestingIcon: React.FunctionComponent = () => {
  const rasterRainbowSpectrumProps: RasterImageIconProps = { src: testImage };
  const rasterChessProps: RasterImageIconProps = { src: { uri: 'https://static.thenounproject.com/png/2960386-200.png' } };

  const showRasterIcons = true;

  return (
    <View>
      {showRasterIcons ? (
        <View>
          <Text>Raster icons</Text>
          <Icon
            rasterImageSource={rasterRainbowSpectrumProps}
            width={100}
            height={100}
            color="green"
            accessibilityLabel={ICON_ACCESSIBILITY_LABEL}
          />
          <Icon rasterImageSource={rasterChessProps} width={100} height={100} color="blue" />
        </View>
      ) : null}
    </View>
  );
};
