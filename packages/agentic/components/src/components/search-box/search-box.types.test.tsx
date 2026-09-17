/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as React from 'react';
import { TextInput, View } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { IconElementProps } from '../../primitives/icon/icon.types';

import type { SearchBoxProps, SearchBoxSize, SearchBoxVariant, SearchBoxVisualState } from './search-box.types';

const CustomTextInput = directComponent<React.ComponentProps<typeof TextInput>>((props) => <TextInput {...props} />);
const CustomIcon = directComponent<IconElementProps>((props) => <View {...props} />);

const IconSlot: NonNullable<SearchBoxProps['icon']> = {
  imageSource: { uri: 'search.png' },
};

const ReplacedIconSlot: NonNullable<SearchBoxProps['icon']> = {
  as: CustomIcon,
  testID: 'replacement',
};

const TextInputSlot: NonNullable<SearchBoxProps['textInput']> = {
  as: CustomTextInput,
  placeholder: 'Search',
};

const ClearButtonSlot: NonNullable<SearchBoxProps['clearButton']> = {
  accessibilityLabel: 'Clear order search',
};

const RemovedSlots: SearchBoxProps = {
  clearButton: null,
  icon: null,
};

const Controlled: SearchBoxProps = {
  accessibilityLabel: 'Search files',
  onChangeText: (text: string) => text.length,
  onClear: () => undefined,
  onSearch: (value: string) => value.length,
  size: 'large' satisfies SearchBoxSize,
  value: 'query',
  variant: 'underline' satisfies SearchBoxVariant,
};

// @ts-expect-error SearchBox never resolves the error state.
const NoErrorState: SearchBoxVisualState = 'error';

// @ts-expect-error SearchBox does not expose an error prop, because a query is not saved data.
const NoErrorProp: SearchBoxProps = { error: true };

// @ts-expect-error icon slots still reject incompatible source combinations.
const InvalidIconSlot: SlotProp<typeof Icon> = {
  imageSource: { uri: 'icon.png' },
  svgSource: CustomIcon,
};

describe('SearchBox slot types', () => {
  it('accepts public slot replacements and slot props', () => {
    expect(IconSlot).toBeDefined();
    expect(ReplacedIconSlot).toBeDefined();
    expect(TextInputSlot).toBeDefined();
    expect(ClearButtonSlot).toBeDefined();
    expect(RemovedSlots).toBeDefined();
    expect(Controlled).toBeDefined();
  });
});
