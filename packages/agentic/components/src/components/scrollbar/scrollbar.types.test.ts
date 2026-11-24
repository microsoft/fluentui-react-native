import { createRef } from 'react';
import type { ScrollView } from 'react-native';
import type { ScrollbarProps } from '../../index';

describe('Scrollbar props', () => {
  it('only configures the native viewport, without a second writable value', () => {
    const ref = createRef<ScrollView>();
    const owner: ScrollbarProps = { scrollOwner: { testID: 'pane' }, ref, orientation: 'horizontal' };
    // @ts-expect-error There is no independent thumb value.
    const value: ScrollbarProps = { ...owner, value: 50 };
    // @ts-expect-error Owner properties cannot select a conflicting indicator axis.
    const axes: ScrollbarProps = { scrollOwner: { horizontal: true } };
    expect([owner, value, axes]).toHaveLength(3);
  });
});
