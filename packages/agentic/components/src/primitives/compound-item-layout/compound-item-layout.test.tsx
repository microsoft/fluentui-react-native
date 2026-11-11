/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, StyleSheet, Text, type View } from 'react-native';

import { render } from '../../common/renderWithTheme';

import { CompoundItemLayout } from './compound-item-layout';

describe('CompoundItemLayout', () => {
  it.each(['right', 'under'] as const)(
    'keeps %s content shrinkable and edge regions fixed while applying region overrides last',
    async (secondaryPosition) => {
      const ref = React.createRef<React.ComponentRef<typeof View>>();
      const component = await render(
        <CompoundItemLayout
          ref={ref}
          accessibilityLabel="Compound row"
          contentStyle={{ gap: 7 }}
          leading={<Text>Leading</Text>}
          leadingStyle={{ padding: 3 }}
          primary={<Text>Primary</Text>}
          primaryStyle={{ flexGrow: 2 }}
          secondary={<Text>Secondary</Text>}
          secondaryPosition={secondaryPosition}
          secondaryStyle={{ marginTop: 4 }}
          style={{ width: 120 }}
          testID="row"
          trailing={<Text>Trailing</Text>}
          trailingStyle={{ marginLeft: 9 }}
        />,
      );
      expect(ref.current).not.toBeNull();
      const root = component.getByTestId('row');
      expect(root.props.accessibilityLabel).toBe('Compound row');
      expect(StyleSheet.flatten(root.props.style)).toMatchObject({ width: 120, minWidth: 0, flexShrink: 1 });
      const regionStyle = (text: string) => StyleSheet.flatten(component.getByText(text).parent?.props.style);
      expect(regionStyle('Leading')).toMatchObject({ flexShrink: 0, padding: 3 });
      expect(regionStyle('Trailing')).toMatchObject({ flexShrink: 0, marginLeft: 9 });
      expect(regionStyle('Primary')).toMatchObject({ flexGrow: 2, flexShrink: 1, minWidth: 0 });
      expect(regionStyle('Secondary')).toMatchObject({ flexShrink: 1, minWidth: 0, marginTop: 4 });
      expect(StyleSheet.flatten(component.getByText('Primary').parent?.parent?.props.style)).toMatchObject({
        flexDirection: secondaryPosition === 'under' ? 'column' : 'row',
        flexShrink: 1,
        minWidth: 0,
        gap: 7,
      });
      await component.rerender(<CompoundItemLayout primary={<Text>Primary</Text>} testID="row" />);
      expect(component.getByTestId('row').children).toHaveLength(1);
      expect(component.queryByText('Leading')).toBeNull();
      expect(component.queryByText('Secondary')).toBeNull();
      expect(component.queryByText('Trailing')).toBeNull();
    },
  );

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
