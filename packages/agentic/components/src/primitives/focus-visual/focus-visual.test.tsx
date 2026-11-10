/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, type View } from 'react-native';

import { render } from '../../common/renderWithTheme';

import { FocusVisual, createFocusVisualProps_unstable } from './focus-visual';

describe('FocusVisual', () => {
  it('forwards both native refs and ring styles while retaining decorative hit-testing policy', async () => {
    const ref = React.createRef<React.ComponentRef<typeof View>>();
    const innerRef = React.createRef<React.ComponentRef<typeof View>>();
    const component = await render(
      <FocusVisual
        ref={ref}
        inner={{ ref: innerRef, style: { borderWidth: 1, borderRadius: 5 } }}
        style={{ borderWidth: 3, borderRadius: 7, opacity: 0.6 }}
        testID="ring"
      />,
    );
    expect(ref.current).not.toBeNull();
    expect(innerRef.current).not.toBeNull();
    expect(innerRef.current).not.toBe(ref.current);
    for (const testID of ['ring', 'ring-inner']) {
      expect(component.getByTestId(testID, { includeHiddenElements: true }).props).toMatchObject({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
        focusable: false,
        pointerEvents: 'none',
        collapsable: false,
      });
    }
    expect(StyleSheet.flatten(component.getByTestId('ring', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderWidth: 3,
      borderRadius: 7,
      opacity: 0,
    });
    await component.rerender(<FocusVisual inner={{ style: { borderWidth: 1 } }} style={{ opacity: 0.6 }} testID="ring" visible />);
    expect(StyleSheet.flatten(component.getByTestId('ring', { includeHiddenElements: true }).props.style).opacity).toBe(0.6);
  });

  it.each([{ innerColor: 'white' }, { innerWidth: 1 }, {}])('does not create a partially configured inner ring: %j', (inner) => {
    expect(createFocusVisualProps_unstable({ ...inner, outerColor: 'black', outerWidth: 2, visible: true }).inner).toBeUndefined();
  });

  it('keeps both rings mounted while visibility changes', async () => {
    const props = createFocusVisualProps_unstable({
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
        {...createFocusVisualProps_unstable({
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
