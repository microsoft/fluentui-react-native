/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeSyntheticEvent, TargetedEvent } from 'react-native';
import { directComponent, mergeProps, phasedComponent, useSlot } from '@fluentui-react-native/framework-base';

import { CalloutHost } from '../../internal/CalloutHost';
import { assertWin32Host } from '../../internal/modernHost';
import { Commands } from '../../specs/components/CalloutNativeComponent';
import type NativeCallout from '../../specs/components/CalloutNativeComponent';
import { allocateGeneration, createOperationChannel } from '../nativeOperation';
import type { NativeOperationOutcome } from '../nativeOperation';
import { resolveTarget, useTargetTag } from '../nativeTarget';
import { directionalHint, gapSpace } from './calloutPlacement';
import type { CalloutDismissReason, CalloutHandle, CalloutPresentation, CalloutProps } from './Callout.types';
import { Presentation } from './presentation';

interface Lifetime {
  open: boolean;
  key: string | undefined;
  presentation: Presentation;
  closed: boolean;
  anchored: boolean;
}

type FocusEvent = NativeSyntheticEvent<TargetedEvent>;
type KeyDeclaration = Readonly<{ key: string; shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }>;
type KeyEvent = NativeSyntheticEvent<{ key?: string; shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }>;
/** Win32 content events: focus and blur bubble from descendants, and key events reach the focused content. */
interface Win32ContentEvents {
  keyDownEvents?: readonly KeyDeclaration[];
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyEvent) => void;
  onKeyUp?: (event: KeyEvent) => void;
}

export interface Win32CalloutProps extends CalloutProps {
  /**
   * Whether the host focuses the first focusable content as the popup shows. With `first`, the default,
   * `requestFocus('first')` confirms that focus. With `none`, focus stays where it is until a request names an explicit
   * target, and `requestFocus('first')` is unsupported.
   */
  initialFocus?: 'first' | 'none';
}

// The host owns light dismissal and its default focus restoration. JavaScript owns Escape so it can report it.
const dismissBehaviors = ['preventDismissOnKeyDown'];
const keepFocus = () => undefined;
// Matches the Windows native anchor-press hold.
const lightDismissHoldMs = 250;
const tabKeys: readonly KeyDeclaration[] = [{ key: 'Tab' }, { key: 'Tab', shiftKey: true }];

// The Tab exit of the outermost presentation that exits by Tab, which Tab in any nested presentation runs.
const TabExitContext = React.createContext<((backward: boolean) => void) | null>(null);

/**
 * Office Win32 adapter for the modern Callout contract over the host's own `RCTCallout` registration, which accepts no
 * modern commands. Each presentation mounts a fresh host view. Readiness is the host's `onShow`; the host takes initial
 * focus into the first focusable content, which `requestFocus('first')` confirms from the observed focus event.
 * Explicit targets are focused in the activated popup window and confirmed the same way. Close and reposition are
 * unsupported: close a presentation by clearing `open`. Host light dismissal is reported unclassified and briefly held
 * so an anchor press can close the presentation first; the content's background and corner radius style the host
 * window; and current hosts ignore the placement gap.
 *
 * Content events bubble through the React tree on Win32, so the content stops them at the popup boundary, as a separate
 * native window would. The host cycles Tab within the popup and cannot continue it in the owner window: when Tab exits,
 * the outermost presentation that exits by Tab dismisses, and `continue` returns focus to the view anchor.
 */
