/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text } from 'react-native';

import { render } from '@testing-library/react-native';

import { CompoundItemLayout } from './compound-item-layout';

describe('CompoundItemLayout', () => {
  it('renders leading, primary, secondary, and trailing regions', async () => {
    const component = await render(
      <CompoundItemLayout
        leading={<Text>Leading</Text>}
        primary={<Text>Primary</Text>}
        secondary={<Text>Secondary</Text>}
        secondaryPosition="under"
        trailing={<Text>Trailing</Text>}
      />,
    );

    expect(component.getByText('Leading')).toBeOnTheScreen();
    expect(component.getByText('Primary')).toBeOnTheScreen();
    expect(component.getByText('Secondary')).toBeOnTheScreen();
    expect(component.getByText('Trailing')).toBeOnTheScreen();
  });
});
