/** @jsxImportSource @fluentui-react-native/framework-base */
import { fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { render } from '../../common/renderWithTheme';
import { ToggleButton } from './toggle-button';

it('uses one selection owner for ordinary press and Toggle, preserving the original action event', async () => {
  const onSelectedChange = jest.fn();
  const onPress = jest.fn();
  const onAccessibilityAction = jest.fn();
  const component = await render(
    <ToggleButton content="Favorite" onSelectedChange={onSelectedChange} onPress={onPress} onAccessibilityAction={onAccessibilityAction} />,
  );
  const root = component.getByRole('button');
  expect(root.props.accessibilityState.checked).toBe(false);
  await fireEvent.press(root);
  expect(root.props.accessibilityState.checked).toBe(true);
  const event = { nativeEvent: { actionName: root.props.accessibilityActions[0].name } };
  await fireEvent(root, 'accessibilityAction', event);
  expect(root.props.accessibilityState.checked).toBe(false);
  expect(onSelectedChange.mock.calls).toEqual([[true], [false]]);
  expect(onAccessibilityAction).toHaveBeenCalledWith(event);
  expect(onPress).toHaveBeenCalledTimes(1);
});

it('does not show optimistic controlled or disabled changes', async () => {
  const onSelectedChange = jest.fn();
  const component = await render(<ToggleButton content="Favorite" selected={false} defaultSelected onSelectedChange={onSelectedChange} />);
  const root = component.getByRole('button');
  await fireEvent.press(root);
  expect(root.props.accessibilityState.checked).toBe(false);
  expect(onSelectedChange.mock.calls).toEqual([[true]]);
  await component.rerender(<ToggleButton content="Favorite" selected disabled onSelectedChange={onSelectedChange} />);
  await fireEvent(root, 'accessibilityAction', { nativeEvent: { actionName: root.props.accessibilityActions[0].name } });
  await fireEvent.press(root);
  expect(root.props.accessibilityState.checked).toBe(true);
  expect(onSelectedChange).toHaveBeenCalledTimes(1);
});

it('changes the supplied leading icon, retains the trailing fallback, and reserves strong width in both states', async () => {
  const component = await render(
    <ToggleButton
      content="Favorite"
      leadingIcon={{ imageSource: { uri: 'normal.png' }, testID: 'normal' }}
      selectedLeadingIcon={{ imageSource: { uri: 'selected.png' }, testID: 'selected' }}
      trailingIcon={{ imageSource: { uri: 'trailing.png' }, testID: 'trailing' }}
    />,
  );
  const reserve = () => StyleSheet.flatten(component.getAllByText('Favorite', { includeHiddenElements: true })[0].props.style);
  expect(component.getByTestId('normal')).toBeOnTheScreen();
  expect(reserve()).toMatchObject({ fontWeight: '600', opacity: 0 });
  await fireEvent.press(component.getByRole('button'));
  expect(component.queryByTestId('normal')).toBeNull();
  expect(component.getByTestId('selected')).toBeOnTheScreen();
  expect(component.getByTestId('trailing')).toBeOnTheScreen();
  expect(reserve()).toMatchObject({ fontWeight: '600', opacity: 0 });
});
