/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { directComponent } from '@fluentui-react-native/framework-base';

import { Icon } from './icon';
import type { IconElementProps } from './icon.types';

const imageDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const SampleSvgIcon = directComponent<IconElementProps>(({ color, height, width, ...props }) => {
  const rootStyle: ViewStyle = {
    alignItems: 'center',
    height,
    justifyContent: 'center',
    width,
  };
  const size = Math.min(height ?? 20, width ?? 20) / 2;
  const glyphStyle: ViewStyle = {
    backgroundColor: color,
    borderRadius: size / 2,
    height: size,
    width: size,
  };
  return (
    <View {...props} style={rootStyle}>
      <View style={glyphStyle} />
    </View>
  );
});

const meta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  args: {
    color: '#185abd',
    height: 24,
    width: 24,
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const FontCodepoint: Story = {
  args: {
    fontSource: { codepoint: 0x2605, fontFamily: 'Arial' },
  },
};

export const Image: Story = {
  args: {
    imageSource: { uri: imageDataUri },
  },
};

export const SvgComponent: Story = {
  args: {
    svgSource: SampleSvgIcon,
  },
};
