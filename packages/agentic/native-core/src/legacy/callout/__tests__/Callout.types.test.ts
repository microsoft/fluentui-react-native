/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';

import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Callout } from '../Callout';
import type { CalloutHandle, CalloutProps, ICalloutProps } from '../Callout.types';

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

// @ts-expect-error Callout targets must be a ref or registered native anchor identifier.
const invalidTarget: CalloutProps = { target: 42 };

describe('Callout types', () => {
  it('accepts public props as a slot contract', () => {
    expect(calloutSlot).toBeDefined();
    expect(legacyProps).toBeDefined();
  });
});
