/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text } from 'react-native';

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

  it('allows text rows to opt into a shared baseline without changing the default centering policy', async () => {
    const component = await render(
      <CompoundItemLayout
        contentStyle={{ alignItems: 'baseline' }}
        primary={<Text>Primary</Text>}
        secondary={<Text>Secondary</Text>}
        style={{ alignItems: 'baseline' }}
        testID="text-row"
        trailing={<Text>Shortcut</Text>}
      />,
    );

    expect(StyleSheet.flatten(component.getByTestId('text-row').props.style)).toMatchObject({ alignItems: 'baseline' });
    const content = component.getByText('Primary').parent?.parent;
    expect(StyleSheet.flatten(content?.props.style)).toMatchObject({ alignItems: 'baseline' });

    await component.rerender(<CompoundItemLayout primary={<Text>Primary</Text>} testID="text-row" />);
    expect(StyleSheet.flatten(component.getByTestId('text-row').props.style)).toMatchObject({ alignItems: 'center' });
  });
});
