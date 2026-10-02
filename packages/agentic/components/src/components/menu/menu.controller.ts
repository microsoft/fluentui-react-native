import type * as React from 'react';
import type { View } from 'react-native';
import type { FocusKeyboardEvent, FocusTarget } from '@fluentui-react-native/framework-base';
import type {
  CalloutCloseOutcome,
  CalloutCloseReason,
  CalloutFocusIntent,
  CalloutMenuPointerMoveEvent,
} from '@fluentui-react-native/callout';
import type { PopoverMenuHostBinding, PopoverMenuHostSnapshot } from '../popover/popover.types';
import { menuKeyDestination } from './menu.keyboard';
import type { MenuNavigationItem, MenuScreenPoint } from './menu.keyboard';

export type MenuRegistration = {
  target: FocusTarget;
  nativeRef: React.RefObject<View | null>;
  requestSubmenu(open: boolean): void;
};
type Registration = MenuRegistration & { epoch: number };
type ScopeState = { activeId?: string; branchId?: string; ready: boolean; hasPresented: boolean };
type Family = { keyboard: boolean; point?: MenuScreenPoint };

export interface MenuScope {
  readonly depth: number;
  readonly family: Family;
  getSnapshot(): ScopeState;
  subscribe(listener: () => void): () => void;
  mount(): () => void;
  setBinding(binding: PopoverMenuHostBinding | null): void;
  configure(items: readonly MenuNavigationItem[]): void;
  register(id: string, registration: MenuRegistration): () => void;
  attachChild(id: string, child: MenuScope): () => void;
  ready(binding: PopoverMenuHostBinding, generation: string): void;
  dismissed(): void;
  focus(id: string): void;
  expanded(id: string, open: boolean): void;
  close(reason: CalloutCloseReason, returnFocus: boolean): Promise<CalloutCloseOutcome | undefined>;
  closeBranch(): Promise<void>;
  openSubmenu(id: string): Promise<void>;
  key(id: string, event: FocusKeyboardEvent, rtl: boolean): void;
  action(): void;
  canInvoke(id: string): boolean;
  pointer(event: CalloutMenuPointerMoveEvent, binding: PopoverMenuHostBinding): void;
  requestFocus(id: string, intent: CalloutFocusIntent | 'initial'): Promise<boolean>;
}

