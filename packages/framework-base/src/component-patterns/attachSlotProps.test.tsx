/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, StyleSheet } from 'react-native';
import type { TextProps } from 'react-native';
import * as renderer from 'react-test-renderer';
import { act } from 'react';

import { attachSlotProps } from './slot';
import { useOptionalSlot } from './useSlot';

describe('attachSlotProps', () => {
  it('styles an optional component without rendering it or resupplying its required props', async () => {
    const rendered = jest.fn();
    function RequiredContent({ name, style }: { name: string; style?: TextProps['style'] }) {
      rendered();
      return <Text style={style}>{name}</Text>;
    }
    function Composition() {
      const Content = useOptionalSlot(RequiredContent, { name: 'Content' });
      if (!Content) throw new Error('Expected the provided optional slot.');
      expect(rendered).not.toHaveBeenCalled();
      attachSlotProps(Content, { style: { color: 'red' } });
      return <Content />;
    }
    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(<Composition />);
    });
    expect(rendered).toHaveBeenCalledTimes(1);
    expect(component!.root.findByType(Text).props.children).toBe('Content');
    expect(StyleSheet.flatten(component!.root.findByType(Text).props.style)).toEqual({ color: 'red' });
    await act(async () => component!.unmount());
  });
});
