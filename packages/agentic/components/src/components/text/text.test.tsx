/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { FlexThemeReference, ThemeProvider } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { Text } from './text';
import type { TextState } from './text.types';
import { useText_unstable } from './useText';

type SlotHostProps = {
  content: SlotProp<typeof Text>;
  optionalContent?: SlotProp<typeof Text>;
};

function SlotHost({ content, optionalContent }: SlotHostProps) {
  const Content = useSlot(Text, content);
  const OptionalContent = useOptionalSlot(Text, optionalContent);
  const DefaultContent = useSlot(Text, undefined, { defaultProps: { children: 'Default child' } });
  const OptionalDefaultContent = useOptionalSlot(Text, undefined, {
    defaultProps: { children: 'Optional default child' },
    renderByDefault: true,
  });

  return (
    <>
      <Content testID="required-text" />
      {OptionalContent && <OptionalContent testID="optional-text" />}
      <DefaultContent testID="default-text" />
      {OptionalDefaultContent && <OptionalDefaultContent testID="optional-default-text" />}
    </>
  );
}

function TextStateProbe({ seen, children }: { seen: TextState['root'][]; children: React.ReactNode }) {
  const state = useText_unstable({ children });
  seen.push(state.root);

  const Root = state.root;
  return <Root>{children}</Root>;
}

