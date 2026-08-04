/** @jsxImportSource @fluentui-react-native/framework-base */
import { Image, Text, View } from 'react-native';

import { directComponent, isDirectComponent, useOptionalSlot } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

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

  it('renders an image with dimensions and color', () => {
    let component: ReactTestRenderer;
    act(() => {
      component = create(<Icon imageSource={{ uri: 'icon.png' }} height={16} width={20} color="red" />);
    });

    const image = component!.root.findByType(Image);
    expect(image.props.source).toEqual({ uri: 'icon.png' });
    expect(image.props.style).toEqual({ height: 16, tintColor: 'red', width: 20 });
  });

  it('renders a font codepoint with dimensions and color', () => {
    let component: ReactTestRenderer;
    act(() => {
      component = create(<Icon fontSource={{ codepoint: 0x1f680, fontFamily: 'IconFont' }} height={24} width={20} color="blue" />);
    });

    const text = component!.root.findByType(Text);
    expect(text.props.children).toBe('🚀');
    expect(text.props.style).toEqual({
      color: 'blue',
      fontFamily: 'IconFont',
      fontSize: 20,
      height: 24,
      lineHeight: 24,
      width: 20,
    });
  });

  it('forwards shared props to an SVG component', () => {
    let component: ReactTestRenderer;
    act(() => {
      component = create(<Icon svgSource={TestSvg} height={12} width={14} color="green" testID="svg-icon" />);
    });

    const svg = component!.root.findByType(View);
    expect(svg.props).toMatchObject({
      accessibilityRole: 'image',
      color: 'green',
      height: 12,
      testID: 'svg-icon',
      width: 14,
    });
  });

  it('supports component replacement when used as a slot prop', () => {
    const ReplacementIcon = directComponent<IconElementProps>((props) => <View {...props} accessibilityHint="replacement" />);
    let component: ReactTestRenderer;
    act(() => {
      component = create(<IconSlotConsumer icon={{ as: ReplacementIcon, height: 18, width: 18 }} />);
    });

    const icon = component!.root.findAllByType(View).find((view) => view.props.accessibilityHint === 'replacement');
    expect(icon).toBeDefined();
    expect(icon.props.accessibilityHint).toBe('replacement');
    expect(icon.props.height).toBe(18);
    expect(icon.props.width).toBe(18);
  });
});
