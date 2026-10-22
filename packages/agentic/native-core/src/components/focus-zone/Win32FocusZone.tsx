/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { NativeSyntheticEvent, TargetedEvent } from 'react-native';
import { directComponent, mergeProps, phasedComponent, useSlot } from '@fluentui-react-native/framework-base';

import { assertWin32Host } from '../../internal/modernHost';
import NativeFocusZone from '../../specs/components/FocusZoneNativeComponent';
import { allocateGeneration, createOperationChannel } from '../nativeOperation';
import type { NativeOperationOutcome } from '../nativeOperation';
import { resolveTarget, useTargetTag } from '../nativeTarget';
import type { FocusZoneCommands, FocusZoneHandle, FocusZoneProps } from './FocusZone.types';

type FocusEvent = NativeSyntheticEvent<TargetedEvent>;
/** Win32 focus and blur events bubble from the zone's descendants. */
interface Win32FocusEvents {
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

const tabModes = { exit: 'None', native: 'Normal', cycle: 'NavigateWrap', stop: 'NavigateStopAtEnds' } as const;
// A default request without a default target is confirmed by focus on any descendant.
const anyDescendant = 0;

/**
 * Office Win32 adapter for the modern FocusZone contract over the host's own `RCTFocusZone` registration, which accepts
 * no modern commands. Navigation props map to the host's legacy props. `requestFocus` focuses an explicit target or the
 * default target, or for `default` without one asks the host zone to focus its default element, and confirms the
 * request from the focus event that bubbles to the zone. The host cannot search for the first or last element, so those
 * requests are unsupported; callers fall back to focusing an explicit target.
 */
export const FocusZone = phasedComponent<FocusZoneProps>((props) => {
  assertWin32Host('FocusZone', 'RCTFocusZone');
  const { ref, commandsRef, defaultTarget } = props;
  const nativeRef = React.useRef<FocusZoneHandle>(null);
  const [channel] = React.useState(createOperationChannel);
  const [generation] = React.useState(allocateGeneration);
  const defaultTag = useTargetTag(defaultTarget);
  const latestDefault = React.useRef(defaultTarget);
  latestDefault.current = defaultTarget;
  // The descendant that holds focus, from bubbled focus events.
  const focused = React.useRef<number | null>(null);
  // Focus requests awaiting a focus event on their target tag, keyed by operation request ID.
  const waiting = React.useRef(new Map<number, number>());
  const Root = useSlot(NativeFocusZone, { ref }, { transform: (rootProps) => ({ ...rootProps, ref: nativeRef }) });

  React.useLayoutEffect(() => {
    const pending = waiting.current;
    channel.activate(generation);
    return () => {
      pending.clear();
      channel.cancel();
    };
  }, [channel, generation]);

  React.useImperativeHandle(
    commandsRef,
    (): FocusZoneCommands => ({
      requestFocus(target = 'default', options) {
        const settled = (status: NativeOperationOutcome['status']) => Promise.resolve({ status });
        const zone = nativeRef.current;
        if (!zone) return settled('not-mounted');
        if (target === 'first' || target === 'last') return settled('unsupported');
        const explicit = target === 'default' ? latestDefault.current : target;
        let expected = anyDescendant;
        let focus: () => void = () => zone.focus();
        let isCurrent: (() => boolean) | undefined;
        if (explicit) {
          const resolved = resolveTarget(explicit);
          const instance = resolved.instance;
          if (resolved.tag == null || !instance) return settled('not-mounted');
          expected = resolved.tag;
          focus = () => instance.focus();
          isCurrent = resolved.isCurrent;
        }
        if (focused.current !== null && (expected === anyDescendant || expected === focused.current)) return settled('confirmed');
        let requestId: number | undefined;
        return channel
          .request(
            (_scope, id) => {
              if (!nativeRef.current) throw new Error('FocusZone detached before focus dispatch.');
              requestId = id;
              waiting.current.set(id, expected);
              focus();
            },
            options,
            isCurrent,
          )
          .then((outcome) => {
            if (requestId !== undefined) waiting.current.delete(requestId);
            return outcome;
          });
      },
    }),
    [channel],
  );

  return directComponent<FocusZoneProps>((renderProps) => {
    const {
      ref: _ref,
      commandsRef: _commandsRef,
      defaultTarget: _defaultTarget,
      direction = 'both',
      navigation = 'platform',
      arrowBoundary = 'stop',
      tabNavigation = 'exit',
      ...viewProps
    } = mergeProps(props, renderProps);
    const events: Win32FocusEvents = viewProps;
    const focusEvents: Win32FocusEvents = {
      onFocus: (event) => {
        const tag = event.nativeEvent.target;
        focused.current = tag;
        for (const [requestId, expected] of Array.from(waiting.current)) {
          if (expected !== anyDescendant && expected !== tag) continue;
          waiting.current.delete(requestId);
          channel.receive({ generation, requestId, status: 'confirmed' });
        }
        events.onFocus?.(event);
      },
      onBlur: (event) => {
        if (focused.current === event.nativeEvent.target) focused.current = null;
        events.onBlur?.(event);
      },
    };

    return (
      <Root
        {...viewProps}
        {...focusEvents}
        {...(renderProps.ref && { ref: renderProps.ref })}
        defaultTabbableElement={defaultTag}
        focusZoneDirection={direction === 'both' ? 'bidirectional' : direction}
        use2DNavigation={navigation === 'spatial'}
        navigateAtEnd={arrowBoundary === 'wrap' ? 'NavigateWrap' : 'NavigateStopAtEnds'}
        tabKeyNavigation={tabModes[tabNavigation]}
      />
    );
  });
});

FocusZone.displayName = 'FocusZone';
