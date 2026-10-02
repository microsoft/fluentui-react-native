import * as React from 'react';
import type { PopoverAnchor } from './usePopoverAnchor';
import type { PopoverMenuHostOptions } from './popover.types';
import { createPopoverMenuSession } from './popoverMenuSession';
import type { PopoverMenuSession } from './popoverMenuSession';

type Presentation = {
  key: string | number;
  anchor: PopoverAnchor;
  session: PopoverMenuSession;
  surfaceKey: number;
};

export function usePopoverMenuPresentation(
  options: PopoverMenuHostOptions | undefined,
  open: boolean,
  anchor: PopoverAnchor | null,
  isCurrent: (anchor: PopoverAnchor) => boolean,
  close: () => void,
) {
  const [, update] = React.useReducer((value: number) => value + 1, 0);
  const latest = React.useRef({ options, close });
  latest.current = { options, close };
  const [presentation, setPresentation] = React.useState<Presentation | undefined>(undefined);
  const previousOpen = React.useRef(false);
  const rearmAfterClose = React.useRef(false);
  const latch = React.useRef<{ key: string | number } | undefined>(undefined);
  const nextKey = React.useRef(0);
  const mounted = React.useRef(false);
  const optionsKey = options?.presentationKey;
  const enabled = options !== undefined;

  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  React.useLayoutEffect(() => {
    const currentOptions = latest.current.options;
    if (!currentOptions) return;
    if (!open) {
      previousOpen.current = false;
      latch.current = undefined;
      if (presentation?.session.hidden && !presentation.session.terminal) return;
      setPresentation(undefined);
      return;
    }
    if (!previousOpen.current) {
      latch.current = undefined;
      rearmAfterClose.current = Boolean(presentation?.session.hidden);
    }
    previousOpen.current = true;
    if (presentation) {
      if (presentation.anchor !== anchor || !isCurrent(presentation.anchor)) {
        presentation.session.cancelAnchor();
        return;
      }
      if (presentation.key !== optionsKey) {
        if (presentation.session.hidden && !presentation.session.terminal) return;
        presentation.session.unmount();
        setPresentation(undefined);
      } else {
        return;
      }
    }
    if (!anchor || !isCurrent(anchor) || latch.current?.key === optionsKey) return;
    const session = createPopoverMenuSession(
      anchor.sourceGeneration ?? anchor.generation,
      () => isCurrent(anchor),
      () => {
        if (!latest.current.options) throw new Error('Popover: managed host policy disappeared during its presentation.');
        return latest.current.options;
      },
      () => {
        if (!rearmAfterClose.current) latch.current = { key: currentOptions.presentationKey };
        if (mounted.current) update();
      },
      () => latest.current.close(),
      () => {
        if (mounted.current) setPresentation((current) => (current?.session === session ? undefined : current));
      },
    );
    rearmAfterClose.current = false;
    setPresentation({ key: currentOptions.presentationKey, anchor, session, surfaceKey: ++nextKey.current });
  }, [enabled, optionsKey, open, anchor, isCurrent, presentation]);

  return presentation;
}
