/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { directComponent, phasedComponent, mergeProps } from '@fluentui-react-native/framework-base';

import { FocusZoneHost } from '../../internal/FocusZoneHost';
import { assertModernHost } from '../../internal/modernHost';
import type NativeFocusZone from '../../specs/components/FocusZoneNativeComponent';
import { FocusCommands as Commands } from '../../internal/focusZoneCommands';
import { allocateGeneration, createOperationChannel } from '../nativeOperation';
import { resolveTarget, useTargetTag } from '../nativeTarget';
import type { FocusZoneCommands, FocusZoneProps } from './FocusZone.types';

const tabModes = { exit: 'None', native: 'Normal', cycle: 'NavigateWrap', stop: 'NavigateStopAtEnds' } as const;

function FocusZoneImplementation(props: FocusZoneProps) {
  assertModernHost('FocusZone');
  const nativeRef = React.useRef<React.ComponentRef<typeof NativeFocusZone>>(null);
  const channel = React.useMemo(createOperationChannel, []);
  const generation = React.useMemo(allocateGeneration, []);
  const defaultTag = useTargetTag(props.defaultTarget);

  React.useLayoutEffect(() => {
    channel.activate(generation);
    return channel.cancel;
  }, [channel, generation]);

  React.useImperativeHandle(
    props.commandsRef,
    (): FocusZoneCommands => ({
      requestFocus(target = 'default', options) {
        if (!nativeRef.current) return Promise.resolve({ status: 'not-mounted' });
        if (props.disabled) return Promise.resolve({ status: 'not-focusable' });
        const resolved = typeof target === 'string' ? undefined : resolveTarget(target);
        if (resolved && resolved.tag == null) return Promise.resolve({ status: 'not-mounted' });
        const strategy = typeof target === 'string' ? target : 'target';
        return channel.request(
          (scope, requestId) => {
            const view = nativeRef.current;
            if (!view) throw new Error('FocusZone detached before command dispatch.');
            Commands.requestFocus(view, scope, requestId, resolved?.tag ?? 0, strategy);
          },
          options,
          resolved?.isCurrent,
        );
      },
    }),
    [channel, props.disabled],
  );

  {
    const {
      ref,
      commandsRef: _commands,
      defaultTarget: _target,
      direction = 'both',
      navigation = 'platform',
      arrowBoundary = 'stop',
      tabNavigation = 'exit',
      ...viewProps
    } = props;
    return (
      <FocusZoneHost
        {...viewProps}
        ref={ref}
        nativeRef={nativeRef}
        commandGeneration={generation}
        onOperationResult={(event) => channel.receive(event.nativeEvent)}
        nativeDefaultTarget={defaultTag}
        focusZoneDirection={direction === 'both' ? 'bidirectional' : direction}
        use2DNavigation={navigation === 'spatial'}
        navigateAtEnd={arrowBoundary === 'wrap' ? 'NavigateWrap' : 'NavigateStopAtEnds'}
        tabKeyNavigation={tabModes[tabNavigation]}
      />
    );
  }
}

export const FocusZone = phasedComponent<FocusZoneProps>((baseProps) =>
  directComponent<FocusZoneProps>((props) => <FocusZoneImplementation {...mergeProps(baseProps, props)} />),
);

FocusZone.displayName = 'FocusZone';
