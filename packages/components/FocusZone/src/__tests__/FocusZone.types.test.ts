/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import type { View } from 'react-native';

import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { FocusZone } from '../FocusZone';
import type { FocusZoneProps, NativeProps } from '../FocusZone.types';

const componentRef = React.createRef<View>();
const defaultTabbableElement = React.createRef<React.Component>();

const props: FocusZoneProps = {
  accessibilityLabel: 'Formatting tools',
  componentRef,
  defaultTabbableElement,
  focusZoneDirection: 'horizontal',
  isCircularNavigation: true,
};

const focusZoneSlot: SlotProp<typeof FocusZone> = props;
const nativeProps: NativeProps = {
  defaultTabbableElement: 42,
  focusZoneDirection: 'vertical',
  navigateAtEnd: 'NavigateWrap',
};

// @ts-expect-error FocusZone direction must be one of the supported navigation axes.
const invalidDirection: FocusZoneProps = { focusZoneDirection: 'diagonal' };

describe('FocusZone types', () => {
  it('accepts public props as a slot contract', () => {
    expect(focusZoneSlot).toBeDefined();
    expect(nativeProps).toBeDefined();
  });
});
