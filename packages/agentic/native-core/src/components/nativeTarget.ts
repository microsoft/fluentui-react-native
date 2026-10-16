import * as React from 'react';
import { findNodeHandle } from 'react-native';
import type { View } from 'react-native';

const targetBrand = Symbol('native-core.target');

export interface NativeViewTarget {
  readonly [targetBrand]: true;
}

type ViewInstance = React.ComponentRef<typeof View>;
type Snapshot = Readonly<{ current: ViewInstance | null; generation: number }>;
const emptySnapshot: Snapshot = Object.freeze({ current: null, generation: 0 });

class Target implements NativeViewTarget {
  readonly [targetBrand] = true as const;
  private snapshot = emptySnapshot;
  private registration = 0;
  private detached: Snapshot | undefined;
  private listeners = new Set<() => void>();

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  private publish() {
    Array.from(this.listeners).forEach((listener) => listener());
  }

  attach(instance: ViewInstance) {
    const previous = this.detached ?? this.snapshot;
    this.detached = undefined;
    const ticket = ++this.registration;
    if (previous.current === instance) {
      this.snapshot = previous;
    } else {
      this.snapshot = Object.freeze({ current: instance, generation: previous.generation + 1 });
      this.publish();
    }
    return () => {
      if (ticket !== this.registration) return;
      ++this.registration;
      const detached = this.snapshot;
      this.detached = detached;
      this.snapshot = Object.freeze({ current: null, generation: detached.generation });
      queueMicrotask(() => {
        if (this.detached !== detached) return;
        this.detached = undefined;
        this.snapshot = Object.freeze({ current: null, generation: detached.generation + 1 });
        this.publish();
      });
    };
  }
}

function implementation(target: NativeViewTarget): Target {
  if (!(target instanceof Target)) throw new TypeError('Expected a target created by useNativeViewTarget.');
  return target;
}

export function useNativeViewTarget(): Readonly<{ target: NativeViewTarget; ref: React.RefCallback<ViewInstance> }> {
  return React.useMemo(() => {
    const target = new Target();
    let detach: (() => void) | undefined;
    const ref: React.RefCallback<ViewInstance> = (instance) => {
      if (instance) {
        detach = target.attach(instance);
        return detach;
      }
      detach?.();
      detach = undefined;
      return undefined;
    };
    return { target, ref };
  }, []);
}

const subscribeEmpty = () => () => undefined;
const getEmpty = () => emptySnapshot;

export function useTargetSnapshot(target?: NativeViewTarget): Snapshot {
  const store = target ? implementation(target) : undefined;
  return React.useSyncExternalStore(store?.subscribe ?? subscribeEmpty, store?.getSnapshot ?? getEmpty, getEmpty);
}

export function resolveTarget(target: NativeViewTarget) {
  const store = implementation(target);
  const snapshot = store.getSnapshot();
  const tag = snapshot.current ? findNodeHandle(snapshot.current) : null;
  return {
    tag,
    isCurrent: () => store.getSnapshot().current === snapshot.current && store.getSnapshot().generation === snapshot.generation,
  };
}

export function useTargetTag(target?: NativeViewTarget): number | undefined {
  const snapshot = useTargetSnapshot(target);
  const [tag, setTag] = React.useState<number>();
  React.useLayoutEffect(() => {
    setTag(snapshot.current ? (findNodeHandle(snapshot.current) ?? undefined) : undefined);
  }, [snapshot]);
  return tag;
}
