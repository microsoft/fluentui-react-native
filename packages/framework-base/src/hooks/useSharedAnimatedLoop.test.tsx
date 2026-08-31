import { act } from 'react';
import { Animated, Easing } from 'react-native';
import * as renderer from 'react-test-renderer';

import { useSharedAnimatedLoop } from './useSharedAnimatedLoop';

describe('useSharedAnimatedLoop', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shares one running value for subscribers on the same channel', () => {
    const start = jest.fn();
    const stop = jest.fn();
    const timing = jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn(), stop: jest.fn() } as never);
    const loop = jest.spyOn(Animated, 'loop').mockReturnValue({ start, stop } as never);
    const values: Animated.Value[] = [];
    const Harness = () => {
      values.push(
        useSharedAnimatedLoop({
          channel: 'test-loop',
          duration: 1500,
          enabled: true,
          useNativeDriver: true,
        }),
      );
      return null;
    };

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <>
          <Harness />
          <Harness />
        </>,
      );
    });

    expect(values[0]).toBe(values[1]);
    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledWith(
      values[0],
      expect.objectContaining({
        duration: 1500,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    expect(loop).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);

    act(() => tree.unmount());
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('does not start a disabled channel', () => {
    const loop = jest.spyOn(Animated, 'loop');
    const Harness = () => {
      useSharedAnimatedLoop({
        channel: 'disabled-loop',
        duration: 1000,
        enabled: false,
        useNativeDriver: true,
      });
      return null;
    };

    act(() => {
      renderer.create(<Harness />);
    });

    expect(loop).not.toHaveBeenCalled();
  });

  it('keeps a disabled mounted holder on the same channel when it is re-enabled', () => {
    const timing = jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn(), stop: jest.fn() } as never);
    jest.spyOn(Animated, 'loop').mockReturnValue({ start: jest.fn(), stop: jest.fn() } as never);
    const values = new Map<string, Animated.Value>();
    const Harness = ({ enabled, id }: { enabled: boolean; id: string }) => {
      values.set(
        id,
        useSharedAnimatedLoop({
          channel: 'toggle-loop',
          duration: 1500,
          enabled,
          useNativeDriver: true,
        }),
      );
      return null;
    };

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Harness enabled id="first" />);
    });
    const firstValue = values.get('first');

    act(() => {
      tree.update(<Harness enabled={false} id="first" />);
    });
    act(() => {
      tree.update(
        <>
          <Harness enabled id="first" />
          <Harness enabled id="second" />
        </>,
      );
    });

    expect(values.get('first')).toBe(firstValue);
    expect(values.get('second')).toBe(firstValue);
    expect(timing).toHaveBeenCalledTimes(2);
    act(() => tree.unmount());
  });

  it('releases an always-disabled channel after its last holder unmounts', () => {
    jest.useFakeTimers();
    const values: Animated.Value[] = [];
    const Harness = () => {
      values.push(
        useSharedAnimatedLoop({
          channel: 'released-disabled-loop',
          duration: 1000,
          enabled: false,
          useNativeDriver: true,
        }),
      );
      return null;
    };

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Harness />);
    });
    const firstValue = values.at(-1);
    values.length = 0;
    act(() => {
      tree.unmount();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    act(() => {
      tree = renderer.create(<Harness />);
    });

    expect(values.at(-1)).not.toBe(firstValue);
    act(() => tree.unmount());
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });
});
