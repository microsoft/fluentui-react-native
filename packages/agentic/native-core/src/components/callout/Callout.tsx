/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { I18nManager, View } from 'react-native';
import { directComponent, mergeProps, phasedComponent, useSlot } from '@fluentui-react-native/framework-base';

import { CalloutHost } from '../../internal/CalloutHost';
import { assertModernHost } from '../../internal/modernHost';
import { Commands } from '../../specs/components/CalloutNativeComponent';
import type NativeCallout from '../../specs/components/CalloutNativeComponent';
import type { DirectionalHint } from '../../legacy/callout/Callout.types';
import { allocateGeneration, createOperationChannel } from '../nativeOperation';
import { resolveTarget, useTargetTag } from '../nativeTarget';
import type { CalloutAnchor, CalloutHandle, CalloutPresentation, CalloutProps, CalloutDismissReason } from './Callout.types';
import { presentationBrand } from './Callout.types';

class Presentation implements CalloutPresentation {
  readonly [presentationBrand] = true as const;
  readonly generation: number;
  constructor(generation: number) {
    this.generation = generation;
  }
}

interface Lifetime {
  open: boolean;
  key: string | undefined;
  presentation: Presentation;
  closed: boolean;
  anchored: boolean;
}

function hint(placement: CalloutProps['placement']): DirectionalHint {
  const side = placement?.side ?? 'bottom';
  const align = placement?.align ?? 'start';
  const rtl = I18nManager.isRTL;
  const physical = side === 'start' ? (rtl ? 'right' : 'left') : side === 'end' ? (rtl ? 'left' : 'right') : side;
  if (physical === 'left' || physical === 'right') {
    return `${physical}${align === 'center' ? 'Center' : align === 'end' ? 'BottomEdge' : 'TopEdge'}`;
  }
  const edge = align === 'center' ? 'Center' : (align === 'start') !== rtl ? 'LeftEdge' : 'RightEdge';
  return `${physical}${edge}`;
}

function gapSpace(placement: CalloutProps['placement']): number {
  const gap = placement?.gap ?? 0;
  if (!Number.isInteger(gap) || gap < 0) throw new RangeError('Callout gap must be a nonnegative integer in logical units.');
  return gap;
}

function rectangle(anchor: CalloutAnchor) {
  if (anchor.kind === 'view') return undefined;
  const rect = anchor.kind === 'rect' ? anchor.rect : { ...anchor.point, width: 0, height: 0 };
  if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.width < 0 || rect.height < 0) {
    throw new RangeError('Callout anchor geometry must contain finite coordinates and nonnegative dimensions.');
  }
  return { screenX: rect.x, screenY: rect.y, width: rect.width, height: rect.height };
}

const reasons: readonly string[] = ['native-light-dismiss', 'programmatic', 'anchor-lost', 'host-detached'];
function isReason(value: string): value is CalloutDismissReason {
  return reasons.includes(value);
}

/**
 * Unstyled native popup. The first phase owns the presentation lifetime, anchor subscription, command channel, and
 * presentation handle; when Callout is used as a slot, supply `ref`, `open`, `presentationKey`, and `anchor` through the
 * slot props. The render phase merges render-time placement, callbacks, content props, and children.
 */
export const Callout = phasedComponent<CalloutProps>((props) => {
  assertModernHost('Callout');
  const { ref, open, presentationKey, anchor, content } = props;
  const tag = useTargetTag(anchor.kind === 'view' ? anchor.target : anchor.relativeTo);
  const anchorRect = rectangle(anchor);
  const nativeRef = React.useRef<React.ComponentRef<typeof NativeCallout>>(null);
  const [channel] = React.useState(createOperationChannel);
  const [lifetime, setLifetime] = React.useState<Lifetime>(() => ({
    open,
    key: presentationKey,
    presentation: new Presentation(allocateGeneration()),
    closed: false,
    anchored: false,
  }));
  // Derive the presentation lifetime during render so a rearm and its new generation commit together.
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
  const Content = useSlot(View, content);

  React.useLayoutEffect(() => {
    if (committedGeneration.current !== generation || !presented) ready.current = null;
    committedGeneration.current = generation;
    if (presented) channel.activate(generation);
    else channel.cancel();
    return channel.cancel;
  }, [channel, generation, presented]);

  React.useImperativeHandle(ref, (): CalloutHandle => {
    const request = (
      expected: CalloutPresentation,
      dispatch: (view: React.ComponentRef<typeof NativeCallout>, scope: number, id: number) => void,
      options?: Parameters<CalloutHandle['close']>[1],
      current?: () => boolean,
    ) => {
      if (!nativeRef.current) return Promise.resolve({ status: 'not-mounted' as const });
      if (expected !== ready.current) return Promise.resolve({ status: ready.current ? ('stale' as const) : ('not-ready' as const) });
      return channel.request(
        (scope, id) => {
          const view = nativeRef.current;
          if (!view) throw new Error('Callout detached before command dispatch.');
          dispatch(view, scope, id);
        },
        options,
        current,
      );
    };
    return {
      getPresentation: () => ready.current,
      requestFocus(expected, target, options) {
        const resolved = resolveTarget(target);
        if (resolved.tag == null) return Promise.resolve({ status: 'not-mounted' });
        return request(expected, (view, scope, id) => Commands.requestFocus(view, scope, id, resolved.tag), options, resolved.isCurrent);
      },
      close: (expected, options) => request(expected, (view, scope, id) => Commands.close(view, scope, id), options),
      reposition: (expected, options) => request(expected, (view, scope, id) => Commands.reposition(view, scope, id), options),
    };
  }, [channel]);

  return directComponent<CalloutProps>((renderProps) => {
    if (!presented) return null;
    const { placement, onReady, onDismissed, children } = mergeProps(props, renderProps);
    const isCurrent = (eventGeneration: number) => eventGeneration === generation && eventGeneration === committedGeneration.current;

    return (
      <CalloutHost
        key={generation}
        ref={nativeRef}
        target={tag}
        commandGeneration={generation}
        anchorMode={anchor.kind}
        anchorRect={anchorRect}
        directionalHint={hint(placement)}
        gapSpace={gapSpace(placement)}
        onReady={(event) => {
          if (!isCurrent(event.nativeEvent.generation) || ready.current) return;
          ready.current = presentation;
          onReady?.({ presentation });
        }}
        onClosed={(event) => {
          if (!isCurrent(event.nativeEvent.generation)) return;
          if (!isReason(event.nativeEvent.reason)) throw new Error('Callout received an invalid native dismissal reason.');
          ready.current = null;
          channel.cancel();
          setLifetime((current) => (current.presentation === presentation ? { ...current, closed: true } : current));
          onDismissed?.({ presentation, reason: event.nativeEvent.reason });
        }}
        onOperationResult={(event) => channel.receive(event.nativeEvent)}
      >
        <Content {...renderProps.content} collapsable={false}>
          {children}
        </Content>
      </CalloutHost>
    );
  });
});

Callout.displayName = 'Callout';
