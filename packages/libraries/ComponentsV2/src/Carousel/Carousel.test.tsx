import { act } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';

import * as renderer from 'react-test-renderer';
import { Svg } from 'react-native-svg';

import { Carousel } from './Carousel';

describe('ComponentsV2 Carousel', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes adjustable carousel semantics and navigation', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Carousel>
          <Text>One</Text>
          <Text>Two</Text>
        </Carousel>,
      );
    });

    const adjustable = component!.root.find(node => node.props.accessibilityRole === 'adjustable');
    expect(adjustable.props.accessibilityValue).toEqual({
      max: 2,
      min: 1,
      now: 1,
      text: 'Carousel slide 1 of 2',
    });
    expect(component!.root.findAllByType(Pressable)).toHaveLength(5);
  });

  it('updates uncontrolled state and reports click navigation', () => {
    const onChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Carousel onActiveIndexChange={onChange}>
          <Text>One</Text>
          <Text>Two</Text>
        </Carousel>,
      );
    });

    const next = component!.root.find(
      node => node.type === Pressable && node.props.accessibilityLabel === 'Go to next',
    );
    act(() => next.props.onPress({ nativeEvent: {} }));

    const adjustable = component!.root.find(node => node.props.accessibilityRole === 'adjustable');
    expect(adjustable.props.accessibilityValue.now).toBe(2);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), { index: 1, type: 'click' });
  });

  it('does not update controlled state without a new activeIndex', () => {
    const onChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Carousel activeIndex={0} onActiveIndexChange={onChange}>
          <Text>One</Text>
          <Text>Two</Text>
        </Carousel>,
      );
    });

    const next = component!.root.find(
      node => node.type === Pressable && node.props.accessibilityLabel === 'Go to next',
    );
    act(() => next.props.onPress({ nativeEvent: {} }));

    const adjustable = component!.root.find(node => node.props.accessibilityRole === 'adjustable');
    expect(adjustable.props.accessibilityValue.now).toBe(1);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), { index: 1, type: 'click' });
  });

  it('uses Fluent dot and selected-pill indicator geometry', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Carousel>
          <Text>One</Text>
          <Text>Two</Text>
        </Carousel>,
      );
    });

    const indicators = component!.root.findAll(node => node.props.accessibilityRole === 'tab');
    const selectedIndicator = indicators[0].findAllByType(View).find(node =>
      node.props.style?.some?.((style: { width?: number }) => style?.width === 16),
    );
    const unselectedIndicator = indicators[1].findAllByType(View).find(node =>
      node.props.style?.some?.((style: { width?: number }) => style?.width === 8),
    );
    expect(selectedIndicator).toBeDefined();
    expect(unselectedIndicator).toBeDefined();
  });

  it('renders an icon-only autoplay control', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Carousel showAutoplayButton>
          <Text>One</Text>
          <Text>Two</Text>
        </Carousel>,
      );
    });

    const autoplay = component!.root.find(
      node => node.type === Pressable && node.props.accessibilityLabel === 'Start autoplay',
    );
    expect(autoplay.findAllByType(Svg)).toHaveLength(1);
    expect(autoplay.findAllByType(Text)).toHaveLength(0);
  });
});
