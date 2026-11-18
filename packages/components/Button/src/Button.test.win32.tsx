import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Button } from './Button';
import type { ButtonProps } from './Button.types';

describe('Button Win32 keyboard handling', () => {
  let component: renderer.ReactTestRenderer;
  const onClick = jest.fn();
  const onKeyDown = jest.fn();
  const getButton = () => component.root.find((node) => typeof node.type === 'string' && node.props.testID === 'keyboard-button');

  const renderButton = (props: ButtonProps = {}) => {
    act(() => {
      component = renderer.create(<Button testID="keyboard-button" onClick={onClick} onKeyDown={onKeyDown} {...props} />);
    });
    return getButton();
  };

  const keyEvent = (key: string) => ({ nativeEvent: { key }, stopPropagation: jest.fn() });

  afterEach(() => {
    act(() => {
      getButton().props.onBlur({});
      component.unmount();
    });
    jest.clearAllMocks();
  });

  describe.each(['Enter', ' '])('%p', (key) => {
    it('forwards keydown and invokes onClick once on keyup', () => {
      const button = renderButton({ keyDownEvents: [{ key }] });
      const down = keyEvent(key);
      const up = keyEvent(key);

      act(() => button.props.onKeyDown(down));
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalledWith(down);
      expect(onClick).not.toHaveBeenCalled();
      expect(button.props.keyDownEvents).toEqual([{ key }]);

      act(() => button.props.onKeyUp(up));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(up);

      act(() => button.props.onKeyUp(up));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('still invokes onClick without a consumer keydown handler', () => {
      const button = renderButton({ onKeyDown: undefined });

      act(() => button.props.onKeyDown(keyEvent(key)));
      act(() => button.props.onKeyUp(keyEvent(key)));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('ignores keyup without a preceding keydown', () => {
      const button = renderButton();

      act(() => button.props.onKeyUp(keyEvent(key)));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('cancels keyboard activation on blur', () => {
      const onBlur = jest.fn();
      const button = renderButton({ onBlur });

      act(() => button.props.onKeyDown(keyEvent(key)));
      act(() => button.props.onBlur({}));
      act(() => button.props.onKeyUp(keyEvent(key)));

      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not arm a disabled button', () => {
      const button = renderButton({ disabled: true });

      act(() => button.props.onKeyDown(keyEvent(key)));
      act(() => button.props.onKeyUp(keyEvent(key)));

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  it('forwards other keys without arming activation', () => {
    const button = renderButton();
    const down = keyEvent('a');

    act(() => button.props.onKeyDown(down));
    act(() => button.props.onKeyUp(keyEvent('Enter')));

    expect(onKeyDown).toHaveBeenCalledWith(down);
    expect(onClick).not.toHaveBeenCalled();
  });
});
