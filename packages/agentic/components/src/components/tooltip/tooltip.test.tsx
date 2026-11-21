import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Button } from '../button/button';
import { Card } from '../card/card';
import { Tooltip } from './tooltip';

afterEach(() => jest.restoreAllMocks());

it('forwards a direct tip to the native root, without adding help or duplicating it on a Card overlay', async () => {
  const result = await render(<Button content="Save" tooltip="Save draft" />);
  expect(result.getByRole('button').props).toMatchObject({ tooltip: 'Save draft' });
  expect(result.getByRole('button').props.accessibilityHint).toBeUndefined();
  await result.rerender(<Card testID="card" tooltip="Project details" onPress={jest.fn()} />);
  expect(result.getByTestId('card').props.tooltip).toBe('Project details');
  expect(result.getByRole('button').props.tooltip).toBeUndefined();
  await result.rerender(<Card testID="card" onPress={jest.fn()} />);
  expect(result.getByTestId('card').props.tooltip).toBeUndefined();
});

it.each([
  ['macos', 'accessibilityHint'],
  ['windows', 'accessibilityDescription'],
  ['win32', 'accessibilityDescription'],
] as const)('sets and clears supplemental text on the same %s trigger', async (platform, key) => {
  jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
  const onPress = jest.fn();
  const trigger = <Pressable testID="trigger" accessibilityLabel="Save" onPress={onPress} />;
  const result = await render(<Tooltip content="Save the draft">{trigger}</Tooltip>);
  const root = result.getByTestId('trigger');
  expect(root.props).toMatchObject({ tooltip: 'Save the draft', [key]: 'Save the draft', accessibilityLabel: 'Save' });
  await fireEvent.press(root);
  expect(onPress).toHaveBeenCalledTimes(1);
  await result.rerender(<Tooltip content="Save">{trigger}</Tooltip>);
  expect(root.props.tooltip).toBe('Save');
  expect(root.props[key]).toBeUndefined();
  await result.rerender(<Tooltip content="  ">{trigger}</Tooltip>);
  expect(root.props.tooltip).toBeUndefined();
  expect(root.props[key]).toBeUndefined();
});

it('keeps caller-authored help and both React 19 refs across text changes', async () => {
  jest.replaceProperty(Platform, 'OS', 'macos');
  const ref = React.createRef<React.ComponentRef<typeof View>>();
  const cleanup = jest.fn();
  const childRef = jest.fn(() => cleanup);
  const trigger = <View testID="trigger" ref={childRef} accessibilityHint="Original help" />;
  const result = await render(
    <Tooltip content="First" ref={ref}>
      {trigger}
    </Tooltip>,
  );
  expect(ref.current).not.toBeNull();
  expect(childRef).toHaveBeenCalledWith(ref.current);
  await result.rerender(
    <Tooltip content="Second" ref={ref}>
      {trigger}
    </Tooltip>,
  );
  expect(result.getByTestId('trigger').props).toMatchObject({ tooltip: 'Second', accessibilityHint: 'Original help' });
  expect(childRef).toHaveBeenCalledTimes(1);
  await result.unmount();
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(ref.current).toBeNull();
});

it('does not replace a Windows description or duplicate an explicit name', async () => {
  jest.replaceProperty(Platform, 'OS', 'windows');
  const description = { accessibilityDescription: 'Existing description' };
  const result = await render(
    <Tooltip content="Details">
      <Pressable testID="trigger" {...description} />
    </Tooltip>,
  );
  expect(result.getByTestId('trigger').props.accessibilityDescription).toBe('Existing description');
  await result.rerender(
    <Tooltip content="Details">
      <Pressable testID="trigger" aria-label="Details" />
    </Tooltip>,
  );
  expect(result.getByTestId('trigger').props.tooltip).toBe('Details');
  expect(result.getByTestId('trigger').props.accessibilityDescription).toBeUndefined();
});
