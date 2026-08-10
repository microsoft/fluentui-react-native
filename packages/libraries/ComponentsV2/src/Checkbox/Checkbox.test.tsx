import { act } from 'react';
import { Pressable } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Checkbox } from './Checkbox';

describe('ComponentsV2 Checkbox', () => {
  it('uses unchecked checkbox accessibility defaults', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Checkbox label="Checkbox" />);
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityLabel).toBe('Checkbox');
    expect(root.props.accessibilityRole).toBe('checkbox');
    expect(root.props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
    expect(root.props['aria-required']).toBe(false);
  });

  it('updates uncontrolled state and returns web-compatible change data', () => {
    const onChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Checkbox label="Checkbox" onChange={onChange} />);
    });

    const root = component!.root.findByType(Pressable);
    act(() => root.props.onPress({ nativeEvent: {} }));

    expect(component!.root.findByType(Pressable).props.accessibilityState.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), { checked: true });
  });

  it('moves from mixed to checked when activated', () => {
    const onChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Checkbox defaultChecked="mixed" label="All options" onChange={onChange} />);
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityState.checked).toBe('mixed');
    act(() => root.props.onPress({ nativeEvent: {} }));

    expect(component!.root.findByType(Pressable).props.accessibilityState.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), { checked: true });
  });

  it('does not change or invoke onChange while disabled', () => {
    const onChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Checkbox checked disabled label="Disabled" onChange={onChange} />);
    });

    const root = component!.root.findByType(Pressable);
    act(() => root.props.onPress?.({ nativeEvent: {} }));

    expect(root.props.accessibilityState.checked).toBe(true);
    expect(root.props.focusable).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('exposes required and mixed accessibility state', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Checkbox checked="mixed" label="Required" required />);
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityState).toEqual({
      checked: 'mixed',
      disabled: false,
    });
    expect(root.props['aria-required']).toBe(true);
  });
});
