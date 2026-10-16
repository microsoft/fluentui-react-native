/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { directComponent, mergeProps, phasedComponent, useSlot } from '@fluentui-react-native/framework-base';

import { assertModernHost } from '../../internal/modernHost';
import { FocusCommands } from '../../internal/focusZoneCommands';
import NativeFocusZone from '../../specs/components/FocusZoneNativeComponent';
import type { NativeOperationResult } from '../nativeOperation';
import { allocateGeneration, createOperationChannel } from '../nativeOperation';
import { resolveTarget, useTargetTag } from '../nativeTarget';
import type { FocusZoneCommands, FocusZoneHandle, FocusZoneProps } from './FocusZone.types';

const tabModes = { exit: 'None', native: 'Normal', cycle: 'NavigateWrap', stop: 'NavigateStopAtEnds' } as const;

/**
 * Unstyled native focus zone. The first phase owns the command channel, live default target, and `commandsRef`; when
 * FocusZone is used as a slot, supply `commandsRef` and `defaultTarget` through the slot props. The render phase merges
 * render-time navigation and view props and composes slot and render-time root refs.
 */
export const FocusZone = phasedComponent<FocusZoneProps>((props) => {
  assertModernHost('FocusZone');
  const { ref, commandsRef, defaultTarget } = props;
  const nativeRef = React.useRef<FocusZoneHandle>(null);
  const [channel] = React.useState(createOperationChannel);
  const [generation] = React.useState(allocateGeneration);
  const defaultTag = useTargetTag(defaultTarget);
  // The internal command ref is returned by the transform so the slot composes it with the slot and render-time refs.
  const Root = useSlot(NativeFocusZone, { ref }, { transform: (rootProps) => ({ ...rootProps, ref: nativeRef }) });

  React.useLayoutEffect(() => {
    channel.activate(generation);
    return channel.cancel;
  }, [channel, generation]);

  React.useImperativeHandle(
    commandsRef,
    (): FocusZoneCommands => ({
      requestFocus(target = 'default', options) {
        if (!nativeRef.current) return Promise.resolve({ status: 'not-mounted' });
        const resolved = typeof target === 'string' ? undefined : resolveTarget(target);
        if (resolved && resolved.tag == null) return Promise.resolve({ status: 'not-mounted' });
        const strategy = typeof target === 'string' ? target : 'target';
        return channel.request(
          (scope, requestId) => {
            const view = nativeRef.current;
            if (!view) throw new Error('FocusZone detached before command dispatch.');
            FocusCommands.requestFocus(view, scope, requestId, resolved?.tag ?? 0, strategy);
          },
          options,
          resolved?.isCurrent,
        );
      },
    }),
    [channel],
  );

  const onOperationResult = (event: NativeSyntheticEvent<NativeOperationResult>) => channel.receive(event.nativeEvent);

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

    return (
      <Root
        {...viewProps}
        {...(renderProps.ref && { ref: renderProps.ref })}
        commandGeneration={generation}
        onOperationResult={onOperationResult}
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
