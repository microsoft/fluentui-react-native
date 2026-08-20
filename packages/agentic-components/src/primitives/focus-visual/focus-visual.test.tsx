/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';

import { render } from '@testing-library/react-native';

import { FocusVisual, createFocusVisualProps } from './focus-visual';

describe('FocusVisual', () => {
  it('keeps both rings mounted while visibility changes', async () => {
    const props = createFocusVisualProps({
      borderRadius: 4,
      innerColor: 'white',
      innerWidth: 1,
      outerColor: 'black',
      outerWidth: 2,
      visible: false,
    });
    const component = await render(<FocusVisual {...props} inner={{ ...props.inner, testID: 'inner-ring' }} testID="outer-ring" />);
    const outerRing = component.getByTestId('outer-ring', { includeHiddenElements: true });
    const innerRing = component.getByTestId('inner-ring', { includeHiddenElements: true });

    expect(outerRing.props).toMatchObject({
      accessibilityElementsHidden: true,
      accessible: false,
      collapsable: false,
      focusable: false,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(StyleSheet.flatten(outerRing.props.style)).toMatchObject({
      borderColor: 'black',
      borderRadius: 4,
      borderWidth: 2,
      opacity: 0,
      position: 'absolute',
    });
    expect(StyleSheet.flatten(innerRing.props.style)).toMatchObject({
      borderColor: 'white',
      borderRadius: 4,
      borderWidth: 1,
      position: 'absolute',
    });

    await component.rerender(<FocusVisual {...props} inner={{ ...props.inner, testID: 'inner-ring' }} testID="outer-ring" visible />);

    expect(component.getByTestId('inner-ring', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(StyleSheet.flatten(component.getByTestId('outer-ring', { includeHiddenElements: true }).props.style).opacity).toBeUndefined();
  });

  it('renders a single ring when no inner ring is requested', async () => {
    const component = await render(
      <FocusVisual
        {...createFocusVisualProps({
          outerColor: 'black',
          outerWidth: 2,
          visible: true,
        })}
        testID="outer-ring"
      />,
    );

    expect(component.getByTestId('outer-ring', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(component.queryByTestId('inner-ring')).toBeNull();
  });
});
