/** @jsxImportSource @fluentui-react-native/framework-base */
import { Image, StyleSheet, Text } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';

import { act, create } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';

import { Button } from './button';

function renderButton(props: React.ComponentProps<typeof Button>): ReactTestRenderer {
  let component: ReactTestRenderer;
  act(() => {
    component = create(<Button {...props} />);
  });
  return component!;
}

function getRoot(component: ReactTestRenderer): ReactTestInstance {
  return component.root.findByProps({ accessibilityRole: 'button' });
}

function getRootStyle(component: ReactTestRenderer): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('Button', () => {
  it('renders content with default button accessibility and secondary styling', () => {
    const component = renderButton({ content: 'Save' });
    const root = getRoot(component);

    expect(root.props.accessibilityRole).toBe('button');
    expect(root.props.accessibilityState).toEqual({ disabled: false });
    expect(root.props.focusable).toBe(true);
    expect(component.root.findByType(Text).props.children).toBe('Save');
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: '#00000000',
      minHeight: 24,
      minWidth: 24,
    });
  });

  it('forwards press and interaction handlers while updating visual state', () => {
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = renderButton({ content: 'Save', onHoverIn, onPress });
    const root = getRoot(component);
    const restBackground = getRootStyle(component).backgroundColor;

    act(() => {
      root.props.onHoverIn({});
    });
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).not.toBe(restBackground);

    act(() => {
      root.props.onPressIn({});
    });
    expect(getRootStyle(component).backgroundColor).toBe('#e0e0e0');

    act(() => {
      root.props.onPress({});
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables interaction and exposes disabled accessibility state', () => {
    const onPress = jest.fn();
    const component = renderButton({ content: 'Unavailable', disabled: true, onPress });
    const root = getRoot(component);

    expect(root.props.disabled).toBe(true);
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true });
    expect(getRootStyle(component).backgroundColor).toBe('#f0f0f0');
  });

  it('renders an accessible icon-only button at the minimum target size', () => {
    const component = renderButton({
      accessibilityLabel: 'Confirm',
      icon: { imageSource: { uri: 'confirm.png' } },
      size: 'small',
    });
    const root = getRoot(component);
    const image = component.root.findByType(Image);

    expect(root.props.accessibilityLabel).toBe('Confirm');
    expect(getRootStyle(component)).toMatchObject({
      borderRadius: 9999,
      minHeight: 24,
      minWidth: 24,
      paddingHorizontal: 4,
      paddingVertical: 4,
    });
    expect(image.props.style).toMatchObject({ height: 16, width: 16 });
  });

  it('warns when an icon-only button has no accessible name', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    renderButton({ icon: { imageSource: { uri: 'confirm.png' } } });

    expect(warn).toHaveBeenCalledWith('Button: icon-only buttons require an accessibilityLabel that describes the action.');
    warn.mockRestore();
  });

  it('uses the regular icon while a toggle button is not selected', () => {
    const component = renderButton({
      accessibilityLabel: 'Favorite',
      icon: { imageSource: { uri: 'regular.png' } },
      selected: false,
      selectedIcon: { imageSource: { uri: 'filled.png' } },
    });

    expect(component.root.findByType(Image).props.source).toEqual({ uri: 'regular.png' });
  });

  it('uses selected semantics, selected icon, and a ghost label to prevent reflow', () => {
    const component = renderButton({
      content: 'Favorite',
      icon: { imageSource: { uri: 'regular.png' } },
      selected: true,
      selectedIcon: { imageSource: { uri: 'filled.png' } },
    });
    const root = getRoot(component);
    const images = component.root.findAllByType(Image);
    const labels = component.root.findAllByType(Text);

    expect(root.props.accessibilityState).toEqual({ checked: true, disabled: false });
    expect(images).toHaveLength(1);
    expect(images[0].props.source).toEqual({ uri: 'filled.png' });
    expect(labels).toHaveLength(2);
    expect(labels[0].props.style).toMatchObject({ fontWeight: '600', opacity: 0 });
    expect(labels[1].props.style).toMatchObject({ fontWeight: '600', position: 'absolute' });
  });

  it('places the icon after content and applies user styles last', () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = renderButton({
      content: { children: 'Next', testID: 'content' },
      icon: { imageSource: { uri: 'next.png' }, testID: 'icon' },
      iconPosition: 'after',
      style,
    });
    const root = getRoot(component);
    const children = root.findAll(
      (instance) => typeof instance.type === 'string' && (instance.props.testID === 'content' || instance.props.testID === 'icon'),
    );

    expect(children.map((child) => child.props.testID)).toEqual(['content', 'icon']);
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it('renders a dual-token focus outline', () => {
    const component = renderButton({ content: 'Focused' });
    const root = getRoot(component);
    act(() => {
      root.props.onFocus({});
    });

    expect(getRootStyle(component)).toMatchObject({
      borderColor: '#ffffff',
      outlineColor: '#000000',
      outlineOffset: 1,
      outlineStyle: 'solid',
      outlineWidth: 2,
    });
  });

  it.each([
    ['primary', '#185abd'],
    ['secondary', '#00000000'],
    ['outline', '#00000000'],
    ['subtle', '#00000000'],
  ] as const)('resolves the %s appearance', (appearance, backgroundColor) => {
    const component = renderButton({ appearance, content: appearance });
    expect(getRootStyle(component).backgroundColor).toBe(backgroundColor);
  });

  it.each([
    ['small', 12, 8],
    ['medium', 14, 10],
    ['large', 16, 12],
  ] as const)('resolves the %s size', (size, fontSize, paddingHorizontal) => {
    const component = renderButton({ content: size, size });
    expect(component.root.findByType(Text).props.style).toMatchObject({ fontSize });
    expect(getRootStyle(component).paddingHorizontal).toBe(paddingHorizontal);
  });

  it('preserves user accessibility state values', () => {
    const props: PressableProps = {
      accessibilityState: { busy: true },
    };
    const component = renderButton({ content: 'Working', ...props });
    expect(getRoot(component).props.accessibilityState).toEqual({ busy: true, disabled: false });
  });
});
