import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import { render } from '../../common/renderWithTheme';
import { DestructiveButton } from './destructive-button';

const { color } = defaultFlexTokens;

describe('DestructiveButton', () => {
  it.each([
    ['subtle', color.backgroundNeutralTransparent.rest, color.backgroundDangerSubtle, color.foregroundDangerPrimary],
    ['primary', color.backgroundDangerLoud.rest, color.backgroundDangerLoud, color.foregroundDangerOnloud],
  ] as const)('applies %s danger chrome and keeps disabled colors neutral', async (appearance, rest, background, foreground) => {
    const tree = await render(<DestructiveButton appearance={appearance} content="Remove saved item" />);
    const root = () => tree.getByRole('button', { name: 'Remove saved item' });
    const backgroundColor = () => StyleSheet.flatten(root().props.style).backgroundColor;
    const text = () => tree.getByText('Remove saved item', { includeHiddenElements: true });
    expect(backgroundColor()).toBe(rest);
    expect(StyleSheet.flatten(text().props.style).color).toBe(foreground.rest);
    await fireEvent(root(), 'hoverIn', {});
    expect(backgroundColor()).toBe(background.hover);
    await fireEvent(root(), 'pressIn', {});
    expect(backgroundColor()).toBe(background.pressed);

    await tree.rerender(<DestructiveButton appearance={appearance} content="Remove saved item" disabled />);
    expect(root()).toBeDisabled();
    expect(backgroundColor()).toBe(
      appearance === 'primary' ? color.backgroundNeutralHeavyDisabled.rest : color.backgroundNeutralTransparent.rest,
    );
    expect(StyleSheet.flatten(text().props.style).color).toBe(color.foregroundNeutralDisabled.rest);
  });

  it('keeps an icon-only command named on the target, invokes once and suppresses disabled presses', async () => {
    const onPress = jest.fn();
    const leadingIcon = { fontSource: { codepoint: 0xd7 }, accessibilityLabel: 'Decorative mark', accessibilityRole: 'image' as const };
    const tree = await render(<DestructiveButton leadingIcon={leadingIcon} accessibilityLabel="Remove saved item" onPress={onPress} />);
    const target = () => tree.getByRole('button', { name: 'Remove saved item' });
    expect(tree.queryByRole('image')).toBeNull();
    expect(target().props.accessibilityState.checked).toBeUndefined();
    await fireEvent.press(target());
    expect(onPress).toHaveBeenCalledTimes(1);
    await fireEvent(target(), 'accessibilityTap');
    expect(onPress).toHaveBeenCalledTimes(2);
    expect(onPress).toHaveBeenLastCalledWith();

    await tree.rerender(<DestructiveButton leadingIcon={leadingIcon} accessibilityLabel="Remove saved item" onPress={onPress} disabled />);
    expect(target().props.onAccessibilityTap).toBeUndefined();
    await fireEvent.press(target());
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('does not expose a command when its only nominal name is blank text', async () => {
    const leadingIcon = { fontSource: { codepoint: 0xd7 } };
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const tree = await render(<DestructiveButton content="  " leadingIcon={leadingIcon} />);
      expect(tree.queryByRole('button', { includeHiddenElements: true })).toBeNull();
      expect(warn).toHaveBeenCalledWith('Button: icon-only buttons require an accessibilityLabel that describes the action.');

      await tree.rerender(<DestructiveButton content="" leadingIcon={leadingIcon} accessibilityLabel="Remove saved item" />);
      expect(tree.getByRole('button', { name: 'Remove saved item' })).toBeOnTheScreen();

      await tree.rerender(<DestructiveButton content="" accessibilityLabel="Remove saved item" />);
      expect(tree.queryByRole('button', { includeHiddenElements: true })).toBeNull();
    } finally {
      warn.mockRestore();
    }
  });
});
