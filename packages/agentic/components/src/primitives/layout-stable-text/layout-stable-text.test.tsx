/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text } from 'react-native';

import { render } from '@testing-library/react-native';

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
    expect(StyleSheet.flatten(visible.props.style)).toMatchObject({
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    });
  });
});
