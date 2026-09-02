/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { TextInput, View, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { SearchBox } from './search-box';

type RenderResult = Awaited<ReturnType<typeof render>>;

function getTextbox(component: RenderResult) {
  return component.getByRole('textbox');
}

function flattenStyle(style: unknown) {
  return StyleSheet.flatten(style as ViewStyle);
}

function pressEscape(component: RenderResult) {
  return fireEvent(getTextbox(component), 'keyPress', { nativeEvent: { key: 'Escape' } });
}

describe('SearchBox', () => {
  it('renders the documented defaults and forwards the root ref', async () => {
    const ref = React.createRef<React.ElementRef<typeof View>>();
    const component = await render(<SearchBox accessibilityLabel="Search messages" placeholder="Search messages" ref={ref} />);
    const textbox = getTextbox(component);

    expect(ref.current).not.toBeNull();
    expect(component.getByTestId('search-box-root')).toBeOnTheScreen();
    expect(component.getByTestId('search-box-contents')).toBeOnTheScreen();
    expect(component.getByTestId('search-box-icon')).toBeOnTheScreen();
    expect(component.queryByTestId('search-box-underline')).toBeNull();
    expect(textbox.props.accessibilityRole).toBe('textbox');
    expect(textbox.props.accessibilityLabel).toBe('Search messages');
    expect(textbox.props.value).toBe('');
    expect(flattenStyle(component.getByTestId('search-box-contents').props.style)).toMatchObject({
      borderWidth: 1,
      minHeight: 32,
    });
  });

  it('lifts accessibility and identification props onto the text input', async () => {
    const component = await render(
      <SearchBox accessibilityHint="Results update as you type" accessibilityLabel="Search files" testID="query" />,
    );
    const textbox = getTextbox(component);

    expect(textbox.props.accessibilityHint).toBe('Results update as you type');
    expect(textbox.props.testID).toBe('query');
    expect(component.getByTestId('search-box-root').props.accessible).toBe(false);
    expect(component.getByTestId('search-box-contents').props.accessible).toBe(false);
    expect(component.getByTestId('search-box-icon-text-stack').props.accessible).toBe(false);
  });

  it('warns in development builds when no accessible name is supplied', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await render(<SearchBox placeholder="Search" />);

    expect(warn).toHaveBeenCalledWith(
      'SearchBox: provide an accessibilityLabel that names the query. A placeholder is not an accessible name.',
    );
    warn.mockRestore();
  });

  it('owns the query and reports every accepted edit', async () => {
    const onChangeText = jest.fn();
    const component = await render(<SearchBox accessibilityLabel="Search" defaultValue="qua" onChangeText={onChangeText} />);

    expect(getTextbox(component).props.value).toBe('qua');

    await fireEvent.changeText(getTextbox(component), 'quarterly');

    expect(onChangeText).toHaveBeenCalledWith('quarterly');
    expect(getTextbox(component).props.value).toBe('quarterly');
  });

  it('shows the query supplied by a controlled caller', async () => {
    const onChangeText = jest.fn();
    const component = await render(<SearchBox accessibilityLabel="Search" onChangeText={onChangeText} value="frozen" />);

    await fireEvent.changeText(getTextbox(component), 'typed');

    expect(onChangeText).toHaveBeenCalledWith('typed');
    expect(getTextbox(component).props.value).toBe('frozen');
  });

  it('renders the clear button only while the query is non-empty', async () => {
    const component = await render(<SearchBox accessibilityLabel="Search" />);

    expect(component.queryByTestId('search-box-clear-button')).toBeNull();
    expect(component.queryByTestId('search-box-clear-group')).toBeNull();

    await fireEvent.changeText(getTextbox(component), 'a');

    const clearButton = component.getByTestId('search-box-clear-button');
    expect(clearButton).toBeOnTheScreen();
    expect(clearButton.props.accessibilityLabel).toBe('Clear search');
    expect(clearButton.props.role).toBe('button');
    expect(component.getByTestId('search-box-clear-group').props.accessible).toBe(false);

    await fireEvent.changeText(getTextbox(component), '');

    expect(component.queryByTestId('search-box-clear-button')).toBeNull();
  });

  it('clears the query, reports the empty string, and returns focus to the field', async () => {
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    const ref = React.createRef<TextInput>();
    const component = await render(
      <SearchBox accessibilityLabel="Search" defaultValue="quarterly" onChangeText={onChangeText} onClear={onClear} textInput={{ ref }} />,
    );
    const focus = jest.spyOn(ref.current as TextInput, 'focus').mockImplementation(() => undefined);

    await fireEvent.press(component.getByTestId('search-box-clear-button'));

    expect(onChangeText).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(1);
    expect(getTextbox(component).props.value).toBe('');
    expect(component.queryByTestId('search-box-clear-button')).toBeNull();
  });

  it('reports an explicit submit through onSearch without clearing the query', async () => {
    const onSearch = jest.fn();
    const component = await render(<SearchBox accessibilityLabel="Search" defaultValue="reports" onSearch={onSearch} />);

    await fireEvent(getTextbox(component), 'submitEditing', { nativeEvent: { text: 'reports' } });

    expect(onSearch).toHaveBeenCalledWith('reports');
    expect(getTextbox(component).props.value).toBe('reports');
  });

  it('clears a non-empty query on escape and ignores escape on an empty one', async () => {
    const onClear = jest.fn();
    const component = await render(<SearchBox accessibilityLabel="Search" defaultValue="reports" onClear={onClear} />);

    await pressEscape(component);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(getTextbox(component).props.value).toBe('');

    await pressEscape(component);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('blocks editing and clearing while disabled', async () => {
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    const component = await render(
      <SearchBox accessibilityLabel="Search" defaultValue="locked" disabled onChangeText={onChangeText} onClear={onClear} />,
    );
    const textbox = getTextbox(component);

    expect(textbox.props.editable).toBe(false);
    expect(textbox.props.accessibilityState).toMatchObject({ disabled: true, readOnly: false });
    expect(component.getByTestId('search-box-clear-button').props.accessibilityState).toMatchObject({ disabled: true });

    await fireEvent.changeText(textbox, 'typed');
    await fireEvent.press(component.getByTestId('search-box-clear-button'));
    await pressEscape(component);

    expect(onChangeText).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
    expect(getTextbox(component).props.value).toBe('locked');
  });

  it('blocks editing and clearing while read only', async () => {
    const onClear = jest.fn();
    const component = await render(<SearchBox accessibilityLabel="Search" defaultValue="locked" onClear={onClear} readOnly />);
    const textbox = getTextbox(component);

    expect(textbox.props.editable).toBe(false);
    expect(textbox.props.accessibilityState).toMatchObject({ disabled: false, readOnly: true });

    await fireEvent.press(component.getByTestId('search-box-clear-button'));

    expect(onClear).not.toHaveBeenCalled();
    expect(getTextbox(component).props.value).toBe('locked');
  });

  it('resolves the size axis across the field, the icon, and the clear button', async () => {
    const tokens = defaultFlexTokens;
    const cases = [
      { clearBox: Number(tokens.spacing.componentBase50), iconSize: 16, minHeight: 24, size: 'small' },
      { clearBox: Number(tokens.spacing.componentBase100), iconSize: 20, minHeight: 32, size: 'medium' },
      { clearBox: Number(tokens.spacing.componentBase100), iconSize: 24, minHeight: 38, size: 'large' },
    ] as const;

    for (const { clearBox, iconSize, minHeight, size } of cases) {
      const component = await render(<SearchBox accessibilityLabel="Search" defaultValue="query" size={size} />);

      expect(flattenStyle(component.getByTestId('search-box-contents').props.style)).toMatchObject({ minHeight });
      expect(flattenStyle(component.getByTestId('search-box-icon').props.style)).toMatchObject({
        height: iconSize,
        width: iconSize,
      });
      expect(flattenStyle(component.getByTestId('search-box-clear-button').props.style)).toMatchObject({
        minHeight: size === 'small' ? 20 : 24,
        paddingHorizontal: clearBox,
      });
    }
  });

  it('renders the underline variant with a bottom edge indicator', async () => {
    const component = await render(<SearchBox accessibilityLabel="Search" variant="underline" />);

    expect(flattenStyle(component.getByTestId('search-box-underline').props.style)).toMatchObject({
      borderBottomWidth: 1,
      position: 'absolute',
    });
  });

  it('colors the leading icon from the resolved field metrics', async () => {
    const colors = defaultFlexTokens.color;
    const component = await render(<SearchBox accessibilityLabel="Search" />);
    expect(flattenStyle(component.getByTestId('search-box-icon').props.style)).toMatchObject({
      color: colors.foregroundNeutralPrimary,
    });

    const disabled = await render(<SearchBox accessibilityLabel="Search" disabled />);
    expect(flattenStyle(disabled.getByTestId('search-box-icon').props.style)).toMatchObject({
      color: colors.foregroundNeutralDisabled,
    });
  });

  it('replaces and removes the leading icon through its slot', async () => {
    const replaced = await render(
      <SearchBox accessibilityLabel="Search" icon={{ imageSource: { uri: 'people.png' }, testID: 'custom-icon' }} />,
    );
    expect(replaced.getByTestId('custom-icon').props.source).toEqual({ uri: 'people.png' });

    const removed = await render(<SearchBox accessibilityLabel="Search" icon={null} />);
    expect(removed.queryByTestId('search-box-icon')).toBeNull();
  });

  it('renames the clear button and removes it through its slot without changing clear behavior', async () => {
    const onClear = jest.fn();
    const renamed = await render(
      <SearchBox
        accessibilityLabel="Search orders"
        clearButton={{ accessibilityLabel: 'Clear order search' }}
        defaultValue="order"
        onClear={onClear}
      />,
    );
    const clearButton = renamed.getByTestId('search-box-clear-button');
    expect(clearButton.props.accessibilityLabel).toBe('Clear order search');

    await fireEvent.press(clearButton);
    expect(onClear).toHaveBeenCalledTimes(1);

    const removed = await render(<SearchBox accessibilityLabel="Search" clearButton={null} defaultValue="order" />);
    expect(removed.queryByTestId('search-box-clear-button')).toBeNull();
    expect(removed.queryByTestId('search-box-clear-group')).toBeNull();
  });

  it('keeps user styles last', async () => {
    const component = await render(<SearchBox accessibilityLabel="Search" style={{ backgroundColor: 'hotpink' }} />);

    expect(flattenStyle(component.getByTestId('search-box-root').props.style)).toMatchObject({ backgroundColor: 'hotpink' });
  });

  it('forwards a text input slot ref alongside the internal focus handle', async () => {
    const ref = React.createRef<TextInput>();

    const component = await render(<SearchBox accessibilityLabel="Search" textInput={{ ref }} />);

    expect(ref.current).not.toBeNull();
    expect(getTextbox(component)).toBeOnTheScreen();
  });

  it('forwards interaction handlers from the field', async () => {
    const onFocus = jest.fn();
    const onHoverIn = jest.fn();
    const component = await render(<SearchBox accessibilityLabel="Search" onFocus={onFocus} onHoverIn={onHoverIn} />);
    const textbox = getTextbox(component);
    const colors = defaultFlexTokens.color;

    await fireEvent(textbox, 'hoverIn', {});
    await fireEvent(textbox, 'focus', {});

    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(flattenStyle(component.getByTestId('search-box-contents').props.style)).toMatchObject({
      borderColor: colors.strokeNeutralHeavy,
    });
  });
});
