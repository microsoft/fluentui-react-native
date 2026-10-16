/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, StyleSheet, Text } from 'react-native';

import { render } from '../../common/renderWithTheme';

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

  it.each([
    ['macos', false, 'center'],
    ['macos', true, 'baseline'],
    ['windows', true, 'baseline'],
    ['win32', false, 'baseline'],
  ])('uses %s story alignment with Fabric=%s', (platform, fabric, alignment) => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'nativeFabricUIManager');
    const create = jest.fn(StyleSheet.create);
    Object.defineProperty(globalThis, 'nativeFabricUIManager', { configurable: true, value: fabric ? {} : undefined });

    try {
      jest.isolateModules(() => {
        jest.doMock('react-native', () =>
          Object.create(jest.requireActual('react-native'), {
            Platform: { value: { ...Platform, OS: platform } },
            StyleSheet: { value: { ...StyleSheet, create } },
          }),
        );
        require('./compound-item-layout.stories');
      });
      expect(create.mock.calls.map(([styles]) => styles)).toEqual(
        expect.arrayContaining([expect.objectContaining({ textBaseline: { alignItems: alignment } })]),
      );
    } finally {
      jest.dontMock('react-native');
      if (descriptor) {
        Object.defineProperty(globalThis, 'nativeFabricUIManager', descriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'nativeFabricUIManager');
      }
    }
  });
});
