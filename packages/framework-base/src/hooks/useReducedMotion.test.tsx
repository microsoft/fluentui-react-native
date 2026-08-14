import * as React from 'react';
import { act } from 'react';
import * as renderer from 'react-test-renderer';
import { AccessibilityInfo } from 'react-native';

import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts unresolved, resolves the preference, and follows reduce motion events', async () => {
    const subscription = { remove: jest.fn() };
    const querySpy = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const eventSpy = jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue(subscription as never);
    let current: boolean | undefined;
    let tree!: renderer.ReactTestRenderer;

    const Harness: React.FunctionComponent = () => {
      current = useReducedMotion();
      return null;
    };

    act(() => {
      tree = renderer.create(<Harness />);
      expect(current).toBeUndefined();
    });

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(eventSpy).toHaveBeenCalledWith('reduceMotionChanged', expect.any(Function));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(current).toBe(true);

    const reduceMotionHandler = eventSpy.mock.calls[0][1] as unknown as (value: boolean) => void;
    act(() => {
      reduceMotionHandler(false);
    });

    expect(current).toBe(false);

    act(() => {
      tree.unmount();
    });

    expect(subscription.remove).toHaveBeenCalledTimes(1);
  });
});
