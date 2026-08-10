import { act } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Card, CardFooter, CardHeader, CardPreview } from './Card';

describe('ComponentsV2 Card', () => {
  it('composes Header, Preview, and Footer slots with full-bleed preview content', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Card testID="card">
          <CardHeader
            action={<Text>More</Text>}
            description={<Text>Subtitle</Text>}
            header={<Text>Title</Text>}
            image={<Text>Image</Text>}
            testID="header"
          />
          <CardPreview logo={<Text>Logo</Text>} testID="preview">
            <View testID="media" />
          </CardPreview>
          <CardFooter action={<Text>Secondary</Text>} testID="footer">
            <Text>Primary</Text>
          </CardFooter>
        </Card>,
      );
    });

    expect(component!.root.findByProps({ testID: 'header-image' }).findByType(Text).props.children).toBe('Image');
    expect(component!.root.findByProps({ testID: 'header-header' }).findByType(Text).props.children).toBe('Title');
    expect(component!.root.findByProps({ testID: 'header-description' }).findByType(Text).props.children).toBe('Subtitle');
    expect(component!.root.findByProps({ testID: 'header-action' }).findByType(Text).props.children).toBe('More');
    expect(component!.root.findByProps({ testID: 'footer-action' }).findByType(Text).props.children).toBe('Secondary');
    expect(component!.root.findByProps({ testID: 'preview-logo' }).findByType(Text).props.children).toBe('Logo');
    expect(StyleSheet.flatten(component!.root.findByProps({ testID: 'preview' }).props.style)).toMatchObject({
      marginLeft: -12,
      marginRight: -12,
    });
  });

  it('maps all appearances, orientations, and sizes to native surface styles', () => {
    const appearances = ['filled', 'filled-alternative', 'outline', 'subtle'] as const;

    appearances.forEach(appearance => {
      let component: renderer.ReactTestRenderer;
      act(() => {
        component = renderer.create(
          <Card appearance={appearance} orientation="horizontal" size="large" testID={appearance}>
            <Text>Card</Text>
          </Card>,
        );
      });

      const style = StyleSheet.flatten(component!.root.findByProps({ testID: appearance }).props.style);
      expect(style.flexDirection).toBe('row');
      expect(style.padding).toBe(16);
      expect(style.borderRadius).toBe(6);
      expect(style.borderWidth).toBe(1);
      if (appearance === 'outline') {
        expect(style.borderColor).not.toBe('transparent');
      }
    });
  });

  it('supports uncontrolled and controlled selectable cards with checkbox semantics', () => {
    const onUncontrolledSelectionChange = jest.fn();
    let uncontrolled: renderer.ReactTestRenderer;
    act(() => {
      uncontrolled = renderer.create(
        <Card defaultSelected={false} onSelectionChange={onUncontrolledSelectionChange} testID="uncontrolled">
          <CardHeader header="Selectable title" />
        </Card>,
      );
    });

    const uncontrolledRoot = uncontrolled!.root.findByType(Pressable);
    expect(uncontrolledRoot.props.accessibilityRole).toBe('checkbox');
    expect(uncontrolledRoot.props.accessibilityState).toEqual({ checked: false, disabled: false });
    expect(uncontrolledRoot.props.accessibilityLabel).toBe('Selectable title');
    act(() => uncontrolledRoot.props.onPress({ nativeEvent: {} }));
    expect(uncontrolled!.root.findByType(Pressable).props.accessibilityState.checked).toBe(true);
    expect(onUncontrolledSelectionChange).toHaveBeenCalledWith(expect.anything(), { selected: true });
    expect(uncontrolled!.root.findAllByProps({ testID: 'uncontrolled-selection-indicator' })).toHaveLength(0);

    const onControlledSelectionChange = jest.fn();
    let controlled: renderer.ReactTestRenderer;
    act(() => {
      controlled = renderer.create(<Card onSelectionChange={onControlledSelectionChange} selected={false} />);
    });
    act(() => controlled!.root.findByType(Pressable).props.onPress({ nativeEvent: {} }));
    expect(controlled!.root.findByType(Pressable).props.accessibilityState.checked).toBe(false);
    expect(onControlledSelectionChange).toHaveBeenCalledWith(expect.anything(), { selected: true });
  });

  it('invokes Web-compatible click and native press handlers from the card surface', () => {
    const onClick = jest.fn();
    const onPress = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Card onClick={onClick} onPress={onPress}>
          <Text>Actionable</Text>
        </Card>,
      );
    });

    act(() => component!.root.findByType(Pressable).props.onPress({ nativeEvent: {} }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a supplied floating action without adding a default selection indicator', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Card defaultSelected floatingAction={<Text testID="custom-action">Choose</Text>} testID="card">
          <Text>Card</Text>
        </Card>,
      );
    });

    expect(component!.root.findByProps({ testID: 'custom-action' }).props.children).toBe('Choose');
    expect(component!.root.findAllByProps({ testID: 'card-selection-indicator' })).toHaveLength(0);
  });

  it('does not invoke or select a disabled card', () => {
    const onClick = jest.fn();
    const onSelectionChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Card disabled onClick={onClick} onSelectionChange={onSelectionChange} selected testID="card">
          <Text>Disabled</Text>
        </Card>,
      );
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityState).toEqual({ checked: true, disabled: true });
    expect(root.props.focusable).toBe(false);
    act(() => root.props.onPress({ nativeEvent: {} }));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('adapts focus modes and interactive default focus participation', () => {
    let staticCard: renderer.ReactTestRenderer;
    let interactiveCard: renderer.ReactTestRenderer;
    act(() => {
      staticCard = renderer.create(<Card testID="static">Static</Card>);
      interactiveCard = renderer.create(
        <Card onClick={jest.fn()} testID="interactive">
          Interactive
        </Card>,
      );
    });

    expect(staticCard!.root.findByProps({ testID: 'static' }).props.focusable).toBeUndefined();
    expect(interactiveCard!.root.findByType(Pressable).props.focusable).toBe(true);

    (['no-tab', 'tab-exit', 'tab-only'] as const).forEach(focusMode => {
      let focusableCard: renderer.ReactTestRenderer;
      act(() => {
        focusableCard = renderer.create(<Card focusMode={focusMode}>Focusable</Card>);
      });
      expect(focusableCard!.root.findByType(Pressable).props.focusable).toBe(true);
    });
  });

  it('updates hover, press, and focus visuals when native events are available', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Card onClick={jest.fn()} testID="card">
          Interactive
        </Card>,
      );
    });

    const initialStyle = StyleSheet.flatten(component!.root.findByType(Pressable).props.style);
    act(() => component!.root.findByType(Pressable).props.onHoverIn({ nativeEvent: {} }));
    const hoveredStyle = StyleSheet.flatten(component!.root.findByType(Pressable).props.style);
    expect(hoveredStyle.elevation).toBeGreaterThan(initialStyle.elevation);
    act(() => component!.root.findByType(Pressable).props.onPressIn({ nativeEvent: {} }));
    const pressedStyle = StyleSheet.flatten(component!.root.findByType(Pressable).props.style);
    expect(pressedStyle.backgroundColor).not.toBe(hoveredStyle.backgroundColor);
    act(() => component!.root.findByType(Pressable).props.onFocus({ nativeEvent: {} }));
    expect(component!.root.findByProps({ testID: 'card-focus-ring' })).toBeTruthy();
  });

  it('keeps a nested action independent from card selection', () => {
    const onSelectionChange = jest.fn();
    const onInnerPress = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Card onSelectionChange={onSelectionChange}>
          <CardFooter action={<Pressable onPress={onInnerPress} testID="inner-action" />}>
            <Text>Card content</Text>
          </CardFooter>
        </Card>,
      );
    });

    act(() => component!.root.findByProps({ testID: 'inner-action' }).props.onPress({ nativeEvent: {} }));
    expect(onInnerPress).toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('bleeds Preview along the correct edges for horizontal cards', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Card orientation="horizontal">
          <CardPreview testID="preview">
            <View />
          </CardPreview>
          <CardHeader header="Details" />
        </Card>,
      );
    });

    expect(StyleSheet.flatten(component!.root.findByProps({ testID: 'preview' }).props.style)).toMatchObject({
      marginBottom: -12,
      marginLeft: -12,
      marginTop: -12,
    });
  });
});
