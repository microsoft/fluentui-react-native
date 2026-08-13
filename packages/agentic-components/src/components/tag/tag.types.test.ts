/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { directComponent } from '@fluentui-react-native/framework-base';
import { View } from 'react-native';

import type { IconElementProps } from '../../primitives/icon/icon.types';
import { Icon } from '../../primitives/icon/icon';
import { Tag } from './tag';
import type { TagProps } from './tag.types';

const LeadingIcon: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } };
const DismissIcon: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' } };
const Replacement = directComponent<IconElementProps>((props) => React.createElement(View, props));

const TagSlot: SlotProp<typeof Tag> = {
  accessibilityLabel: 'Remove Engineering filter',
  content: 'Engineering',
  dismissIcon: { as: Replacement, fontSource: { codepoint: 0x2715, fontFamily: 'Arial' } },
  leadingIcon: LeadingIcon,
  onPress: () => undefined,
};

const TagPropsAcceptance: TagProps = {
  accessibilityLabel: 'Remove Engineering filter',
  content: 'Engineering',
  dismissIcon: DismissIcon,
  leadingIcon: LeadingIcon,
  onPress: () => undefined,
};

describe('Tag types', () => {
  it('accepts slot props for the icon and dismiss branches', () => {
    expect(TagSlot).toBeDefined();
    expect(TagPropsAcceptance).toBeDefined();
  });
});
