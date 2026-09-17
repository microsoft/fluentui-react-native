/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, StyleSheet } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';

import { render } from '../../common/renderWithTheme';
import { Button } from './button';

function keyEvent(key: string, extras: Partial<FocusKeyboardEvent['nativeEvent']> = {}) {
  return {
    nativeEvent: { key, code: key === ' ' ? 'Space' : key, ...extras },
    target: 1,
    currentTarget: 1,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation: jest.fn(),
  };
}

describe('Button macOS Pressability', () => {
  it.each([' ', 'Enter'])('releases %j after an intervening key without another activation', async (key) => {
    expect(Platform.OS).toBe('macos');
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const component = await render(<Button content="Activate" onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} />);
    const button = component.getByRole('button');
    const restStyle = StyleSheet.flatten(button.props.style);

    await fireEvent(button, 'keyDown', keyEvent(key));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(button.props.style)).not.toEqual(restStyle);
    await fireEvent(button, 'keyDown', keyEvent('x'));
    await fireEvent(button, 'keyUp', keyEvent('x'));
    await fireEvent(button, 'keyDown', keyEvent(key));
    await fireEvent(button, 'keyUp', keyEvent(key));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(button.props.style)).toEqual(restStyle);
  });

  it('activates once on keydown, suppresses repeats, and forwards the release once', async () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const component = await render(<Button content="Activate" onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} />);
    const button = component.getByRole('button');
    const restStyle = StyleSheet.flatten(button.props.style);

    await fireEvent(button, 'keyDown', keyEvent(' '));
    await fireEvent(button, 'keyDown', keyEvent(' '));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).not.toHaveBeenCalled();
    await fireEvent(button, 'keyUp', keyEvent(' '));
    await fireEvent(button, 'keyUp', keyEvent(' '));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(button.props.style)).toEqual(restStyle);
  });

  it('clears a keyboard press on self-blur without delivering a stale release twice', async () => {
    const onPressOut = jest.fn();
    const component = await render(<Button content="Activate" onPressOut={onPressOut} />);
    const button = component.getByRole('button');
    const restStyle = StyleSheet.flatten(button.props.style);

    await fireEvent(button, 'keyDown', keyEvent(' '));
    await fireEvent(button, 'blur', { target: 2, currentTarget: 1 });
    expect(onPressOut).not.toHaveBeenCalled();
    await fireEvent(button, 'blur', { target: 1, currentTarget: 1 });
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(button.props.style)).toEqual(restStyle);
    await fireEvent(button, 'keyUp', keyEvent(' '));
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it.each([{ disabled: true }, { focusable: false }])('clears a keyboard press when eligibility becomes %j', async (ineligible) => {
    const onPress = jest.fn();
    const onPressOut = jest.fn();
    const props = { content: 'Activate', onPress, onPressOut };
    const component = await render(<Button {...props} />);
    const button = component.getByRole('button');
    const restStyle = StyleSheet.flatten(button.props.style);

    await fireEvent(button, 'keyDown', keyEvent(' '));
    await component.rerender(<Button {...props} {...ineligible} />);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    await component.rerender(<Button {...props} />);
    await fireEvent(component.getByRole('button'), 'keyUp', keyEvent(' '));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(component.getByRole('button').props.style)).toEqual(restStyle);
  });

  it.each(['altKey', 'ctrlKey', 'metaKey', 'shiftKey'])('does not activate or start a press for a %s chord', async (modifier) => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const component = await render(<Button content="Activate" onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} />);
    const button = component.getByRole('button');

    await fireEvent(button, 'keyDown', keyEvent('Enter', { [modifier]: true }));
    await fireEvent(button, 'keyUp', keyEvent('Enter'));
    expect(onPress).not.toHaveBeenCalled();
    expect(onPressIn).not.toHaveBeenCalled();
    expect(onPressOut).not.toHaveBeenCalled();
  });

  it('clears pressed feedback when the caller prevents the native release', async () => {
    const onPressOut = jest.fn();
    const component = await render(<Button content="Activate" onPressOut={onPressOut} onKeyUp={(event) => event.preventDefault()} />);
    const button = component.getByRole('button');
    const restStyle = StyleSheet.flatten(button.props.style);

    await fireEvent(button, 'keyDown', keyEvent(' '));
    await fireEvent(button, 'keyUp', keyEvent(' '));
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(button.props.style)).toEqual(restStyle);
  });
});
