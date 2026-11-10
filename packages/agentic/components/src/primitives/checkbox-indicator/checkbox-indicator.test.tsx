/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { View } from 'react-native';
import { render } from '../../common/renderWithTheme';

import { Checkmark12Filled, Subtract12Filled } from '../../common/icons/fluentIcons.generated';
import { getGeneratedIconPaths, getRenderedIconPaths } from '../../common/icons/iconTestUtils';
import { CheckboxIndicator } from './checkbox-indicator';

describe('CheckboxIndicator', () => {
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

  it.each([
    ['checked', 'checkbox-check-icon', Checkmark12Filled],
    ['indeterminate', 'checkbox-dash-icon', Subtract12Filled],
  ] as const)('draws the default %s glyph, in the SVG default fill without an icon color', async (status, testID, expected) => {
    const component = await render(<CheckboxIndicator status={status} />);
    const icon = component.getByTestId(testID);

    expect(getRenderedIconPaths(icon)).toEqual(getGeneratedIconPaths(expected));
    expect(icon.props.fill).toBeUndefined();
  });

  it('draws the glyph in the icon color', async () => {
    const component = await render(<CheckboxIndicator iconColor="red" status="checked" />);

    expect(component.getByTestId('checkbox-check-icon').props).toMatchObject({ color: 'red', fill: 'currentColor' });
  });
});
