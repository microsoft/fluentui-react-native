/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

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
    const tokens = defaultFlexTokens;

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
    const tokens = defaultFlexTokens;

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
    const tokens = defaultFlexTokens;

    expect(getRootStyle(component)).toMatchObject({
      width: 120,
      height: 120,
    });
    expect(StyleSheet.flatten(component.getByTestId('avatar-activity-ring', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: tokens.color.strokeBrandLoud,
      borderRadius: tokens.borderRadius.circular,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thicker,
      bottom: -(tokens.strokeWidth.thick + tokens.strokeWidth.thicker),
      left: -(tokens.strokeWidth.thick + tokens.strokeWidth.thicker),
      right: -(tokens.strokeWidth.thick + tokens.strokeWidth.thicker),
      top: -(tokens.strokeWidth.thick + tokens.strokeWidth.thicker),
      position: 'absolute',
    });
  });

  it.each([16, 20, 24, 28, 32, 40, 56, 120] as const)(
    'keeps the same decorative ring mounted in every content mode at size %s',
    async (size) => {
      const tokens = defaultFlexTokens;
      const width = size === 16 ? tokens.strokeWidth.thin : size >= 56 ? tokens.strokeWidth.thicker : tokens.strokeWidth.thick;
      const offset = size === 120 ? tokens.strokeWidth.thick : tokens.strokeWidth.thin;
      const modes: React.ComponentProps<typeof Avatar>[] = [
        { initials: 'AB' },
        { icon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } },
        { image: { source: { uri: 'avatar.png' } } },
      ];

      for (const content of modes) {
        const props = { ...content, accessibilityLabel: `Avatar ${size}`, size };
        const component = await renderAvatar(props);
        const ring = component.getByTestId('avatar-activity-ring', { includeHiddenElements: true });
        const rootStyle = getRootStyle(component);
        expect(ring.props).toMatchObject({
          accessibilityElementsHidden: true,
          accessible: false,
          collapsable: false,
          focusable: false,
          importantForAccessibility: 'no-hide-descendants',
          pointerEvents: 'none',
        });
        expect(StyleSheet.flatten(ring.props.style)).toMatchObject({
          borderColor: tokens.color.strokeBrandLoud,
          borderWidth: width,
          bottom: -(offset + width),
          left: -(offset + width),
          opacity: 0,
          right: -(offset + width),
          top: -(offset + width),
        });
        for (const key of ['outlineColor', 'outlineOffset', 'outlineStyle', 'outlineWidth']) {
          expect(rootStyle).not.toHaveProperty(key);
        }

        await component.rerender(<Avatar {...props} activityRing />);
        expect(component.getByTestId('avatar-activity-ring', { includeHiddenElements: true })).toBe(ring);
        expect(StyleSheet.flatten(ring.props.style).opacity).toBeUndefined();
        expect(getRootStyle(component)).toEqual(rootStyle);
        expect(component.getAllByRole('image')).toHaveLength(1);

        await component.rerender(<Avatar {...props} activityRing={false} />);
        expect(component.getByTestId('avatar-activity-ring', { includeHiddenElements: true })).toBe(ring);
        expect(StyleSheet.flatten(ring.props.style).opacity).toBe(0);
        await component.unmount();
      }
    },
  );

  it('applies the correct size and initials scale across the supported sizes', async () => {
    const tokens = defaultFlexTokens;
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
      const initialsStyle = StyleSheet.flatten(component.getByText(expectedInitials, { includeHiddenElements: true }).props.style);
      expect(initialsStyle).toMatchObject({
        fontSize,
        includeFontPadding: false,
        position: 'absolute',
      });
      expect(initialsStyle.lineHeight).toBeUndefined();
      expect(initialsStyle.height).toBeUndefined();
      expect(initialsStyle.textAlignVertical).toBeUndefined();
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

  it('preserves explicit initials line metrics after intrinsic defaults', async () => {
    const component = await renderAvatar({
      accessibilityLabel: 'Initials',
      initials: { children: 'AB', style: { lineHeight: 24 } },
    });

    expect(StyleSheet.flatten(component.getByText('AB', { includeHiddenElements: true }).props.style).lineHeight).toBe(24);
  });
});
