import * as React from 'react';

/** The open-change reasons every popup reports: its trigger and native dismissal. */
export type PopupOpenChangeReason = 'trigger' | 'dismiss';

export interface PopupPresenceOptions<TReason extends string> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, data: { reason: TReason }) => void;
  /** A disabled popup is never presented. */
  disabled?: boolean;
  /** Whether disabling an uncontrolled popup clears its request, so enabling it again does not reopen it. */
  closeWhenDisabled?: boolean;
}

/** The presence values callbacks read after the render that produced them. */
export interface PopupPresenceSnapshot {
  controlled: boolean;
  requested: boolean;
  presented: boolean;
}

export interface PopupPresence<TReason extends string> {
  /** The caller's request, or the uncontrolled one. */
  requested: boolean;
  /** Whether the popup is presented: requested, enabled, and not natively dismissed. */
  presented: boolean;
  /** Changes when an explicit request rearms a natively dismissed one, so native-core presents it again. */
  presentationKey: string;
  latest: React.RefObject<PopupPresenceSnapshot>;
  /** Updates an uncontrolled request and reports the change. */
  requestOpen(open: boolean, reason: TReason): void;
  /** Presents again a request that native dismissal latched closed. */
  rearm(): void;
  /** After native dismissal, latches a controlled request closed until it changes or is rearmed. */
  latchDismissed(): void;
}

/** Requested presence and whether native dismissal latched the current request closed. */
interface PresenceLifetime {
  requested: boolean;
  rearm: number;
  latched: boolean;
}

/**
 * Requested and actual presence for a native popup. Native presence is authoritative: a native dismissal latches a
 * controlled request closed until the caller changes it or an explicit trigger input rearms it.
 */
export function usePopupPresence<TReason extends string>(options: PopupPresenceOptions<TReason>): PopupPresence<TReason> {
  const { closeWhenDisabled = false, defaultOpen = false, disabled = false, onOpenChange, open } = options;
  const controlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const requested = controlled ? open : uncontrolledOpen;
  const [rearmCount, setRearmCount] = React.useState(0);
  const [lifetime, setLifetime] = React.useState<PresenceLifetime>(() => ({ requested, rearm: rearmCount, latched: false }));
  // A new request or an explicit rearm clears the latch in the same render that presents it.
  const latched = lifetime.requested === requested && lifetime.rearm === rearmCount && lifetime.latched;
  if (lifetime.requested !== requested || lifetime.rearm !== rearmCount) {
    setLifetime({ requested, rearm: rearmCount, latched: false });
  }
  const presented = requested && !latched && !disabled;

  const latest = React.useRef<PopupPresenceSnapshot>({ controlled, presented, requested });
  const handleOpenChange = React.useRef(onOpenChange);
  React.useLayoutEffect(() => {
    latest.current = { controlled, presented, requested };
    handleOpenChange.current = onOpenChange;
  });

  React.useEffect(() => {
    if (closeWhenDisabled && disabled && !controlled) {
      setUncontrolledOpen(false);
    }
  }, [closeWhenDisabled, controlled, disabled]);

  const requestOpen = React.useCallback((next: boolean, reason: TReason) => {
    if (!latest.current.controlled) {
      setUncontrolledOpen(next);
    }
    handleOpenChange.current?.(next, { reason });
  }, []);
  const rearm = React.useCallback(() => setRearmCount((value) => value + 1), []);
  const latchDismissed = React.useCallback(() => {
    if (latest.current.controlled) {
      setLifetime((current) => ({ ...current, latched: current.requested }));
    }
  }, []);

  return { requested, presented, presentationKey: String(rearmCount), latest, requestOpen, rearm, latchDismissed };
}
