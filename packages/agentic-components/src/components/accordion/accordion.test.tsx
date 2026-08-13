/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TextProps, TextStyle, ViewProps, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';
import { directComponent } from '@fluentui-react-native/framework-base';

import { Accordion } from './accordion';

function renderAccordion(props: React.ComponentProps<typeof Accordion>): Promise<RenderResult> {
  return render(<Accordion {...props} />);
}

function getHeader(component: RenderResult) {
  return component.getByTestId('accordion-header');
}

function getBody(component: RenderResult) {
  return component.getByTestId('accordion-body', { includeHiddenElements: true });
}

function getHeaderStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getHeader(component).props.style);
}

function getTitleStyle(component: RenderResult): TextStyle {
  return StyleSheet.flatten(component.getByTestId('accordion-title').props.style);
}

describe('Accordion', () => {
  it('renders a default header, default icon, and hidden body wiring', async () => {
    const component = await renderAccordion({});
    const header = getHeader(component);
    const body = getBody(component);

    expect(header.props.accessibilityRole).toBe('button');
    expect(header.props.accessibilityState).toEqual({ expanded: false });
    expect(component.getByText('Section title')).toBeOnTheScreen();
    expect(component.getByTestId('accordion-leading-icon').props.style).toMatchObject({ height: 16, width: 16 });
    expect(component.getByTestId('accordion-chevron-icon').props.style).toMatchObject({ height: 16, width: 16 });
    expect(StyleSheet.flatten(body.props.style)).toMatchObject({ height: 0, opacity: 0, overflow: 'hidden' });
    expect(body.props.id).toEqual(expect.any(String));
  });

  it('updates the expanded state and reveals the body on press', async () => {
    const onExpandedChange = jest.fn();
    const component = await renderAccordion({ onExpandedChange });
    const header = getHeader(component);

    await fireEvent.press(header);

    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(header.props.accessibilityState).toEqual({ expanded: true });
    expect(StyleSheet.flatten(getBody(component).props.style)).toMatchObject({ opacity: 1, overflow: 'visible' });
    expect(StyleSheet.flatten(component.getByTestId('accordion-chevron').props.style).transform).toEqual([{ rotate: '90deg' }]);
    expect(component.getByText('Content placeholder')).toBeOnTheScreen();
  });

  it('keeps user accessibility state values and uses the visible title for the accessible name', async () => {
    const component = await renderAccordion({
      accessibilityState: { busy: true },
      accessibilityLabel: 'Collapsible section',
      testID: 'accordion-root',
    });

    expect(getHeader(component).props.accessibilityLabel).toBe('Collapsible section');
    expect(getHeader(component).props.accessibilityState).toEqual({ busy: true, expanded: false });
  });

  it('uses the focused prop to render the universal dual-outline focus ring', async () => {
    const component = await renderAccordion({ focused: true });

    expect(getHeaderStyle(component)).toMatchObject({
      borderColor: '#ffffff',
      outlineColor: '#000000',
      outlineOffset: 1,
      outlineStyle: 'solid',
      outlineWidth: 2,
    });
  });

  it('renders hover and pressed header feedback with the resolved foreground color', async () => {
    const colors = useFlexTokens().color;
    const component = await renderAccordion({});
    const header = getHeader(component);

    expect(getHeaderStyle(component)).toMatchObject({
      backgroundColor: colors.backgroundNeutralTransparent,
    });
    expect(getTitleStyle(component).color).toBe(colors.foregroundNeutralPrimary);

    await fireEvent(header, 'hoverIn', {});
    expect(getHeaderStyle(component)).toMatchObject({
      backgroundColor: colors.hover.backgroundNeutralSubtle,
    });
    expect(getTitleStyle(component).color).toBe(colors.hover.foregroundNeutralPrimary);

    await fireEvent(header, 'pressIn', {});
    expect(getHeaderStyle(component)).toMatchObject({
      backgroundColor: colors.pressed.backgroundNeutralSubtle,
    });
    expect(getTitleStyle(component).color).toBe(colors.pressed.foregroundNeutralPrimary);
  });

  it('places the chevron at the leading or trailing edge according to layout', async () => {
    const start = await renderAccordion({ layout: 'chevronStart' });
    const end = await renderAccordion({ layout: 'chevronEnd' });
    const startChildren = getHeader(start).children as Array<{ props: { testID?: string } }>;
    const endChildren = getHeader(end).children as Array<{ props: { testID?: string } }>;

    expect(startChildren.map((child) => child.props.testID)).toEqual([
      'accordion-chevron',
      'accordion-leading-icon',
      'accordion-title',
    ]);
    expect(endChildren.map((child) => child.props.testID)).toEqual([
      'accordion-leading-icon',
      'accordion-title',
      'accordion-chevron',
    ]);
  });

  it('renders custom title and body slots', async () => {
    const CustomTitle = directComponent<TextProps>((props) => <Text {...props} accessibilityHint="custom-title" />);
    const CustomBody = directComponent<ViewProps>((props) => <View {...props} accessibilityHint="custom-body" />);
    const component = await renderAccordion({
      expanded: true,
      bodyContent: { as: CustomBody, children: <Text>Custom body</Text>, testID: 'custom-body' },
      title: { as: CustomTitle, children: 'Custom title', testID: 'custom-title' },
    });

    expect(component.getByTestId('custom-title').props.accessibilityHint).toBe('custom-title');
    expect(component.getByTestId('custom-body').props.accessibilityHint).toBe('custom-body');
    expect(component.getByText('Custom body')).toBeOnTheScreen();
  });

  it('applies user root styles after the component styles', async () => {
    const component = await renderAccordion({
      style: { width: 240 },
      testID: 'accordion-root',
    });

    expect(StyleSheet.flatten(component.getByTestId('accordion-root').props.style)).toMatchObject({
      width: 240,
    });
  });
});