export const Callout = phasedComponent<Win32CalloutProps>((props) => {
  assertWin32Host('Callout', 'RCTCallout');
  const { ref, open, presentationKey, anchor, content } = props;
  if (anchor.kind !== 'view') {
    throw new Error('The Win32 Callout adapter supports only view anchors; the host has no owner-relative geometry.');
  }
  const tag = useTargetTag(anchor.target);
  const nativeRef = React.useRef<React.ComponentRef<typeof NativeCallout>>(null);
  const [channel] = React.useState(createOperationChannel);
  const [lifetime, setLifetime] = React.useState<Lifetime>(() => ({
    open,
    key: presentationKey,
    presentation: new Presentation(allocateGeneration()),
    closed: false,
    anchored: false,
  }));
  if (lifetime.open !== open || lifetime.key !== presentationKey) {
    const rearm = (!lifetime.open && open) || lifetime.key !== presentationKey;
    setLifetime({
      open,
      key: presentationKey,
      presentation: rearm ? new Presentation(allocateGeneration()) : lifetime.presentation,
      closed: rearm ? false : lifetime.closed,
      anchored: rearm ? tag !== undefined : lifetime.anchored,
    });
  } else if (open && !lifetime.closed) {
    if (tag !== undefined && !lifetime.anchored) setLifetime({ ...lifetime, anchored: true });
    else if (tag === undefined && lifetime.anchored) setLifetime({ ...lifetime, closed: true });
  }
  const { presentation, closed } = lifetime;
  const { generation } = presentation;
  const presented = open && !closed && tag !== undefined;
  const committedGeneration = React.useRef(generation);
  const ready = React.useRef<CalloutPresentation | null>(null);
  const dismissed = React.useRef<CalloutPresentation | null>(null);
  // The content descendant that holds focus in the committed presentation, from bubbled Win32 focus events.
  const focused = React.useRef<{ generation: number; tag: number } | null>(null);
  // Focus requests awaiting a focus event on their target, keyed by operation request ID.
  const waiting = React.useRef(new Map<number, number>());
  // The render phase's initial focus mode, which `requestFocus('first')` reads.
  const initialFocus = React.useRef<Win32CalloutProps['initialFocus']>('first');
  // A host light dismissal whose report is held for a press on the anchor.
  const heldDismiss = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const outerTabExit = React.useContext(TabExitContext);
  // The current render's Tab exit, which nested presentations reach through the stable context value.
  const tabExit = React.useRef<(backward: boolean) => void>(() => undefined);
  const [ownTabExit] = React.useState(() => (backward: boolean) => tabExit.current(backward));
  // Set by a `continue` Tab exit; the anchor takes focus once the popup is gone.
  const focusAnchor = React.useRef(false);
  const Content = useSlot(View, content);

  React.useLayoutEffect(() => {
    if (committedGeneration.current !== generation || !presented) {
      ready.current = null;
      focused.current = null;
    }
    committedGeneration.current = generation;
    waiting.current.clear();
    if (presented) channel.activate(generation);
    else channel.cancel();
    return () => {
      clearTimeout(heldDismiss.current);
      heldDismiss.current = undefined;
      channel.cancel();
    };
  }, [channel, generation, presented]);

  React.useLayoutEffect(() => {
    if (presented || !focusAnchor.current) return;
    focusAnchor.current = false;
    resolveTarget(anchor.target).instance?.focus();
  }, [anchor, presented]);

  React.useImperativeHandle(ref, (): CalloutHandle => {
    const settled = (status: NativeOperationOutcome['status']) => Promise.resolve({ status });
    return {
      getPresentation: () => ready.current,
      requestFocus(expected, target, options) {
        if (!nativeRef.current) return settled('not-mounted');
        if (expected !== ready.current) return settled(ready.current ? 'stale' : 'not-ready');
        const current = focused.current?.generation === committedGeneration.current ? focused.current.tag : undefined;
        if (target === 'last' || (target === 'first' && initialFocus.current === 'none')) return settled('unsupported');
        if (target === 'first') {
          // Host initial focus precedes onShow, so a presentation without focused content has no eligible content.
          return settled(current !== undefined ? 'confirmed' : 'not-mounted');
        }
        const resolved = resolveTarget(target);
        const instance = resolved.instance;
        if (resolved.tag == null || !instance) return settled('not-mounted');
        if (resolved.tag === current) return settled('confirmed');
        const targetTag = resolved.tag;
        return channel.request(
          (_scope, id) => {
            const view = nativeRef.current;
            if (!view) throw new Error('Callout detached before focus dispatch.');
            waiting.current.set(id, targetTag);
            Commands.focusWindow(view);
            instance.focus();
          },
          options,
          resolved.isCurrent,
        );
      },
      close: () => settled('unsupported'),
      reposition: () => settled('unsupported'),
    };
  }, [channel]);

  return directComponent<Win32CalloutProps>((renderProps) => {
    if (!presented) return null;
    const merged = mergeProps(props, renderProps);
    const { placement, onReady, onDismissed, children, tabNavigation = 'cycle' } = merged;
    initialFocus.current = merged.initialFocus ?? 'first';
    // The host's layered window has no per-pixel transparency, so it draws the surface background and corner shape.
    const surface = StyleSheet.flatten([content?.style, renderProps.content?.style]) ?? {};
    const contentEvents: Win32ContentEvents = { ...content, ...renderProps.content };
    const isCurrent = () => generation === committedGeneration.current;
    const dismiss = (reason: CalloutDismissReason) => {
      if (!isCurrent() || dismissed.current === presentation) return;
      dismissed.current = presentation;
      ready.current = null;
      channel.cancel();
      setLifetime((current) => (current.presentation === presentation ? { ...current, closed: true } : current));
      onDismissed?.({ presentation, reason });
    };
    tabExit.current = (backward) => {
      if (!isCurrent() || dismissed.current === presentation) return;
      focusAnchor.current = tabNavigation === 'continue';
      dismiss(backward ? 'tab-backward' : 'tab-forward');
    };
    const exitsByTab = tabNavigation !== 'cycle';
    const runTabExit = outerTabExit ?? (exitsByTab ? ownTabExit : null);
    const contentProps: Win32ContentEvents = {
      keyDownEvents: runTabExit ? [...(contentEvents.keyDownEvents ?? []), ...tabKeys] : contentEvents.keyDownEvents,
      onFocus: (event) => {
        if (isCurrent()) {
          const focusedTag = event.nativeEvent.target;
          focused.current = { generation, tag: focusedTag };
          for (const [requestId, targetTag] of Array.from(waiting.current)) {
            if (targetTag !== focusedTag) continue;
            waiting.current.delete(requestId);
            channel.receive({ generation, requestId, status: 'confirmed' });
          }
        }
        contentEvents.onFocus?.(event);
        event.stopPropagation();
      },
      onBlur: (event) => {
        if (focused.current?.generation === generation && focused.current.tag === event.nativeEvent.target) {
          focused.current = null;
        }
        contentEvents.onBlur?.(event);
        event.stopPropagation();
      },
      onKeyDown: (event) => {
        contentEvents.onKeyDown?.(event);
        const { key, altKey, ctrlKey, metaKey, shiftKey } = event.nativeEvent;
        if (key === 'Escape') dismiss('escape');
        else if (key === 'Tab' && runTabExit && !altKey && !ctrlKey && !metaKey) runTabExit(shiftKey === true);
        event.stopPropagation();
      },
      onKeyUp: (event) => {
        contentEvents.onKeyUp?.(event);
        event.stopPropagation();
      },
    };

    return (
      <CalloutHost
        key={generation}
        ref={nativeRef}
        target={tag}
        directionalHint={directionalHint(placement)}
        // Current hosts ignore the gap and place the popup flush against the anchor.
        gapSpace={gapSpace(placement)}
        backgroundColor={surface.backgroundColor}
        borderRadius={surface.borderRadius}
        dismissBehaviors={dismissBehaviors}
        setInitialFocus={initialFocus.current !== 'none'}
        onShow={() => {
          if (!isCurrent() || ready.current || dismissed.current === presentation) return;
          ready.current = presentation;
          onReady?.({ presentation });
        }}
        onDismiss={() => {
          if (!isCurrent() || dismissed.current === presentation || heldDismiss.current) return;
          // The host light-dismisses on the activation change at pointer-down, before a press on the anchor reaches
          // JavaScript. Holding the report lets that press close the presentation instead of reopening it, as the
          // Windows anchor hold does natively; a caller close during the hold supersedes the dismissal.
          heldDismiss.current = setTimeout(() => {
            heldDismiss.current = undefined;
            dismiss('native-light-dismiss');
          }, lightDismissHoldMs);
        }}
        onRestoreFocus={keepFocus}
      >
        <Content {...renderProps.content} {...contentProps} collapsable={false}>
          <TabExitContext.Provider value={runTabExit}>{children}</TabExitContext.Provider>
        </Content>
      </CalloutHost>
    );
  });
});

Callout.displayName = 'Callout';
