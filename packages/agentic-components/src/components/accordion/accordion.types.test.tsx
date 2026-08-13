/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, View } from 'react-native';
import type { TextProps, ViewProps } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { AccordionProps } from './accordion.types';

const TitleReplacement = directComponent<TextProps>((props) => <Text {...props} />);
const BodyReplacement = directComponent<ViewProps>((props) => <View {...props} />);

const TitleSlot: SlotProp<typeof Text> = { as: TitleReplacement, children: 'Custom title' };
const BodySlot: SlotProp<typeof View> = { as: BodyReplacement, children: <Text>Body</Text> };

const AccordionPropsCheck: AccordionProps = {
  bodyContent: BodySlot,
  expanded: true,
  layout: 'chevronEnd',
  leadingIcon: { fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' } },
  title: TitleSlot,
};

describe('Accordion slot types', () => {
  it('accepts the public title and body slots', () => {
    expect(AccordionPropsCheck.layout).toBe('chevronEnd');
    expect(AccordionPropsCheck.expanded).toBe(true);
  });
});
