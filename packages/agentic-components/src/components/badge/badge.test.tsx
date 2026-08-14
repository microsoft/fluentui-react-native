/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { render } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

import { Badge } from './badge';

const badgeIcon = { fontSource: { codepoint: 0x2022, fontFamily: 'Arial' } } as const;
const trailingIcon = { fontSource: { codepoint: 0x2713, fontFamily: 'Arial' } } as const;

function renderBadge(props: React.ComponentProps<typeof Badge>) {
  return render(<Badge {...props} />);
}

function getRoot(component: Awaited<ReturnType<typeof renderBadge>>) {
  return component.getByRole('image');
}

function getRootStyle(component: Awaited<ReturnType<typeof renderBadge>>): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('Badge', () => {
  it('renders default icon-and-text styling with forwarded icons and label', async () => {
    const component = await renderBadge({
      accessibilityLabel: 'Badge',
      content: 'Badge',
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
    });
    const tokens = useFlexTokens();

    expect(getRoot(component).props.accessible).toBe(true);
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: tokens.color.backgroundBrandSoft,
      borderRadius: tokens.borderRadius.circular,
      minHeight: 20,
      paddingHorizontal: tokens.spacing.componentBase150,
    });
    expect(StyleSheet.flatten(component.getByText('Badge').props.style)).toMatchObject({
      color: tokens.color.foregroundBrandPrimary,
      fontFamily: expect.any(String),
      fontSize: tokens.fontSize.functionalBodySmall,
    });
    expect(StyleSheet.flatten(component.getByTestId('leading-icon').props.style)).toMatchObject({
      color: tokens.color.foregroundBrandPrimary,
      height: 16,
      width: 16,
    });
  });

  it('renders icon-only badges with an accessible image role and ignores the label slot', async () => {
    const component = await renderBadge({
      accessibilityLabel: '3 unread messages',
      layout: 'iconOnly',
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
    });

    expect(getRoot(component).props.accessibilityRole).toBe('image');
    expect(getRoot(component).props.accessibilityLabel).toBe('3 unread messages');
    expect(component.queryByText('Badge')).toBeNull();
    expect(component.getByTestId('leading-icon')).toBeOnTheScreen();
  });

  it('warns when an icon-only badge is missing an accessibility label', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await renderBadge({ layout: 'iconOnly' } as React.ComponentProps<typeof Badge>);

    expect(warn).toHaveBeenCalledWith('Badge: icon-only badges require an accessibilityLabel.');
    warn.mockRestore();
  });

  it('accepts an ARIA label as the accessible name for an icon-only badge', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const component = await renderBadge({ 'aria-label': '3 unread messages', layout: 'iconOnly' });

    expect(getRoot(component).props).toMatchObject({
      accessibilityRole: 'image',
      accessible: true,
      'aria-label': '3 unread messages',
    });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('uses the trailing icon only when requested and applies user styles last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderBadge({
      accessibilityLabel: 'New badge',
      content: { children: 'New', testID: 'content' },
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
      trailingIcon: { ...trailingIcon, testID: 'trailing-icon' },
      trailingIconVisible: true,
      style,
    });

    expect(getRoot(component).children).toHaveLength(3);
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
    expect(component.getByTestId('trailing-icon')).toBeOnTheScreen();
  });

  it.each([
    ['tint', 'brand', 'backgroundBrandSoft', 'foregroundBrandPrimary', 'strokeNeutralTransparent', 0],
    ['tint', 'informative', 'backgroundNeutralSoft', 'foregroundNeutralPrimary', 'strokeNeutralTransparent', 0],
    ['outline', 'danger', 'backgroundNeutralTransparent', 'foregroundDangerPrimary', 'strokeDangerLoud', 1],
    ['outline', 'warning', 'backgroundNeutralTransparent', 'foregroundWarningPrimary', 'strokeWarningLoud', 1],
  ] as const)('resolves %s %s colors', async (appearance, color, backgroundToken, foregroundToken, borderToken, borderWidth) => {
    const tokens = useFlexTokens();
    const component = await renderBadge({
      accessibilityLabel: `${appearance} ${color} badge`,
      appearance,
      color,
      content: 'Badge',
      leadingIcon: badgeIcon,
    });

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color[backgroundToken],
      borderColor: tokens.color[borderToken],
      borderWidth,
    });
    expect(StyleSheet.flatten(component.getByText('Badge').props.style).color).toBe(tokens.color[foregroundToken]);
  });

  it.each([
    ['small', 16, 12, 'componentBase100', 'base100'],
    ['medium', 20, 16, 'componentBase150', 'base200'],
  ] as const)('resolves the %s size and shape', async (size, height, iconSize, paddingToken, roundedRadiusToken) => {
    const tokens = useFlexTokens();
    const rounded = await renderBadge({
      accessibilityLabel: `${size} badge`,
      content: size,
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
      shape: 'rounded',
      size,
    });
    const circular = await renderBadge({
      accessibilityLabel: `${size} badge circular`,
      content: size,
      leadingIcon: { ...badgeIcon, testID: 'leading-icon-circular' },
      shape: 'circular',
      size,
    });

    expect(getRootStyle(rounded)).toMatchObject({
      minHeight: height,
      paddingHorizontal: tokens.spacing[paddingToken],
    });
    expect(StyleSheet.flatten(rounded.getByTestId('leading-icon').props.style).height).toBe(iconSize);
    expect(StyleSheet.flatten(rounded.getByTestId('leading-icon').props.style).width).toBe(iconSize);
    expect(getRootStyle(rounded).borderRadius).toBe(tokens.borderRadius[roundedRadiusToken]);
    expect(getRootStyle(circular).borderRadius).toBe(tokens.borderRadius.circular);
  });

  it('renders content before the trailing icon and does not render a hidden label on icon-only layouts', async () => {
    const component = await renderBadge({
      accessibilityLabel: 'Verified',
      layout: 'iconOnly',
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
      trailingIcon: { ...trailingIcon, testID: 'trailing-icon' },
    });

    expect(component.queryByTestId('trailing-icon')).toBeNull();
    expect(component.queryByText('Badge')).toBeNull();
    expect(getRoot(component).children).toHaveLength(1);
  });
});