describe('Text', () => {
  it('TXT-001 resolves the nearest theme and refreshes defaults when that boundary changes', async () => {
    const outer = new FlexThemeReference({ base: { color: { foregroundNeutralPrimary: '#123456' } } });
    const first = new FlexThemeReference({
      base: { color: { foregroundNeutralPrimary: '#654321' }, fontSize: { functionalBodyMedium: 17 } },
    });
    const second = new FlexThemeReference({
      base: { color: { foregroundNeutralPrimary: '#abcdef' }, fontSize: { functionalBodyMedium: 23 } },
    });
    function Scene({ theme }: { theme: FlexThemeReference }) {
      return (
        <ThemeProvider theme={outer}>
          <Text testID="outer">Outer</Text>
          <ThemeProvider theme={theme}>
            <Text testID="inner">Inner</Text>
          </ThemeProvider>
        </ThemeProvider>
      );
    }
    const component = await render(<Scene theme={first} />);

    expect(StyleSheet.flatten(component.getByTestId('inner').props.style)).toMatchObject({ color: '#654321', fontSize: 17 });
    expect(StyleSheet.flatten(component.getByTestId('outer').props.style).color).toBe('#123456');
    await component.rerender(<Scene theme={second} />);
    expect(StyleSheet.flatten(component.getByTestId('inner').props.style)).toMatchObject({ color: '#abcdef', fontSize: 23 });
    expect(StyleSheet.flatten(component.getByTestId('outer').props.style).color).toBe('#123456');
  });

  it('TXT-002 preserves native style-array precedence for every default typography field', async () => {
    const styles = StyleSheet.create({
      override: { color: '#abcdef', fontFamily: 'Caller family', fontSize: 21, fontWeight: '700', lineHeight: 28 },
    });
    const component = await render(
      <Text testID="text" style={[{ color: 'red', fontSize: 10 }, false, [styles.override, { lineHeight: 31 }]]}>
        Styled
      </Text>,
    );

    expect(StyleSheet.flatten(component.getByTestId('text').props.style)).toMatchObject({
      color: '#abcdef',
      fontFamily: 'Caller family',
      fontSize: 21,
      fontWeight: '700',
      lineHeight: 31,
    });
  });

  it('TXT-003 forwards text layout, scaling, truncation, and caller accessibility without synthesizing semantics', async () => {
    const onTextLayout = jest.fn();
    const component = await render(
      <Text
        testID="text"
        accessibilityLabel="Section title"
        accessibilityRole="header"
        accessibilityState={{ selected: true }}
        allowFontScaling={false}
        ellipsizeMode="middle"
        maxFontSizeMultiplier={1.5}
        numberOfLines={2}
        onTextLayout={onTextLayout}
      >
        Native text
      </Text>,
    );
    const root = component.getByTestId('text');
    const event = { nativeEvent: { lines: [{ text: 'Native text', x: 0, y: 0, width: 80, height: 20 }] } };

    expect(root.props).toMatchObject({
      accessibilityLabel: 'Section title',
      accessibilityRole: 'header',
      accessibilityState: { selected: true },
      allowFontScaling: false,
      ellipsizeMode: 'middle',
      maxFontSizeMultiplier: 1.5,
      numberOfLines: 2,
    });
    await fireEvent(root, 'textLayout', event);
    expect(onTextLayout).toHaveBeenCalledTimes(1);
    expect(onTextLayout.mock.calls[0][0]).toBe(event);

    await component.rerender(<Text testID="text">Plain text</Text>);
    expect(component.getByTestId('text').props.accessibilityRole).toBeUndefined();
    expect(component.getByTestId('text').props.accessibilityLabel).toBeUndefined();
  });

  it('applies theme typography and foreground defaults', async () => {
    const theme = new FlexThemeReference({
      base: {
        color: { foregroundNeutralPrimary: '#123456' },
        fontFamily: { functional: 'Test Family' },
        fontSize: { functionalBodyMedium: 17 },
        fontWeight: { functionalRegular: '600' },
        lineHeight: { functionalBodyMedium: 23 },
      },
    });
    const { getByTestId } = await render(
      <ThemeProvider theme={theme}>
        <Text testID="text">Theme text</Text>
      </ThemeProvider>,
    );

    expect(StyleSheet.flatten(getByTestId('text').props.style)).toMatchObject({
      color: '#123456',
      fontFamily: 'Test Family',
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 23,
    });
  });

  it('applies user styles after theme defaults', async () => {
    const { getByTestId } = await render(
      <Text testID="text" style={{ color: '#abcdef', fontSize: 21 }}>
        Styled text
      </Text>,
    );

    expect(StyleSheet.flatten(getByTestId('text').props.style)).toMatchObject({
      color: '#abcdef',
      fontSize: 21,
    });
  });

  it('delegates native Text behavior and forwards the native ref prop', async () => {
    const onPress = jest.fn();
    const ref = React.createRef<React.ComponentRef<typeof Text>>();
    const { getByTestId } = await render(
      <Text ref={ref} testID="text" selectable onPress={onPress}>
        Pressable text
      </Text>,
    );

    await fireEvent.press(getByTestId('text'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByTestId('text').props.selectable).toBe(true);
    expect(ref.current).not.toBeNull();
  });

  it('resolves as both a required and optional slot without losing shorthand children', async () => {
    const { getByTestId } = await render(<SlotHost content="Required child" optionalContent="Optional child" />);

    expect(getByTestId('required-text')).toHaveTextContent('Required child');
    expect(getByTestId('optional-text')).toHaveTextContent('Optional child');
    expect(getByTestId('default-text')).toHaveTextContent('Default child');
    expect(getByTestId('optional-default-text')).toHaveTextContent('Optional default child');
  });

  it('reapplies theme defaults at nested Agentic Text boundaries', async () => {
    const theme = new FlexThemeReference({ base: { fontSize: { functionalBodyMedium: 17 } } });
    const { getByTestId } = await render(
      <ThemeProvider theme={theme}>
        <Text style={{ fontSize: 30 }}>
          Parent
          <Text testID="nested-text">Nested</Text>
        </Text>
      </ThemeProvider>,
    );

    expect(StyleSheet.flatten(getByTestId('nested-text').props.style)).toMatchObject({ fontSize: 17 });
  });

  it('keeps the returned root slot identity stable across renders', async () => {
    const seen: TextState['root'][] = [];
    const { rerender } = await render(<TextStateProbe seen={seen}>First</TextStateProbe>);

    await rerender(<TextStateProbe seen={seen}>Second</TextStateProbe>);

    expect(seen).toHaveLength(2);
    expect(seen[1]).toBe(seen[0]);
  });
});
