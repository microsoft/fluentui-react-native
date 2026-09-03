/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { View, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Input } from './input';

function getTextbox(component: Awaited<ReturnType<typeof render>>) {
  return component.getByRole('textbox');
}

function getContents(component: Awaited<ReturnType<typeof render>>) {
  return component.getByTestId('input-contents');
}

function flattenStyle(style: unknown) {
  return StyleSheet.flatten(style as ViewStyle);
}

describe('Input', () => {
  it('forwards its ref prop through phased rendering to the native root', async () => {
    const ref = React.createRef<React.ElementRef<typeof View>>();

    await render(<Input ref={ref} />);

    expect(ref.current).not.toBeNull();
  });

  it('renders a textbox with outline styling by default', async () => {
    const component = await render(<Input placeholder="Enter text" />);
    const textbox = getTextbox(component);

    expect(textbox.props.accessibilityRole).toBe('textbox');
    expect(textbox.props.accessibilityState).toEqual({ disabled: false, invalid: undefined, readOnly: false });
    expect(getContents(component).props.testID).toBe('input-contents');
    expect(flattenStyle(getContents(component).props.style)).toMatchObject({
      backgroundColor: 'transparent',
      borderWidth: 1,
      minHeight: 32,
    });
    expect(flattenStyle(textbox.props.style)).toMatchObject({
      textAlignVertical: 'center',
    });
  });

  it('forwards change and interaction handlers while updating visual state', async () => {
    const onChangeText = jest.fn();
    const onFocus = jest.fn();
    const onHoverIn = jest.fn();
    const onPressIn = jest.fn();
    const component = await render(
      <Input placeholder="Search" onChangeText={onChangeText} onFocus={onFocus} onHoverIn={onHoverIn} onPressIn={onPressIn} />,
    );
    const textbox = getTextbox(component);
    const colors = defaultFlexTokens.color;

    await fireEvent(textbox, 'hoverIn', {});
    await fireEvent(textbox, 'pressIn', {});
    await fireEvent(textbox, 'focus', {});
    await fireEvent.changeText(textbox, 'hello');

    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('hello');
    expect(flattenStyle(getContents(component).props.style)).toMatchObject({
      borderColor: colors.strokeNeutralHeavy,
    });
  });

  it('disables editing and exposes disabled accessibility state', async () => {
    const onChangeText = jest.fn();
    const component = await render(<Input disabled onChangeText={onChangeText} placeholder="Unavailable" />);
    const textbox = getTextbox(component);
    const colors = defaultFlexTokens.color;

    expect(textbox.props.editable).toBe(false);
    expect(textbox.props.accessibilityState).toMatchObject({ disabled: true, readOnly: false });
    expect(flattenStyle(getContents(component).props.style)).toMatchObject({
      borderColor: colors.strokeNeutralDisabled,
    });

    await fireEvent.changeText(textbox, 'blocked');
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('marks read only inputs without disabling accessibility', async () => {
    const component = await render(<Input readOnly placeholder="Read only" value="Value" />);
    const textbox = getTextbox(component);
    const colors = defaultFlexTokens.color;

    expect(textbox.props.editable).toBe(false);
    expect(textbox.props.accessibilityState).toMatchObject({ disabled: false, readOnly: true });
    expect(flattenStyle(getContents(component).props.style)).toMatchObject({
      borderColor: colors.strokeNeutralDisabled,
    });
  });

  it('renders the underline variant with a bottom edge indicator only', async () => {
    const component = await render(<Input placeholder="Underline" variant="underline" />);
    expect(flattenStyle(getContents(component).props.style)).not.toHaveProperty('borderBottomWidth');
    expect(component.getByTestId('input-underline')).toBeOnTheScreen();
    expect(flattenStyle(component.getByTestId('input-underline').props.style)).toMatchObject({
      borderBottomWidth: 1,
      position: 'absolute',
    });
  });

  it('renders leading and trailing icons with the resolved size and color', async () => {
    const component = await render(
      <Input
        iconEnd1={{ imageSource: { uri: 'end1.png' }, testID: 'icon-end-1' }}
        iconEnd2={{ imageSource: { uri: 'end2.png' }, testID: 'icon-end-2' }}
        iconStart={{ fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'icon-start' }}
        size="large"
      />,
    );
    const colors = defaultFlexTokens.color;

    expect(flattenStyle(component.getByTestId('icon-start').props.style)).toMatchObject({
      color: colors.foregroundNeutralPrimary,
      height: 24,
      width: 24,
    });
    expect(component.getByTestId('icon-end-1').props.style).toMatchObject({ height: 24, width: 24 });
    expect(component.getByTestId('icon-end-2').props.style).toMatchObject({ height: 24, width: 24 });
  });

  it('resolves the size axis', async () => {
    const tokens = defaultFlexTokens;
    const cases = [
      {
        fontSize: Number(tokens.fontSize.functionalBodySmall),
        lineHeight: Number(tokens.lineHeight.functionalBodySmall),
        minHeight: Number(tokens.lineHeight.functionalBodySmall) + Number(tokens.spacing.componentBase100) * 2,
        size: 'small',
      },
      {
        fontSize: Number(tokens.fontSize.functionalBodyMedium),
        lineHeight: Number(tokens.lineHeight.functionalBodyMedium),
        minHeight: Number(tokens.lineHeight.functionalBodyMedium) + Number(tokens.spacing.componentBase150) * 2,
        size: 'medium',
      },
      {
        fontSize: Number(tokens.fontSize.functionalBodyLarge),
        lineHeight: Number(tokens.lineHeight.functionalBodyLarge),
        minHeight: Number(tokens.lineHeight.functionalBodyLarge) + Number(tokens.spacing.componentBase200) * 2,
        size: 'large',
      },
    ] as const;

    for (const { fontSize, lineHeight, minHeight, size } of cases) {
      const component = await render(<Input placeholder={size} size={size} />);
      expect(flattenStyle(component.getByRole('textbox').props.style)).toMatchObject({
        fontSize,
        lineHeight,
      });
      expect(flattenStyle(getContents(component).props.style)).toMatchObject({ minHeight });
      expect(component.queryByTestId('icon-start')).toBeNull();
    }
  });

  it('warns when iconEnd2 is provided without iconEnd1', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await render(<Input iconEnd2={{ imageSource: { uri: 'end2.png' } }} />);

    expect(warn).toHaveBeenCalledWith('Input: iconEnd2 requires iconEnd1 to be provided.');
    warn.mockRestore();
  });

  it('keeps user styles last', async () => {
    const component = await render(<Input placeholder="Styled" style={{ backgroundColor: 'hotpink' }} />);
    expect(flattenStyle(component.getByTestId('input-root').props.style)).toMatchObject({ backgroundColor: 'hotpink' });
  });
});
