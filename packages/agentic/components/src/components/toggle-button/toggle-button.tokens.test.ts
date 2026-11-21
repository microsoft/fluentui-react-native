import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { defaultFlexTokens, defaultResolvedThemeAppearance } from '@fluentui-react-native/design/testing';
import { toggleButtonTokenDefinition } from './toggle-button.styles';
import type { ToggleButtonProps } from './toggle-button.types';

type Accepts<Props extends ToggleButtonProps> = Props;
type Absent<Key extends never> = Key;
type IconProps = { fontSource: { codepoint: number } };

export type NoLegacyButtonProps = Absent<Extract<'appearance' | 'icon' | 'selectedIcon' | 'iconPosition', keyof ToggleButtonProps>>;
export type LabeledToggle = Accepts<{ content: string; selected: false; trailingIcon: IconProps; selectedTrailingIcon: IconProps }>;
export type IconOnlyToggle = Accepts<{ leadingIcon: IconProps; accessibilityLabel: string; defaultSelected: true }>;
// @ts-expect-error Icon-only toggles need an accessible name even when unselected.
export type UnnamedIcon = Accepts<{ leadingIcon: IconProps }>;
// @ts-expect-error A trailing icon is not the icon-only visual.
export type TrailingOnly = Accepts<{ trailingIcon: IconProps; accessibilityLabel: string }>;
// @ts-expect-error A selected trailing icon cannot introduce a second visual in icon-only layout.
export type TwoIconOnly = Accepts<{ leadingIcon: IconProps; selectedTrailingIcon: IconProps; accessibilityLabel: string }>;

it('leaves unselected Button chrome alone and changes the selected fill without dropping the strong label when disabled', () => {
  const theme = { appearance: defaultResolvedThemeAppearance, highContrast: false, themeStyles: {}, tokens: defaultFlexTokens };
  const tokens = getComponentTokens(theme, toggleButtonTokenDefinition);
  expect(resolveTokenStates(tokens.root, { selected: false, highContrast: false, visualState: 'hovered' }).style).toEqual({});
  expect(resolveTokenStates(tokens.root, { selected: true, highContrast: false, visualState: 'hovered' }).style.backgroundColor).toBe(
    theme.tokens.color.backgroundNeutralSoft.hover,
  );
  const disabled = { selected: true, highContrast: true, visualState: 'disabled' } as const;
  expect(resolveTokenStates(tokens.root, { ...disabled, visualState: 'rest' }).style.borderColor).toBe(
    theme.tokens.color.strokeNeutralLoud.rest,
  );
  expect(resolveTokenStates(tokens.root, disabled).style.borderColor).toBe('transparent');
  expect(resolveTokenStates(tokens.root, disabled).style.backgroundColor).toBe(theme.tokens.color.backgroundNeutralSubtleDisabled.rest);
  expect(resolveTokenStates(tokens.content, disabled).style).toMatchObject({
    color: theme.tokens.color.foregroundNeutralDisabled.rest,
    fontWeight: theme.tokens.fontWeight.functionalSemibold,
  });
});
