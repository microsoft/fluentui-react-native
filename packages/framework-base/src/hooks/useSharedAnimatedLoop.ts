import * as React from 'react';
import { Animated, Easing } from 'react-native';

export type SharedAnimatedLoopOptions = {
  channel: string;
  duration: number;
  enabled: boolean;
  useNativeDriver: boolean;
};

type SharedAnimatedLoop = {
  animation?: Animated.CompositeAnimation;
  cleanupTimer?: ReturnType<typeof setTimeout>;
  holders: number;
  subscribers: number;
  value: Animated.Value;
};

const sharedLoops = new Map<string, SharedAnimatedLoop>();

function getSharedLoop(key: string): SharedAnimatedLoop {
  let loop = sharedLoops.get(key);
  if (!loop) {
    loop = {
      holders: 0,
      subscribers: 0,
      value: new Animated.Value(0),
    };
    sharedLoops.set(key, loop);
  }

  return loop;
}

function cancelCleanup(loop: SharedAnimatedLoop): void {
  if (loop.cleanupTimer !== undefined) {
    clearTimeout(loop.cleanupTimer);
    loop.cleanupTimer = undefined;
  }
}

function scheduleCleanup(key: string, loop: SharedAnimatedLoop): void {
  if (loop.holders !== 0 || loop.subscribers !== 0 || loop.cleanupTimer !== undefined) {
    return;
  }

  loop.cleanupTimer = setTimeout(() => {
    loop.cleanupTimer = undefined;
    if (loop.holders === 0 && loop.subscribers === 0 && sharedLoops.get(key) === loop) {
      sharedLoops.delete(key);
    }
  }, 0);
}

/**
 * Returns one phase-locked animated value for every mounted subscriber on a
 * channel with the same timing configuration.
 */
export function useSharedAnimatedLoop({ channel, duration, enabled, useNativeDriver }: SharedAnimatedLoopOptions): Animated.Value {
  const key = `${channel}:${duration}:${useNativeDriver ? 'native' : 'javascript'}`;
  const sharedLoop = React.useMemo(() => getSharedLoop(key), [key]);

  React.useEffect(() => {
    cancelCleanup(sharedLoop);
    sharedLoop.holders += 1;

    return () => {
      sharedLoop.holders -= 1;
      scheduleCleanup(key, sharedLoop);
    };
  }, [key, sharedLoop]);

  React.useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    sharedLoop.subscribers += 1;
    if (sharedLoop.subscribers === 1) {
      sharedLoop.value.setValue(0);
      sharedLoop.animation = Animated.loop(
        Animated.timing(sharedLoop.value, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver,
        }),
      );
      sharedLoop.animation.start();
    }

    return () => {
      sharedLoop.subscribers -= 1;
      if (sharedLoop.subscribers === 0) {
        sharedLoop.animation?.stop();
        sharedLoop.animation = undefined;
        sharedLoop.value.stopAnimation();
        sharedLoop.value.setValue(0);
        scheduleCleanup(key, sharedLoop);
      }
    };
  }, [duration, enabled, key, sharedLoop, useNativeDriver]);

  return sharedLoop.value;
}
