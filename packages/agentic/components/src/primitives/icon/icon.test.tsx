/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import { render } from '@testing-library/react-native';

import { directComponent, isDirectComponent, useOptionalSlot } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { Icon } from './icon';
import type { IconElementProps } from './icon.types';

const TestSvg = directComponent<IconElementProps>((props) => <View {...props} />);

type IconSlotConsumerProps = {
  icon?: SlotProp<typeof Icon>;
};

function IconSlotConsumer({ icon }: IconSlotConsumerProps) {
  const IconSlot = useOptionalSlot(Icon, icon);
  return <View>{IconSlot && <IconSlot />}</View>;
}

describe('Icon', () => {
  it('is directly renderable', () => {
    expect(isDirectComponent(Icon)).toBe(true);
  });

  it('renders an image with dimensions and color', async () => {
    const component = await render(<Icon imageSource={{ uri: 'icon.png' }} height={16} width={20} color="red" testID="image-icon" />);

    const image = component.getByTestId('image-icon');
    expect(image.props.source).toEqual({ uri: 'icon.png' });
    expect(image.props.style).toEqual({ height: 16, tintColor: 'red', width: 20 });
  });

  it('renders a font codepoint with dimensions and color', async () => {
    const component = await render(
      <Icon fontSource={{ codepoint: 0x1f680, fontFamily: 'IconFont' }} height={24} width={20} color="blue" />,
    );

    const text = component.getByText('🚀');
    expect(text.props.style).toEqual({
      color: 'blue',
      fontFamily: 'IconFont',
      fontSize: 20,
      height: 24,
      lineHeight: 24,
      padding: 0,
      textAlign: 'center',
      textAlignVertical: 'center',
      width: 20,
    });
  });

  it('forwards shared props to an SVG component', async () => {
    const component = await render(<Icon svgSource={TestSvg} height={12} width={14} color="green" testID="svg-icon" />);

    expect(component.getByTestId('svg-icon').props).toMatchObject({
      role: 'img',
      color: 'green',
      height: 12,
      testID: 'svg-icon',
      width: 14,
    });
  });

  it('supports component replacement when used as a slot prop', async () => {
    const ReplacementIcon = directComponent<IconElementProps>((props) => <View {...props} accessibilityHint="replacement" />);
    const component = await render(<IconSlotConsumer icon={{ as: ReplacementIcon, height: 18, width: 18 }} />);

    const icon = component.getByAccessibilityHint('replacement');
    expect(icon.props.accessibilityHint).toBe('replacement');
    expect(icon.props.height).toBe(18);
    expect(icon.props.width).toBe(18);
  });
});
