import { act } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from './Accordion';

describe('ComponentsV2 Accordion', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates uncontrolled state and reports open items', () => {
    const onToggle = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Accordion collapsible onToggle={onToggle}>
          <AccordionItem value="one">
            <AccordionHeader>One</AccordionHeader>
            <AccordionPanel>
              <Text>Panel one</Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>,
      );
    });

    const header = component!.root.findByType(Pressable);
    expect(header.props.accessibilityState.expanded).toBe(false);
    act(() => header.props.onPress({ nativeEvent: {} }));

    expect(component!.root.findByType(Pressable).props.accessibilityState.expanded).toBe(true);
    expect(onToggle).toHaveBeenCalledWith(expect.anything(), { openItems: ['one'], value: 'one' });
  });

  it('keeps controlled state until openItems changes', () => {
    const onToggle = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Accordion onToggle={onToggle} openItems={[]}>
          <AccordionItem value={1}>
            <AccordionHeader>One</AccordionHeader>
          </AccordionItem>
        </Accordion>,
      );
    });

    const header = component!.root.findByType(Pressable);
    act(() => header.props.onPress({ nativeEvent: {} }));
    expect(component!.root.findByType(Pressable).props.accessibilityState.expanded).toBe(false);
    expect(onToggle).toHaveBeenCalledWith(expect.anything(), { openItems: [1], value: 1 });
  });

  it('supports multiple open items and collapses independently', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Accordion defaultOpenItems={['one']} multiple>
          <AccordionItem value="one">
            <AccordionHeader>One</AccordionHeader>
          </AccordionItem>
          <AccordionItem value="two">
            <AccordionHeader>Two</AccordionHeader>
          </AccordionItem>
        </Accordion>,
      );
    });

    const headers = component!.root.findAllByType(Pressable);
    act(() => headers[1].props.onPress({ nativeEvent: {} }));
    expect(component!.root.findAllByType(Pressable).map(header => header.props.accessibilityState.expanded)).toEqual([
      true,
      true,
    ]);
    act(() => component!.root.findAllByType(Pressable)[0].props.onPress({ nativeEvent: {} }));
    expect(component!.root.findAllByType(Pressable).map(header => header.props.accessibilityState.expanded)).toEqual([
      false,
      true,
    ]);
    act(() => component!.root.findAllByType(Pressable)[1].props.onPress({ nativeEvent: {} }));
    expect(component!.root.findAllByType(Pressable).map(header => header.props.accessibilityState.expanded)).toEqual([
      false,
      true,
    ]);
  });

  it('does not toggle disabled items', () => {
    const onToggle = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Accordion onToggle={onToggle}>
          <AccordionItem disabled value="one">
            <AccordionHeader>One</AccordionHeader>
          </AccordionItem>
        </Accordion>,
      );
    });

    const header = component!.root.findByType(Pressable);
    act(() => header.props.onPress?.({ nativeEvent: {} }));
    expect(header.props.accessibilityState).toEqual({ disabled: true, expanded: false });
    expect(header.props.focusable).toBe(false);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('exposes expanded accessibility state and custom header options', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Accordion defaultOpenItems={['one']}>
          <AccordionItem value="one">
            <AccordionHeader
              expandIcon={<Text>Custom</Text>}
              expandIconPosition="end"
              headingLevel={3}
              icon={<Text>Decorative</Text>}
              inline
              size="extra-large"
            >
              One
            </AccordionHeader>
          </AccordionItem>
        </Accordion>,
      );
    });

    expect(component!.root.findByType(Pressable).props.accessibilityState.expanded).toBe(true);
    expect(component!.root.find(node => node.props.accessibilityRole === 'header').props['aria-level']).toBe(3);
    expect(StyleSheet.flatten(component!.root.findByType(Text).parent?.props.style)).toEqual({
      flexShrink: 1,
    });
  });

  it('uses custom panel motion settings', () => {
    const timing = jest.spyOn(Animated, 'timing');
    act(() => {
      renderer.create(
        <Accordion defaultOpenItems={['one']}>
          <AccordionItem value="one">
            <AccordionHeader>One</AccordionHeader>
            <AccordionPanel collapseMotion={{ animateOpacity: false, duration: 123 }}>
              <Text>Panel</Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>,
      );
    });

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 123, toValue: 1, useNativeDriver: false }),
    );
  });
});
