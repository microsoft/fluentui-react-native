/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';

import { LayoutStableText } from './layout-stable-text';

describe('LayoutStableText', () => {
  it('reserves layout with hidden text and overlays the visible text', async () => {
    const component = await render(
      <LayoutStableText reserve={<Text testID="reserve">Label</Text>} visible={<Text testID="visible">Label</Text>} />,
    );
    const labels = component.getAllByText('Label', { includeHiddenElements: true });
    const reserve = labels.find((label) => StyleSheet.flatten(label.props.style).opacity === 0);
    const visible = component.getByTestId('visible');

    expect(reserve?.props).toMatchObject({
      accessibilityElementsHidden: true,
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(StyleSheet.flatten(visible.parent?.props.style)).toMatchObject({
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    });
    expect(StyleSheet.flatten(visible.props.style)).not.toHaveProperty('position');
  });

  it('centers smaller visible text without replacing its typography or wrapping constraints', async () => {
    const component = await render(
      <LayoutStableText
        reserve={
          <Text numberOfLines={2} style={{ fontSize: 20, lineHeight: 28 }}>
            A wrapping label
          </Text>
        }
        visible={
          <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 16 }} testID="visible">
            A wrapping label
          </Text>
        }
        style={{ width: 80 }}
        testID="stable-text"
      />,
    );
    const visible = component.getByTestId('visible');

    expect(visible.props.numberOfLines).toBe(2);
    expect(StyleSheet.flatten(visible.props.style)).toEqual({ flexShrink: 1, fontSize: 12, lineHeight: 16, maxWidth: '100%' });
    expect(StyleSheet.flatten(visible.parent?.props.style)).toMatchObject({ left: 0, right: 0, justifyContent: 'center' });
    expect(StyleSheet.flatten(component.getByTestId('stable-text').props.style)).toMatchObject({ width: 80 });
  });

  it('bounds visible text by the reserved width even when its native measurement or consumer width is larger', async () => {
    const component = await render(
      <LayoutStableText
        reserve={<Text style={{ fontSize: 20 }}>Stable label</Text>}
        style={{ width: 102 }}
        testID="stable-text"
        visible={
          <Text style={{ fontSize: 12, maxWidth: 200, width: 104 }} testID="visible">
            Stable label
          </Text>
        }
      />,
    );
    const visible = component.getByTestId('visible');

    expect(StyleSheet.flatten(visible.props.style)).toMatchObject({ flexShrink: 1, maxWidth: '100%', width: 104 });
    expect(StyleSheet.flatten(visible.parent?.props.style)).toMatchObject({ left: 0, right: 0 });
    expect(StyleSheet.flatten(component.getByTestId('stable-text').props.style)).toMatchObject({ width: 102 });
  });

  it('preserves visible text semantics and interaction through the overlay', async () => {
    const onPress = jest.fn();
    const component = await render(
      <LayoutStableText
        reserve={<Text>Label</Text>}
        visible={
          <Text accessibilityLabel="Visible label" onPress={onPress} testID="visible">
            Label
          </Text>
        }
      />,
    );
    const visible = component.getByTestId('visible');

    expect(visible.parent?.props).toMatchObject({ accessible: false, pointerEvents: 'box-none' });
    expect(visible.props.accessibilityLabel).toBe('Visible label');
    await fireEvent.press(visible);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
