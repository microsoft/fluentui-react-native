/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

import { Avatar } from './avatar';

function renderAvatar(props: React.ComponentProps<typeof Avatar>): Promise<RenderResult> {
  return render(<Avatar {...props} />);
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(component.getByRole('image').props.style);
}

describe('Avatar', () => {
  it('renders the default icon fallback as a decorative image avatar', async () => {
    const component = await renderAvatar({});

    expect(component.queryByRole('image')).toBeNull();
    expect(component.getByText(String.fromCodePoint(0x1f464), { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('renders informative avatars with the image role and label', async () => {
    const component = await renderAvatar({ accessibilityLabel: 'Lydia Mitchelson', initials: 'LM' });
    const root = component.getByRole('image');

    expect(root.props.accessibilityLabel).toBe('Lydia Mitchelson');
    expect(root.props.accessible).toBe(true);
    expect(component.getByText('LM', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('uses the initials mode when initials are provided', async () => {
    const component = await renderAvatar({ accessibilityLabel: 'Lydia Mitchelson', initials: { children: 'lm' } });
    const tokens = useFlexTokens();

    expect(component.getByText('LM', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: tokens.color.backgroundNeutralSoft,
      flexDirection: 'row',
      height: 40,
      justifyContent: 'center',
      minHeight: 40,
      minWidth: 40,
      padding: tokens.spacing.componentBase200,
      width: 40,
    });
  });

  it('defaults empty initials to AB', async () => {
    const component = await renderAvatar({ accessibilityLabel: 'Lydia Mitchelson', initials: {} });

    expect(component.getByText('AB', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('renders the image full bleed without avatar padding', async () => {
    const component = await renderAvatar({
      accessibilityLabel: 'Profile photo',
      image: { source: { uri: 'avatar.png' }, testID: 'avatar-image' },
      size: 56,
    });
    const tokens = useFlexTokens();

    expect(component.getByTestId('avatar-image', { includeHiddenElements: true }).props.resizeMode).toBe('cover');
    expect(StyleSheet.flatten(component.getByTestId('avatar-image', { includeHiddenElements: true }).props.style)).toMatchObject({
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    });
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      height: 56,
      padding: 0,
      width: 56,
    });
  });

  it('renders the active ring without changing layout size', async () => {
    const component = await renderAvatar({
      accessibilityLabel: 'Profile photo',
      activityRing: true,
      initials: 'AB',
      size: 120,
    });
    const tokens = useFlexTokens();

    expect(getRootStyle(component)).toMatchObject({
      outlineColor: tokens.color.strokeBrandLoud,
      outlineOffset: tokens.strokeWidth.thick,
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidth.thicker,
      width: 120,
      height: 120,
    });
  });

  it('applies the correct size and initials scale across the supported sizes', async () => {
    const tokens = useFlexTokens();
    const sizes = [
      [16, tokens.spacing.componentBase50, tokens.fontSize.functionalCaption],
      [20, tokens.spacing.componentBase50, tokens.fontSize.functionalCaption],
      [24, tokens.spacing.componentBase100, tokens.fontSize.functionalCaption],
      [28, tokens.spacing.componentBase150, tokens.fontSize.functionalBodySmall],
      [32, tokens.spacing.componentBase100, tokens.fontSize.functionalBodyMedium],
      [40, tokens.spacing.componentBase200, tokens.fontSize.functionalBodyLarge],
      [56, tokens.spacing.componentBase300, tokens.fontSize.functionalTitleSmall],
      [120, tokens.spacing.layoutBase400, tokens.fontSize.functionalTitleLarge],
    ] as const;

    for (const [size, padding, fontSize] of sizes) {
      const component = await renderAvatar({ accessibilityLabel: `Avatar ${size}`, initials: 'LM', size });
      const expectedInitials = size === 16 ? 'L' : 'LM';
      expect(getRootStyle(component)).toMatchObject({ height: size, minHeight: size, minWidth: size, padding, width: size });
      expect(StyleSheet.flatten(component.getByText(expectedInitials, { includeHiddenElements: true }).props.style)).toMatchObject({
        fontSize,
        lineHeight: fontSize,
      });
    }
  });

  it('prefers image over initials and initials over icon', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const component = await renderAvatar({
      accessibilityLabel: 'Lydia',
      icon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'icon' },
      image: { source: { uri: 'avatar.png' }, testID: 'image' },
      initials: 'LM',
    });

    expect(component.getByTestId('image', { includeHiddenElements: true })).toBeDefined();
    expect(component.queryByTestId('icon')).toBeNull();
    expect(component.queryByText('LM')).toBeNull();
    warn.mockRestore();
  });

  it('keeps user styles last', async () => {
    const component = await renderAvatar({
      accessibilityLabel: 'Lydia',
      initials: 'LM',
      style: { backgroundColor: 'hotpink' },
    });

    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });
});
