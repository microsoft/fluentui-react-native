/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as React from 'react';
import { View } from 'react-native';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { directComponent } from '@fluentui-react-native/framework-base';
import { TextInput } from 'react-native';

import type { Icon } from '../../primitives/icon/icon';
import type { IconElementProps } from '../../primitives/icon/icon.types';

import type { InputProps } from './input.types';

const CustomTextInput = directComponent<React.ComponentProps<typeof TextInput>>((props) => <TextInput {...props} />);
const CustomIcon = directComponent<IconElementProps>((props) => <View {...props} />);

const LeadingIconSlot: NonNullable<InputProps['iconStart']> = {
  imageSource: { uri: 'icon.png' },
};

const TrailingIcon1Slot: NonNullable<InputProps['iconEnd1']> = {
  fontSource: { codepoint: 0xe001, fontFamily: 'IconFont' },
};

const TrailingIcon2Slot: NonNullable<InputProps['iconEnd2']> = {
  as: CustomIcon,
  testID: 'replacement',
};

const TextInputSlot: NonNullable<InputProps['textInput']> = {
  as: CustomTextInput,
  placeholder: 'Search',
};

// @ts-expect-error icon slots still reject incompatible source combinations.
const InvalidIconSlot: SlotProp<typeof Icon> = {
  imageSource: { uri: 'icon.png' },
  svgSource: CustomIcon,
};

describe('Input slot types', () => {
  it('accepts public slot replacements and slot props', () => {
    expect(LeadingIconSlot).toBeDefined();
    expect(TrailingIcon1Slot).toBeDefined();
    expect(TrailingIcon2Slot).toBeDefined();
    expect(TextInputSlot).toBeDefined();
  });
});
