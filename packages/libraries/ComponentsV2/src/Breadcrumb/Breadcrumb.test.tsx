import { act } from 'react';
import { Pressable, Text, View } from 'react-native';

import * as renderer from 'react-test-renderer';

import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  isTruncatableBreadcrumbContent,
  partitionBreadcrumbItems,
  truncateBreadcrumbLongName,
} from './Breadcrumb';

describe('ComponentsV2 Breadcrumb', () => {
  it('provides breadcrumb and supported native item semantics', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbButton>Home</BreadcrumbButton>
          </BreadcrumbItem>
        </Breadcrumb>,
      );
    });

    const views = component!.root.findAllByType(View);
    expect(views[0].props.accessibilityLabel).toBe('breadcrumb');
    expect(views[0].props.accessibilityRole).toBe('list');
    expect(views[1].props.accessibilityRole).toBe('text');
  });

  it('inherits large sizing through context', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Breadcrumb size="large">
          <BreadcrumbItem>
            <BreadcrumbButton>Large</BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbDivider />
        </Breadcrumb>,
      );
    });

    const button = component!.root.findByType(Pressable);
    const text = component!.root.findByType(Text);
    expect(button.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ minHeight: 40 })]));
    expect(text.props.style.fontSize).toBe(16);
  });

  it('does not invoke current or disabled buttons', () => {
    const onPress = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Breadcrumb>
          <BreadcrumbButton current onPress={onPress}>
            Current
          </BreadcrumbButton>
        </Breadcrumb>,
      );
    });

    const button = component!.root.findByType(Pressable);
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true, selected: true }));
    expect(button.props['aria-current']).toBe('page');
    act(() => button.props.onPress?.({ nativeEvent: {} }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps the current item foreground distinct from disabled items', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Breadcrumb>
          <BreadcrumbButton current>Current</BreadcrumbButton>
          <BreadcrumbButton disabled>Disabled</BreadcrumbButton>
        </Breadcrumb>,
      );
    });

    const text = component!.root.findAllByType(Text);
    expect(text[0].props.style.color).not.toBe(text[1].props.style.color);
    expect(text[0].props.style.fontWeight).toBe('600');
  });

  it('keeps disabledFocusable buttons focusable without invoking them', () => {
    const onPress = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <BreadcrumbButton disabled disabledFocusable onPress={onPress}>
          Disabled
        </BreadcrumbButton>,
      );
    });

    const button = component!.root.findByType(Pressable);
    expect(button.props.focusable).toBe(true);
    expect(button.props.accessibilityState.disabled).toBe(true);
    act(() => button.props.onPress?.({ nativeEvent: {} }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('truncates visible string content and exposes the full value as a hint', () => {
    const name = 'This breadcrumb item has a deliberately long name';
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<BreadcrumbButton>{name}</BreadcrumbButton>);
    });

    const button = component!.root.findByType(Pressable);
    expect(button.props.accessibilityHint).toBe(name);
    expect(component!.root.findByType(Text).props.children).toBe('This breadcrumb item has a del...');
  });

  it('matches Fluent overflow partition defaults', () => {
    const result = partitionBreadcrumbItems({ items: [0, 1, 2, 3, 4, 5, 6, 7] });
    expect(result).toEqual({
      startDisplayedItems: [0],
      overflowItems: [1, 2],
      endDisplayedItems: [3, 4, 5, 6, 7],
    });
  });

  it('supports truncation helpers', () => {
    expect(isTruncatableBreadcrumbContent('1234', 3)).toBe(true);
    expect(truncateBreadcrumbLongName(' 1234 ', 3)).toBe('123...');
    expect(truncateBreadcrumbLongName('123', 3)).toBe('123');
  });
});
