/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { directComponent } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { Text, View } from 'react-native';

import type { DividerProps } from './divider.types';
import { Divider } from './divider';
import type { Icon } from '../../primitives/icon/icon';
import type { IconElementProps } from '../../primitives/icon/icon.types';

const SectionLabelSlot: SlotProp<typeof Text> = 'Section';
const PlainLabelSlot: SlotProp<typeof Text> = { children: 'Overview' };

const DividerIcon = directComponent<IconElementProps>((props) => React.createElement(View, props));
const DividerIconSlot: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, height: 20, width: 20 };
const DividerIconReplacement: SlotProp<typeof Icon> = { as: DividerIcon, height: 20, width: 20 };

const DividerPropsValue: DividerProps = {
  icon: DividerIconSlot,
  label: SectionLabelSlot,
  layout: 'start',
};

const DividerPlainProps: DividerProps = {
  icon: null,
  label: null,
  vertical: true,
};

const DividerSlot: SlotProp<typeof Divider> = {
  label: 'Section',
  layout: 'center',
};

describe('Divider types', () => {
  it('accepts label, icon, and visibility control slot props', () => {
    expect(SectionLabelSlot).toBeDefined();
    expect(PlainLabelSlot).toBeDefined();
    expect(DividerIconSlot).toBeDefined();
    expect(DividerIconReplacement).toBeDefined();
    expect(DividerPropsValue).toBeDefined();
    expect(DividerPlainProps).toBeDefined();
    expect(DividerSlot).toBeDefined();
  });
});
