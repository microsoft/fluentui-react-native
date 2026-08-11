import { useFlexTokens } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';

import { buildInteractiveStyles, getSemanticColorValues } from './colorStyles';

describe('buildInteractiveStyles', () => {
  let themeState: ThemeState;
  let colors: ThemeState['tokens']['color'];
  const base = {
    background: 'backgroundBrandHeavy',
    border: 'strokeNeutralTransparent',
    foreground: 'foregroundBrandOnloud',
  } as const;

  beforeEach(() => {
    themeState = {
      tokens: useFlexTokens(),
      highContrast: false,
      themeStyles: {},
    };
    colors = themeState.tokens.color;
  });

  it('automatically creates hovered and pressed styles from Flex overrides', () => {
    const styles = buildInteractiveStyles(themeState, base, {});

    expect(Object.keys(styles)).toEqual(['bg', 'fg', 'bg.hovered', 'fg.hovered', 'bg.pressed', 'fg.pressed']);
    expect(styles.bg).toEqual({
      backgroundColor: colors.backgroundBrandHeavy,
      borderColor: colors.strokeNeutralTransparent,
    });
    expect(styles['bg.hovered']).toEqual({
      backgroundColor: colors.hover.backgroundBrandHeavy,
      borderColor: colors.hover.strokeNeutralTransparent,
    });
    expect(styles['fg.pressed']).toEqual({
      color: colors.pressed.foregroundBrandOnloud,
    });
  });

  it('merges partial state color sets with the base color keys', () => {
    const styles = buildInteractiveStyles(themeState, base, {
      disabled: {
        background: 'backgroundNeutralHeavyDisabled',
        foreground: 'foregroundNeutralDisabled',
      },
    });

    expect(styles['bg.disabled']).toEqual({
      backgroundColor: colors.backgroundNeutralHeavyDisabled,
      borderColor: colors.strokeNeutralTransparent,
    });
    expect(styles['fg.disabled']).toEqual({
      color: colors.foregroundNeutralDisabled,
    });
  });

  it('suppresses automatic hovered and pressed styles when requested', () => {
    const styles = buildInteractiveStyles(themeState, base, {}, false);

    expect(Object.keys(styles)).toEqual(['bg', 'fg']);
  });

  it('caches resolved hovered and pressed semantic colors on the ThemeState', () => {
    const hovered = getSemanticColorValues(themeState, 'hovered');
    const pressed = getSemanticColorValues(themeState, 'pressed');

    expect(getSemanticColorValues(themeState, 'hovered')).toBe(hovered);
    expect(getSemanticColorValues(themeState, 'pressed')).toBe(pressed);
    expect(hovered.backgroundBrandHeavy).toBe(colors.hover.backgroundBrandHeavy);
    expect(pressed.backgroundBrandHeavy).toBe(colors.pressed.backgroundBrandHeavy);
  });
});
