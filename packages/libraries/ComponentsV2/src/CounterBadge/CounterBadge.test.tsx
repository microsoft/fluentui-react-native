import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { CounterBadge, getCounterBadgeContent } from './CounterBadge';

describe('ComponentsV2 CounterBadge', () => {
  it('is hidden for zero by default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge count={0} testID="counter" />);
    });
    expect(component!.toJSON()).toBeNull();
  });

  it('shows zero when requested', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge count={0} showZero testID="counter" />);
    });
    expect(component!.root.findByProps({ testID: 'counter-text' }).props.children).toBe('0');
  });

  it('formats overflow and preserves custom content', () => {
    expect(getCounterBadgeContent(100, 99, undefined)).toBe('99+');
    expect(getCounterBadgeContent(100, 99, 'Custom')).toBe('Custom');
    expect(getCounterBadgeContent(-1, 99, undefined)).toBe('-1');
  });

  it('renders dot mode as a six-pixel badge without text', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge count={42} dot size="extra-large" testID="counter" />);
    });

    expect(component!.root.findByProps({ testID: 'counter' }).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 6, minWidth: 6, paddingHorizontal: 0 })]),
    );
    expect(component!.root.findAllByProps({ testID: 'counter-text' })).toHaveLength(0);
  });

  it('allows custom children to keep a zero-count badge visible', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge count={0}>New</CounterBadge>);
    });
    expect(component!.toJSON()).not.toBeNull();
  });
});
