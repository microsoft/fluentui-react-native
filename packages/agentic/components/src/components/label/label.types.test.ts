import * as React from 'react';
import { Text as NativeText } from 'react-native';
import type { View } from 'react-native';

import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Label } from './label';
import type { LabelProps, LabelSize, LabelSlots, LabelState, LabelWeight } from './label.types';
import type { TextProps } from '../text/text.types';

function ReplacementText(props: TextProps) {
  return React.createElement(NativeText, props);
}

const rootRef = React.createRef<React.ComponentRef<typeof View>>();
const contentRef = React.createRef<React.ComponentRef<typeof NativeText>>();
const props: LabelProps = {
  content: { children: 0, ref: contentRef, allowFontScaling: true, style: { color: '#123456' } },
  requiredIndicator: { children: '*', ref: contentRef },
  ref: rootRef,
  required: true,
  disabled: true,
  size: 'large',
  weight: 'strong',
  nativeID: 'native-label',
  'aria-label': 'Zero',
  style: { width: 180 },
};
const legend: LabelProps = { content: 'Question', accessible: false, size: 'medium', weight: 'strong' };
const numeric: LabelProps = { content: 0, requiredIndicator: null };
const slot: SlotProp<typeof Label> = props;
const replacement: LabelProps = {
  content: { as: ReplacementText, children: 'Replacement', ref: contentRef },
  requiredIndicator: { as: ReplacementText, ref: contentRef },
};
const sizes: LabelSize[] = ['small', 'medium', 'large'];
const weights: LabelWeight[] = ['regular', 'strong'];
const rootType: LabelSlots['root'] | undefined = undefined;
const state: LabelState | undefined = undefined;

// @ts-expect-error Invalid finite size.
const invalidSize: LabelSize = 'tiny';
// @ts-expect-error Invalid finite weight.
const invalidWeight: LabelWeight = 'bold';

type Equal<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
type RootRefMatchesView = Assert<Equal<LabelProps['ref'], React.ComponentPropsWithRef<typeof View>['ref']>>;
type ContentRefMatchesText = Assert<Equal<React.ComponentRef<LabelSlots['content']>, React.ComponentRef<typeof NativeText>>>;
type OwnedKeys =
  | 'children'
  | 'accessibilityRole'
  | 'role'
  | 'focusable'
  | 'tabIndex'
  | 'onPress'
  | 'defaultRequired'
  | 'htmlFor'
  | 'componentRef';
const nativeRefs: [RootRefMatchesView, ContentRefMatchesText] = [true, true];
const ownedKeysExcluded: Assert<Equal<Extract<keyof LabelProps, OwnedKeys>, never>> = true;

describe('Label types', () => {
  it('accepts scalar/slot content, native refs, visual legends, and the finite axes', () => {
    expect(props).toBeDefined();
    expect(slot).toBe(props);
    expect(legend).toBeDefined();
    expect(replacement).toBeDefined();
    expect(numeric.content).toBe(0);
    expect(sizes).toHaveLength(3);
    expect(weights).toHaveLength(2);
    expect(rootType).toBeUndefined();
    expect(state).toBeUndefined();
    expect(nativeRefs).toEqual([true, true]);
    expect(ownedKeysExcluded).toBe(true);
    expect([invalidSize, invalidWeight]).toHaveLength(2);
  });
});
