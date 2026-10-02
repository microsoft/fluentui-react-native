import * as React from 'react';
import type { Pressable } from 'react-native';
import type { PopoverCommittedAnchor } from './popover.types';

type AnchorInstance = React.ComponentRef<typeof Pressable>;

export type PopoverAnchor = {
  readonly generation: number;
  readonly sourceGeneration?: number;
  readonly sourceLifetime?: PopoverCommittedAnchor['lifetime'];
  readonly target: React.RefObject<AnchorInstance | null>;
};

type PopoverAnchorBinding = {
  anchor: PopoverAnchor | null;
  anchorRef: React.RefCallback<AnchorInstance>;
  liveAnchor: React.RefObject<AnchorInstance | null>;
  isCurrent(anchor: PopoverAnchor): boolean;
};

/** Tracks committed native attachments without treating callback handoffs as replacement. */
export function usePopoverAnchor(onDetach: () => void, external?: { attachment: PopoverCommittedAnchor | null }): PopoverAnchorBinding {
  const liveAnchor = React.useRef<AnchorInstance | null>(null);
  const registration = React.useRef(0);
  const previous = React.useRef<PopoverAnchor | null>(null);
  const mounted = React.useRef(true);
  const detachObserver = React.useRef(onDetach);
  detachObserver.current = onDetach;
  const [anchor, setAnchor] = React.useState<PopoverAnchor | null>(null);
  const externalRef = React.useRef(external);
  externalRef.current = external;
  const externalGeneration = React.useRef<number | undefined>(undefined);

  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const anchorRef = React.useCallback<React.RefCallback<AnchorInstance>>((instance) => {
    const epoch = ++registration.current;
    liveAnchor.current = instance;
    const detach = () => {
      if (registration.current !== epoch) {
        return;
      }
      const detachedEpoch = ++registration.current;
      liveAnchor.current = null;
      // React can detach/reattach callback refs to the same host in one commit.
      queueMicrotask(() => {
        if (mounted.current && registration.current === detachedEpoch && !liveAnchor.current) {
          const hadAnchor = previous.current !== null;
          previous.current = null;
          setAnchor(null);
          if (hadAnchor) {
            detachObserver.current();
          }
        }
      });
    };

    if (!instance) {
      detach();
      return undefined;
    }
    if (previous.current?.target.current !== instance) {
      const next = {
        generation: epoch,
        sourceGeneration: externalRef.current?.attachment?.mountGeneration,
        sourceLifetime: externalRef.current?.attachment?.lifetime,
        target: { current: instance },
      };
      previous.current = next;
      setAnchor(next);
    }
    return detach;
  }, []);

  const attachment = external?.attachment;
  const externalEnabled = external !== undefined;
  React.useLayoutEffect(() => {
    if (!externalRef.current) return undefined;
    let cleanup: void | (() => void);
    const synchronize = () => {
      const supplied = externalRef.current?.attachment;
      const instance = supplied?.nativeRef.current;
      const valid =
        supplied && instance && supplied.lifetime.current === instance && supplied.lifetime.generation === supplied.mountGeneration;
      if (supplied && instance && !valid) {
        console.error('Popover: external anchor does not match its committed native instance and mount generation.');
      }
      if (valid) {
        if (
          liveAnchor.current !== instance ||
          externalGeneration.current !== supplied.mountGeneration ||
          previous.current?.sourceLifetime !== supplied.lifetime
        ) {
          if (typeof cleanup === 'function') cleanup();
          // A new mount generation is replacement even if the renderer reuses the object.
          if (
            externalGeneration.current !== undefined &&
            (externalGeneration.current !== supplied.mountGeneration || previous.current?.sourceLifetime !== supplied.lifetime)
          ) {
            previous.current = null;
          }
          externalGeneration.current = supplied.mountGeneration;
          cleanup = anchorRef(instance);
        }
      } else if (liveAnchor.current) {
        if (typeof cleanup === 'function') cleanup();
        else anchorRef(null);
      }
    };
    synchronize();
    const unsubscribe = attachment?.lifetime.subscribe(synchronize);
    return () => {
      unsubscribe?.();
      if (typeof cleanup === 'function') cleanup();
    };
  }, [anchorRef, attachment?.lifetime, attachment?.nativeRef, attachment?.mountGeneration, externalEnabled]);

  const isCurrent = React.useCallback((candidate: PopoverAnchor) => {
    if (liveAnchor.current !== candidate.target.current) return false;
    const supplied = externalRef.current;
    if (!supplied) return true;
    const current = supplied.attachment;
    return Boolean(
      current &&
      current.nativeRef.current === candidate.target.current &&
      current.lifetime.current === candidate.target.current &&
      current.lifetime.generation === current.mountGeneration &&
      candidate.sourceGeneration === current.mountGeneration &&
      candidate.sourceLifetime === current.lifetime &&
      externalGeneration.current === current.mountGeneration,
    );
  }, []);

  return { anchor, anchorRef, liveAnchor, isCurrent };
}