export function createMenuScope(depth: number, parent: MenuScope | undefined, nativeTag: (instance: View) => number | null): MenuScope {
  const family: Family = parent?.family ?? { keyboard: false };
  let state: ScopeState = { ready: false, hasPresented: false };
  let items: readonly MenuNavigationItem[] = [];
  let alive = false;
  let epoch = 0;
  let work = 0;
  let closeWork = 0;
  let closing = false;
  let inFlightClose: { reason: CalloutCloseReason; returnFocus: boolean; promise: Promise<CalloutCloseOutcome | undefined> } | undefined;
  let branchWork = 0;
  let pendingFocusId: string | undefined;
  let binding: PopoverMenuHostBinding | undefined;
  let readyGeneration: string | undefined;
  let initialPending = false;
  let detachLease: (() => void) | undefined;
  const registrations = new Map<string, Registration>();
  const children = new Map<string, MenuScope>();
  const subscribers = new Set<() => void>();
  const update = (patch: Partial<ScopeState>) => {
    const next = { ...state, ...patch };
    if (
      next.activeId !== state.activeId ||
      next.branchId !== state.branchId ||
      next.ready !== state.ready ||
      next.hasPresented !== state.hasPresented
    ) {
      state = next;
      subscribers.forEach((listener) => listener());
    }
  };
  const eligible = (id: string) => items.some((item) => item.itemId === id && !item.disabled);
  const current = (): Extract<PopoverMenuHostSnapshot, { phase: 'ready' }> | undefined => {
    const snapshot = binding?.getCurrent();
    return alive && !closing && snapshot?.phase === 'ready' && !snapshot.signal.aborted ? snapshot : undefined;
  };
  const report = (operation: string, status: string) => console.warn(`Menu ${operation}: ${status}.`);
  const failed = (operation: string, error: unknown) => console.error(`Menu ${operation} failed.`, error);
  const requestFocus = async (id: string, intent: CalloutFocusIntent | 'initial'): Promise<boolean> => {
    const snapshot = current();
    const registration = registrations.get(id);
    if (!snapshot || !eligible(id) || !registration?.nativeRef.current || registration.target.current !== registration.nativeRef.current) {
      report(`focus "${id}"`, 'not-mounted or not-focusable');
      return false;
    }
    const request = ++work;
    pendingFocusId = id;
    const instance = registration.nativeRef.current;
    const generation = registration.target.generation;
    const dispatch = intent === 'initial' ? snapshot.handle.focusInitialChild : snapshot.handle.focusOwnedChild;
    if (!dispatch) {
      pendingFocusId = undefined;
      report(`focus "${id}"`, 'unsupported managed method');
      return false;
    }
    const outcome =
      intent === 'initial'
        ? await snapshot.handle.focusInitialChild(snapshot.nativeGeneration, registration.nativeRef)
        : await snapshot.handle.focusOwnedChild(snapshot.nativeGeneration, registration.nativeRef, intent);
    const now = current();
    if (
      request !== work ||
      !now ||
      now.signal !== snapshot.signal ||
      now.nativeGeneration !== snapshot.nativeGeneration ||
      now.anchorMountGeneration !== snapshot.anchorMountGeneration ||
      snapshot.signal.aborted ||
      registrations.get(id) !== registration ||
      registration.target.generation !== generation ||
      registration.nativeRef.current !== instance ||
      !eligible(id)
    )
      return false;
    if (outcome.status !== 'confirmed') {
      pendingFocusId = undefined;
      report(`focus "${id}"`, outcome.status);
      return false;
    }
    pendingFocusId = undefined;
    update({ activeId: id });
    return true;
  };
  const tryInitial = () => {
    if (!initialPending || !current()) return;
    const first = items.find((item) => !item.disabled);
    if (!first) {
      initialPending = false;
      return;
    }
    if (!registrations.get(first.itemId)?.nativeRef.current) return;
    initialPending = false;
    void requestFocus(first.itemId, 'initial').catch((error: unknown) => failed('initial focus', error));
  };
  const scope: MenuScope = {
    depth,
    family,
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },
    mount() {
      alive = true;
      tryInitial();
      return () => {
        alive = false;
        ++work;
        ++closeWork;
        ++branchWork;
        detachLease?.();
        detachLease = undefined;
      };
    },
    setBinding(next: PopoverMenuHostBinding | null) {
      if (binding !== next) {
        ++work;
        ++closeWork;
        ++branchWork;
        inFlightClose = undefined;
        pendingFocusId = undefined;
        binding = next ?? undefined;
      }
    },
    configure(next: readonly MenuNavigationItem[]) {
      const previous = items;
      const oldIndex = previous.findIndex((item) => item.itemId === state.activeId);
      items = next;
      if (state.activeId && !eligible(state.activeId)) {
        ++work;
        ++branchWork;
        const nextEntry =
          next.slice(Math.max(0, oldIndex)).find((item) => !item.disabled) ?? [...next].reverse().find((item) => !item.disabled);
        update({ activeId: undefined });
        if (nextEntry && current()) {
          void requestFocus(nextEntry.itemId, 'repair').catch((error: unknown) => failed('removal repair', error));
        }
      }
      if (state.branchId && !eligible(state.branchId)) {
        void scope.closeBranch().catch((error: unknown) => failed('invalid branch close', error));
      }
      tryInitial();
    },
    register(id: string, value: MenuRegistration) {
      const registration = { ...value, epoch: ++epoch };
      registrations.set(id, registration);
      tryInitial();
      return () => {
        if (registrations.get(id)?.epoch === registration.epoch) {
          registrations.delete(id);
          ++work;
        }
      };
    },
    attachChild(id: string, child: MenuScope) {
      children.set(id, child);
      return () => {
        if (children.get(id) === child) children.delete(id);
      };
    },
    ready(nextBinding: PopoverMenuHostBinding, generation: string) {
      binding = nextBinding;
      const snapshot = nextBinding.getCurrent();
      if (
        snapshot?.phase !== 'ready' ||
        snapshot.signal.aborted ||
        snapshot.nativeGeneration !== generation ||
        generation === readyGeneration
      )
        return;
      closing = false;
      ++work;
      ++closeWork;
      ++branchWork;
      inFlightClose = undefined;
      pendingFocusId = undefined;
      detachLease?.();
      readyGeneration = generation;
      if (depth === 0) family.point = undefined;
      initialPending = true;
      const cancel = () => {
        ++work;
        ++branchWork;
        pendingFocusId = undefined;
        initialPending = false;
        update({ ready: false });
      };
      snapshot.signal.addEventListener('abort', cancel, { once: true });
      detachLease = () => snapshot.signal.removeEventListener('abort', cancel);
      update({ ready: true, hasPresented: true, activeId: undefined });
      tryInitial();
    },
    dismissed() {
      ++work;
      ++branchWork;
      pendingFocusId = undefined;
      initialPending = false;
      closing = false;
      readyGeneration = undefined;
      update({ activeId: undefined, branchId: undefined, ready: false });
    },
    focus(id: string) {
      if (eligible(id) && current()) {
        if (pendingFocusId && pendingFocusId !== id) {
          ++work;
          ++branchWork;
          pendingFocusId = undefined;
        }
        update({ activeId: id });
      }
    },
    expanded(id: string, open: boolean) {
      if (open) {
        if (state.branchId && state.branchId !== id) throw new Error('Menu cannot present two controlled sibling submenus.');
        update({ branchId: id });
      } else if (state.branchId === id) update({ branchId: undefined });
    },
    async close(reason: CalloutCloseReason, returnFocus: boolean): Promise<CalloutCloseOutcome | undefined> {
      if (inFlightClose) {
        if (inFlightClose.reason === reason && inFlightClose.returnFocus === returnFocus) return inFlightClose.promise;
        report('close', 'another owned close already won');
        return undefined;
      }
      const snapshot = current();
      if (!snapshot) {
        report('close', 'no live ready presentation');
        return undefined;
      }
      if (!snapshot.handle.closeOwned) {
        report('close', 'unsupported managed method');
        return undefined;
      }
      if (reason === 'submenu-back' && depth === 0) throw new Error('Root Menu cannot use submenu-back.');
      const request = ++closeWork;
      const ownerBinding = binding;
      closing = true;
      ++work;
      const promise = (async () => {
        let outcome: CalloutCloseOutcome;
        try {
          outcome = await snapshot.handle.closeOwned(snapshot.nativeGeneration, reason, returnFocus);
        } catch (error) {
          if (alive && request === closeWork) closing = false;
          throw error;
        }
        if (outcome.returnFocus === 'failed') report('native return focus', 'failed');
        // Close deliberately revokes the lease before this Promise continuation.
        if (
          !alive ||
          request !== closeWork ||
          binding !== ownerBinding ||
          (readyGeneration && readyGeneration !== snapshot.nativeGeneration)
        )
          return undefined;
        if (outcome.status !== 'confirmed') {
          closing = false;
          report('close', outcome.status);
        }
        return outcome;
      })();
      const operation = { reason, returnFocus, promise };
      inFlightClose = operation;
      try {
        return await promise;
      } finally {
        if (inFlightClose === operation) inFlightClose = undefined;
      }
    },
    async closeBranch() {
      const id = state.branchId;
      if (!id) return;
      const child = children.get(id);
      if (child) {
        const result = await child.close('programmatic', false);
        if (!alive || result?.status !== 'confirmed') return;
      }
      if (state.branchId !== id) return;
      update({ branchId: undefined });
      registrations.get(id)?.requestSubmenu(false);
    },
    async openSubmenu(id: string) {
      if (!eligible(id) || !items.find((item) => item.itemId === id)?.submenu) return;
      const snapshot = current();
      if (!snapshot) return;
      const request = ++branchWork;
      if (state.branchId && state.branchId !== id) await scope.closeBranch();
      const now = current();
      if (
        request !== branchWork ||
        !now ||
        now.signal !== snapshot.signal ||
        snapshot.signal.aborted ||
        !eligible(id) ||
        (state.branchId && state.branchId !== id)
      )
        return;
      registrations.get(id)?.requestSubmenu(true);
      update({ branchId: id });
    },
    key(id: string, event: FocusKeyboardEvent, rtl: boolean) {
      const result = menuKeyDestination(items, id, event, rtl, depth > 0);
      if (!result || !current()) return;
      event.preventDefault?.();
      event.stopPropagation?.();
      family.keyboard = true;
      ++work;
      ++branchWork;
      if (result.kind === 'focus') {
        if (result.itemId !== state.activeId)
          void requestFocus(result.itemId, 'keyboard').catch((error: unknown) => failed('navigation', error));
      } else if (result.kind === 'open') {
        void scope.openSubmenu(id).catch((error: unknown) => failed('submenu open', error));
      } else {
        void scope.close('submenu-back', true).catch((error: unknown) => failed('submenu back', error));
      }
    },
    action() {
      void scope.close('action', true).catch((error: unknown) => failed('action close', error));
    },
    canInvoke(id: string) {
      if (eligible(id) && current()) return true;
      report(`activation "${id}"`, 'no live eligible ready presentation');
      return false;
    },
    pointer(event: CalloutMenuPointerMoveEvent, nextBinding: PopoverMenuHostBinding) {
      if (binding !== nextBinding) return;
      const snapshot = current();
      if (!snapshot || snapshot.nativeGeneration !== event.nativeEvent.generation) return;
      const { pointerId, screenX, screenY, targetTag } = event.nativeEvent;
      if (
        !Number.isFinite(screenX) ||
        !Number.isFinite(screenY) ||
        !pointerId ||
        !Number.isInteger(targetTag) ||
        targetTag < 0 ||
        targetTag > 2147483647
      )
        throw new Error('Menu received invalid native movement/hit identity.');
      if (family.point?.pointerId === pointerId && family.point.screenX === screenX && family.point.screenY === screenY) return;
      const point = { pointerId, screenX, screenY };
      family.point = point;
      family.keyboard = false;
      ++work;
      ++branchWork;
      if (!targetTag) return;
      const item = items.find((candidate) => {
        const registered = registrations.get(candidate.itemId);
        const instance = registered?.nativeRef.current;
        return !candidate.disabled && instance && registered.target.current === instance && nativeTag(instance) === targetTag;
      });
      if (!item) return;
      const registration = registrations.get(item.itemId);
      const targetGeneration = registration.target.generation;
      const instance = registration.nativeRef.current;
      const applyPointer = async () => {
        if (state.branchId && state.branchId !== item.itemId) await scope.closeBranch();
        const now = current();
        if (
          !now ||
          now.signal !== snapshot.signal ||
          now.nativeGeneration !== snapshot.nativeGeneration ||
          snapshot.signal.aborted ||
          family.keyboard ||
          family.point !== point ||
          registrations.get(item.itemId) !== registration ||
          registration.nativeRef.current !== instance ||
          registration.target.generation !== targetGeneration ||
          !eligible(item.itemId) ||
          (state.branchId && state.branchId !== item.itemId)
        )
          return;
        const confirmed = await requestFocus(item.itemId, 'pointer');
        if (confirmed && !family.keyboard && family.point === point) await scope.openSubmenu(item.itemId);
      };
      void applyPointer().catch((error: unknown) => failed('hover focus', error));
    },
    requestFocus,
  };
  return scope;
}
