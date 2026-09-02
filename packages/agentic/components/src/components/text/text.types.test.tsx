/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import type { Text as NativeText } from 'react-native';

import type { SlotProp } from '@fluentui-react-native/framework-base';

import { Text } from './text';
import type { TextProps } from './text.types';

const nativeRef = React.createRef<React.ComponentRef<typeof NativeText>>();
const textProps: TextProps = {
  children: 'Native props',
  ref: nativeRef,
  selectable: true,
  style: { fontSize: 18 },
};
const textSlot: SlotProp<typeof Text> = {
  children: 'Slot props',
  ref: nativeRef,
};

<Text {...textProps} />;
<Text {...textSlot} />;

describe('Text type coverage', () => {
  it('accepts native props, refs, and slot props', () => {
    expect(textProps).toBeDefined();
    expect(textSlot).toBeDefined();
  });
});
