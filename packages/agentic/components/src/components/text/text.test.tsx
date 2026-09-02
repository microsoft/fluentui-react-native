/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
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
