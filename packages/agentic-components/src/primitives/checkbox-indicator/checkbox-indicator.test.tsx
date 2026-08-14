/** @jsxImportSource @fluentui-react-native/framework-base */
import { render } from '@testing-library/react-native';

import { CheckboxIndicator } from './checkbox-indicator';

describe('CheckboxIndicator', () => {
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
