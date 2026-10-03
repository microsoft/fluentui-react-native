/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { I18nManager, View } from 'react-native';
import { directComponent, phasedComponent, useSlot, mergeProps } from '@fluentui-react-native/framework-base';

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
  private readonly generation: number;
  constructor(generation: number) {
    this.generation = generation;
  }
  matches(generation: number) {
    return this.generation === generation;
  }
}

function hint(props: CalloutProps): DirectionalHint {
  const side = props.placement?.side ?? 'bottom';
  const align = props.placement?.align ?? 'start';
  const rtl = I18nManager.isRTL;
  const physical = side === 'start' ? (rtl ? 'right' : 'left') : side === 'end' ? (rtl ? 'left' : 'right') : side;
  if (physical === 'left' || physical === 'right') {
    return `${physical}${align === 'center' ? 'Center' : align === 'end' ? 'BottomEdge' : 'TopEdge'}`;
  }
  const edge = align === 'center' ? 'Center' : (align === 'start') !== rtl ? 'LeftEdge' : 'RightEdge';
  return `${physical}${edge}`;
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

function CalloutImplementation(props: CalloutProps) {
  assertModernHost('Callout');
  const target = props.anchor.kind === 'view' ? props.anchor.target : props.anchor.relativeTo;
  const tag = useTargetTag(target);
  const nativeRef = React.useRef<React.ComponentRef<typeof NativeCallout>>(null);
  const channel = React.useMemo(createOperationChannel, []);
  const [lifetime, setLifetime] = React.useState(() => ({
    open: props.open,
    key: props.presentationKey,
    generation: allocateGeneration(),
    closed: false,
    anchored: false,
  }));
  if (lifetime.open !== props.open || lifetime.key !== props.presentationKey) {
    const rearm = (!lifetime.open && props.open) || lifetime.key !== props.presentationKey;
    setLifetime({
      open: props.open,
      key: props.presentationKey,
      generation: rearm ? allocateGeneration() : lifetime.generation,
      closed: rearm ? false : lifetime.closed,
      anchored: rearm ? tag !== undefined : lifetime.anchored,
    });
  } else if (props.open && !lifetime.closed) {
    if (tag !== undefined && !lifetime.anchored) setLifetime({ ...lifetime, anchored: true });
    else if (tag === undefined && lifetime.anchored) setLifetime({ ...lifetime, closed: true });
  }
  const { generation, closed } = lifetime;
  const presentation = React.useMemo(() => new Presentation(generation), [generation]);
  const committedGeneration = React.useRef(generation);
  const ready = React.useRef<CalloutPresentation | null>(null);
  const Content = useSlot(View, { collapsable: false });

  React.useLayoutEffect(() => {
    if (committedGeneration.current !== generation || !props.open || closed || tag === undefined) ready.current = null;
    committedGeneration.current = generation;
    if (props.open && !closed && tag !== undefined) channel.activate(generation);
    else channel.cancel();
    return channel.cancel;
  }, [channel, generation, props.open, closed, tag]);

  React.useImperativeHandle(
    props.ref,
    (): CalloutHandle => {
      const request = (
        expected: CalloutPresentation,
        dispatch: (scope: number, id: number) => void,
        options?: Parameters<CalloutHandle['close']>[1],
        current?: () => boolean,
      ) => {
        if (!nativeRef.current) return Promise.resolve({ status: 'not-mounted' as const });
        if (expected !== ready.current) return Promise.resolve({ status: ready.current ? ('stale' as const) : ('not-ready' as const) });
        return channel.request(dispatch, options, current);
      };
      return {
        getPresentation: () => ready.current,
        requestFocus(expected, target, options) {
          const resolved = resolveTarget(target);
          if (resolved.tag == null) return Promise.resolve({ status: 'not-mounted' });
          return request(
            expected,
            (scope, id) => {
              if (!nativeRef.current) throw new Error('Callout detached before focus dispatch.');
              Commands.requestFocus(nativeRef.current, scope, id, resolved.tag);
            },
            options,
            resolved.isCurrent,
          );
        },
        close: (expected, options) =>
          request(
            expected,
            (scope, id) => {
              if (!nativeRef.current) throw new Error('Callout detached before close dispatch.');
              Commands.close(nativeRef.current, scope, id);
            },
            options,
          ),
        reposition: (expected, options) =>
          request(
            expected,
            (scope, id) => {
              if (!nativeRef.current) throw new Error('Callout detached before reposition dispatch.');
              Commands.reposition(nativeRef.current, scope, id);
            },
            options,
          ),
      };
    },
    [channel],
  );

  const gap = props.placement?.gap ?? 0;
  if (!Number.isInteger(gap) || gap < 0) throw new RangeError('Callout gap must be a nonnegative integer in logical units.');
  const rect = rectangle(props.anchor);

  {
    const renderProps = props;
    if (!renderProps.open || closed || tag === undefined) return null;
    return (
      <CalloutHost
        key={generation}
        nativeRef={nativeRef}
        nativeTarget={tag}
        commandGeneration={generation}
        anchorMode={renderProps.anchor.kind}
        anchorRect={rect}
        directionalHint={hint(renderProps)}
        gapSpace={gap}
        onReady={(event) => {
          if (
            event.nativeEvent.generation !== committedGeneration.current ||
            !presentation.matches(event.nativeEvent.generation) ||
            ready.current
          )
            return;
          ready.current = presentation;
          renderProps.onReady?.({ presentation });
        }}
        onClosed={(event) => {
          if (event.nativeEvent.generation !== committedGeneration.current || !presentation.matches(event.nativeEvent.generation)) return;
          if (!isReason(event.nativeEvent.reason)) throw new Error('Callout received an invalid native dismissal reason.');
          ready.current = null;
          channel.cancel();
          setLifetime((current) => (current.generation === event.nativeEvent.generation ? { ...current, closed: true } : current));
          renderProps.onDismissed?.({ presentation, reason: event.nativeEvent.reason });
        }}
        onOperationResult={(event) => channel.receive(event.nativeEvent)}
      >
        <Content {...renderProps.content} collapsable={false}>
          {renderProps.children}
        </Content>
      </CalloutHost>
    );
  }
}

export const Callout = phasedComponent<CalloutProps>((baseProps) =>
  directComponent<CalloutProps>((props) => <CalloutImplementation {...mergeProps(baseProps, props)} />),
);

Callout.displayName = 'Callout';
