/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';

import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Callout } from '../Callout';
import type {
  CalloutCloseOutcome,
  CalloutFocusOutcome,
  CalloutHandle,
  CalloutProps,
  ICalloutProps,
  CalloutCloseReason,
  CalloutFocusIntent,
  CalloutMenuPointerMoveEvent,
} from '../Callout.types';

const componentRef = React.createRef<CalloutHandle>();
const target = React.createRef<React.Component>();

const props: CalloutProps = {
  accessibilityLabel: 'Formatting options',
  componentRef,
  directionalHint: 'bottomCenter',
  target,
};

const calloutSlot: SlotProp<typeof Callout> = props;
const legacyProps: ICalloutProps = props;
const legacyHandle: CalloutHandle = { focusWindow: () => undefined, blurWindow: () => undefined };
const managedProps: CalloutProps = {
  ...props,
  menuFocusManagement: true,
  onReady: (event) => {
    const generation: string = event.nativeEvent.generation;
    const focus: Promise<CalloutFocusOutcome> | undefined = componentRef.current?.focusInitialChild?.(generation, target);
    const close: Promise<CalloutCloseOutcome> | undefined = componentRef.current?.closeOwned?.(generation, 'action', true);
    const intent: CalloutFocusIntent = 'repair';
    const back: CalloutCloseReason = 'submenu-back';
    const repair: Promise<CalloutFocusOutcome> | undefined = componentRef.current?.focusOwnedChild?.(generation, target, intent);
    const childClose: Promise<CalloutCloseOutcome> | undefined = componentRef.current?.closeOwned?.(generation, back, true);
    void [focus, close, repair, childClose];
  },
  onMenuPointerMove: (event: CalloutMenuPointerMoveEvent) => {
    const point: [string, number, number, number] = [
      event.nativeEvent.pointerId,
      event.nativeEvent.screenX,
      event.nativeEvent.screenY,
      event.nativeEvent.targetTag,
    ];
    void point;
  },
};

// @ts-expect-error Callout targets must be a ref or registered native anchor identifier.
const invalidTarget: CalloutProps = { target: 42 };
// @ts-expect-error Selected native targets are live refs, not renderer tags.
const invalidFocusTarget = legacyHandle.focusInitialChild?.('generation', 42);
// @ts-expect-error Native Escape ownership is not a synthetic JS close reason.
const invalidClose = legacyHandle.closeOwned?.('generation', 'escape', true);
// @ts-expect-error Tab is owned natively, not a JavaScript close-and-continue command.
const invalidTabClose = legacyHandle.closeOwned?.('generation', 'tab', false);
// @ts-expect-error The native owned-child command never accepts an arbitrary renderer tag.
const invalidOwnedTarget = legacyHandle.focusOwnedChild?.('generation', 42, 'repair');
// @ts-expect-error Initial focus is not a current-popup repair intent.
const invalidIntent = legacyHandle.focusOwnedChild?.('generation', target, 'initial');
// @ts-expect-error Current-event hit identity is a numeric native tag, not a row ID.
const invalidHitTag: CalloutMenuPointerMoveEvent['nativeEvent']['targetTag'] = 'row-id';
// @ts-expect-error Movement cannot omit the current-event native hit-target fact.
const missingHitTarget: CalloutMenuPointerMoveEvent['nativeEvent'] = { generation: 'one', pointerId: 'mouse', screenX: 0, screenY: 0 };

describe('Callout types', () => {
  it('accepts public props as a slot contract', () => {
    expect(calloutSlot).toBeDefined();
    expect(legacyProps).toBeDefined();
    expect(managedProps.menuFocusManagement).toBe(true);
    expect([
      invalidTarget,
      invalidFocusTarget,
      invalidClose,
      invalidTabClose,
      invalidOwnedTarget,
      invalidIntent,
      invalidHitTag,
      missingHitTarget,
    ]).toHaveLength(8);
  });
});
