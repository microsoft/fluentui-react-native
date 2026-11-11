/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { View } from 'react-native';
import { render } from '../../common/renderWithTheme';

import { CheckboxIndicator } from './checkbox-indicator';

describe('CheckboxIndicator', () => {
  it.each([
    ['checked', '★', 'checkbox-check-icon'],
    ['indeterminate', '•', 'checkbox-dash-icon'],
  ] as const)('uses the independently supplied %s glyph and forwards its dimensions and color', async (status, glyph, testID) => {
    const component = await render(
      <CheckboxIndicator
        accessibilityHint="Owned by the checkbox"
        checkedIconSource={{ codepoint: 0x2605, fontFamily: 'CheckedFont' }}
        iconColor="purple"
        iconSize={22}
        indeterminateIconSource={{ codepoint: 0x2022, fontFamily: 'MixedFont' }}
        status={status}
        style={{ borderWidth: 3 }}
        testID="indicator"
      />,
    );
    expect(component.getByTestId('indicator').props).toMatchObject({
      accessible: false,
      accessibilityHint: 'Owned by the checkbox',
    });
    expect(StyleSheet.flatten(component.getByTestId('indicator').props.style)).toMatchObject({ borderWidth: 3 });
    expect(StyleSheet.flatten(component.getByTestId(testID).props.style)).toMatchObject({ height: 22, width: 22 });
    expect(StyleSheet.flatten(component.getByText(glyph).props.style)).toMatchObject({
      color: 'purple',
      fontFamily: status === 'checked' ? 'CheckedFont' : 'MixedFont',
      fontSize: 22,
    });
    expect(component.queryByRole('image')).toBeNull();
  });

  it('defaults to an empty decorative root and removes the previous glyph when unchecked', async () => {
    const component = await render(<CheckboxIndicator testID="indicator" />);
    expect(component.getByTestId('indicator').children).toHaveLength(0);
    await component.rerender(<CheckboxIndicator status="checked" testID="indicator" />);
    expect(component.getByTestId('checkbox-check-icon')).toBeOnTheScreen();
    await component.rerender(<CheckboxIndicator status="unchecked" testID="indicator" />);
    expect(component.getByTestId('indicator').children).toHaveLength(0);
  });

  it('forwards its ref prop to the native root', async () => {
    const ref = React.createRef<React.ElementRef<typeof View>>();

    await render(<CheckboxIndicator ref={ref} />);

    expect(ref.current).not.toBeNull();
  });

  it('renders checked and indeterminate glyphs as decorative content', async () => {
    const checked = await render(<CheckboxIndicator status="checked" testID="indicator" />);
    const indicator = checked.getByTestId('indicator');

    expect(indicator.props).toMatchObject({
      accessible: false,
    });
    expect(checked.getByTestId('checkbox-check-icon')).toBeOnTheScreen();

    const indeterminate = await render(<CheckboxIndicator status="indeterminate" testID="indicator" />);
    expect(indeterminate.getByTestId('checkbox-dash-icon')).toBeOnTheScreen();

    const unchecked = await render(<CheckboxIndicator status="unchecked" testID="indicator" />);
    expect(unchecked.queryByTestId('checkbox-check-icon')).toBeNull();
    expect(unchecked.queryByTestId('checkbox-dash-icon')).toBeNull();
  });
});
