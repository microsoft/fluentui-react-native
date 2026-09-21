/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

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
      <Icon fontSource={{ codepoint: 0x1f680, fontFamily: 'IconFont' }} height={24} width={20} color="blue" testID="font-icon" />,
    );

    const text = component.getByText('🚀');
    expect(StyleSheet.flatten(component.getByTestId('font-icon').props.style)).toEqual({
      alignItems: 'center',
      flexShrink: 0,
      height: 24,
      justifyContent: 'center',
      width: 20,
    });
    expect(text.props.style).toEqual({
      color: 'blue',
      flexShrink: 0,
      fontFamily: 'IconFont',
      fontSize: 20,
      includeFontPadding: false,
      padding: 0,
      position: 'absolute',
      textAlign: 'center',
    });
    expect(text.props).toMatchObject({ accessible: false, allowFontScaling: false, numberOfLines: 1 });
  });

  it.each([
    { height: 12, width: 12, fontSize: 12 },
    { height: 16, width: 24, fontSize: 16 },
    { height: 32, width: 20, fontSize: 20 },
    { height: 16, width: undefined, fontSize: 16 },
    { height: undefined, width: 24, fontSize: 24 },
    { height: undefined, width: undefined, fontSize: undefined },
  ])('keeps intrinsic font metrics for $height by $width icons', async ({ height, width, fontSize }) => {
    const component = await render(<Icon fontSource={{ codepoint: 0x2713 }} height={height} width={width} testID="font-icon" />);
    const glyph = component.getByText('✓');
    const glyphStyle = StyleSheet.flatten(glyph.props.style);

    expect(StyleSheet.flatten(component.getByTestId('font-icon').props.style)).toMatchObject({ height, width });
    expect(glyphStyle.fontSize).toBe(fontSize);
    expect(glyph.props.allowFontScaling).toBe(fontSize === undefined);
    expect(glyphStyle.position).toBe(height !== undefined && width !== undefined ? 'absolute' : undefined);
    for (const property of ['height', 'width', 'lineHeight', 'textAlignVertical', 'transform', 'top', 'bottom', 'left', 'right']) {
      expect(glyphStyle).not.toHaveProperty(property);
    }
  });

  it('keeps font icon semantics on one frame and preserves caller accessibility', async () => {
    const component = await render(
      <Icon
        accessibilityHint="Confirms the operation"
        accessibilityLabel="Confirm"
        fontSource={{ codepoint: 0x2713 }}
        height={16}
        width={16}
      />,
    );
    expect(component.getAllByRole('image')).toHaveLength(1);
    expect(component.getByRole('image').props).toMatchObject({
      accessibilityHint: 'Confirms the operation',
      accessibilityLabel: 'Confirm',
      accessible: true,
    });

    await component.rerender(<Icon accessible={false} accessibilityRole="none" fontSource={{ codepoint: 0x2713 }} testID="decorative" />);
    expect(component.getByTestId('decorative').props).toMatchObject({ accessibilityRole: 'none', accessible: false });
    expect(component.queryByRole('image')).toBeNull();
  });

  it('forwards shared props to an SVG component', async () => {
    const component = await render(<Icon svgSource={TestSvg} height={12} width={14} color="green" testID="svg-icon" />);

    expect(component.getByTestId('svg-icon').props).toMatchObject({
      accessibilityRole: 'image',
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
