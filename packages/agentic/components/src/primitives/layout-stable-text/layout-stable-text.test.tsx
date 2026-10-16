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
    expect(StyleSheet.flatten(visible.props.style)).toEqual({ flexShrink: 1, fontSize: 12, lineHeight: 16 });
    expect(StyleSheet.flatten(visible.parent?.props.style)).toMatchObject({ left: 0, right: 0, justifyContent: 'center' });
    expect(StyleSheet.flatten(component.getByTestId('stable-text').props.style)).toMatchObject({ width: 80 });
  });

  it('preserves native layout measurements for both the hidden reserve and visible text', async () => {
    const onReserveLayout = jest.fn();
    const onVisibleLayout = jest.fn();
    const component = await render(
      <LayoutStableText
        reserve={<Text onLayout={onReserveLayout}>Reserve</Text>}
        visible={
          <Text onLayout={onVisibleLayout} testID="visible">
            Visible
          </Text>
        }
      />,
    );
    const reserveLayout = { nativeEvent: { layout: { x: 0, y: 0, width: 103, height: 24 } } };
    const visibleLayout = { nativeEvent: { layout: { x: 0, y: 4, width: 104, height: 16 } } };

    await fireEvent(component.getByText('Reserve', { includeHiddenElements: true }), 'layout', reserveLayout);
    await fireEvent(component.getByTestId('visible'), 'layout', visibleLayout);

    expect(onReserveLayout).toHaveBeenCalledWith(reserveLayout);
    expect(onVisibleLayout).toHaveBeenCalledWith(visibleLayout);
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
