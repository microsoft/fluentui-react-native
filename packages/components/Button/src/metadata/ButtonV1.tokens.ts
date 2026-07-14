import type { ComponentTokens } from '@fluentui-react-native/concepts';

/**
 * Cross-platform default token tree for `ButtonV1`.
 *
 * Merges three source files literally into one layered artifact:
 *
 * - `Button/src/ButtonTokens.ts` — layout / size / shape tokens
 *   (mostly globals and arithmetic on globals).
 * - `Button/src/ButtonColorTokens.ts` — theme-derived colour tokens
 *   per state layer and per appearance.
 * - `Button/src/ButtonFontTokens.ts` — typography variants per size.
 *
 * Platform overrides (`.android.ts`, `.ios.ts`, `.win32.ts`,
 * `.macos.ts`, `.windows.ts`) are NOT captured here — they live in
 * sibling `.tokens.<platform>.ts` artifacts (sparse, only deltas).
 * Consumers compose by passing `[buttonV1Tokens, buttonV1TokensWin32]`
 * (etc.) to `resolveTokensForState`.
 */
export const buttonV1Tokens = {
  component: 'Button',
  platform: 'default',
  layers: {
    // ── ButtonColorTokens.ts: base ────────────────────────────────────
    backgroundColor: { kind: 'theme', path: 'colors.buttonBackground' },
    color: { kind: 'theme', path: 'colors.buttonText' },
    borderColor: { kind: 'theme', path: 'colors.buttonBorder' },
    iconColor: { kind: 'theme', path: 'colors.buttonIcon' },

    // ── ButtonColorTokens.ts: state layers ────────────────────────────
    disabled: {
      backgroundColor: { kind: 'theme', path: 'colors.defaultDisabledBackground' },
      color: { kind: 'theme', path: 'colors.defaultDisabledContent' },
      borderColor: { kind: 'theme', path: 'colors.defaultDisabledBorder' },
      iconColor: { kind: 'theme', path: 'colors.defaultDisabledIcon' },
    },
    hovered: {
      backgroundColor: { kind: 'theme', path: 'colors.defaultHoveredBackground' },
      color: { kind: 'theme', path: 'colors.defaultHoveredContent' },
      borderColor: { kind: 'theme', path: 'colors.defaultHoveredBorder' },
      iconColor: { kind: 'theme', path: 'colors.defaultHoveredIcon' },
    },
    pressed: {
      backgroundColor: { kind: 'theme', path: 'colors.defaultPressedBackground' },
      color: { kind: 'theme', path: 'colors.defaultPressedContent' },
      borderColor: { kind: 'theme', path: 'colors.defaultPressedBorder' },
      iconColor: { kind: 'theme', path: 'colors.defaultPressedIcon' },
    },
    focused: {
      backgroundColor: { kind: 'theme', path: 'colors.defaultFocusedBackground' },
      color: { kind: 'theme', path: 'colors.defaultFocusedContent' },
      borderColor: { kind: 'theme', path: 'colors.defaultFocusedBorder' },
      // Source uses `icon` (not `iconColor`) for the focused layer —
      // mirrored verbatim because changing the key would mask a real
      // bug or a real intent.
      icon: { kind: 'theme', path: 'colors.defaultFocusedIcon' },
    },

    // ── ButtonColorTokens.ts: appearance branches ─────────────────────
    primary: {
      backgroundColor: { kind: 'theme', path: 'colors.brandBackground' },
      color: { kind: 'theme', path: 'colors.neutralForegroundOnColor' },
      borderColor: { kind: 'theme', path: 'colors.brandStroke1' },
      iconColor: { kind: 'theme', path: 'colors.neutralForegroundOnColor' },
      disabled: {
        backgroundColor: { kind: 'theme', path: 'colors.brandBackgroundDisabled' },
        color: { kind: 'theme', path: 'colors.neutralForegroundDisabled1' },
        iconColor: { kind: 'theme', path: 'colors.neutralForegroundDisabled1' },
      },
      pressed: {
        backgroundColor: { kind: 'theme', path: 'colors.brandBackgroundPressed' },
        color: { kind: 'theme', path: 'colors.neutralForegroundOnColor' },
        iconColor: { kind: 'theme', path: 'colors.neutralForegroundOnColor' },
      },
      focused: {
        backgroundColor: { kind: 'theme', path: 'colors.brandBackground' },
        color: { kind: 'theme', path: 'colors.neutralForegroundOnColor' },
        borderColor: { kind: 'theme', path: 'colors.strokeFocus2' },
        iconColor: { kind: 'theme', path: 'colors.neutralForegroundOnColor' },
      },
    },
    subtle: {
      backgroundColor: { kind: 'theme', path: 'colors.ghostBackground' },
      color: { kind: 'theme', path: 'colors.ghostContent' },
      borderColor: { kind: 'theme', path: 'colors.ghostBorder' },
      iconColor: { kind: 'theme', path: 'colors.ghostIcon' },
      disabled: {
        color: { kind: 'theme', path: 'colors.ghostDisabledContent' },
        borderColor: { kind: 'theme', path: 'colors.ghostDisabledBorder' },
        backgroundColor: { kind: 'theme', path: 'colors.ghostDisabledBackground' },
        iconColor: { kind: 'theme', path: 'colors.ghostDisabledIcon' },
      },
      hovered: {
        backgroundColor: { kind: 'theme', path: 'colors.ghostHoveredBackground' },
        color: { kind: 'theme', path: 'colors.ghostHoveredContent' },
        borderColor: { kind: 'theme', path: 'colors.ghostHoveredBorder' },
        iconColor: { kind: 'theme', path: 'colors.ghostHoveredIcon' },
      },
      pressed: {
        backgroundColor: { kind: 'theme', path: 'colors.ghostPressedBackground' },
        borderColor: { kind: 'theme', path: 'colors.ghostPressedBorder' },
        color: { kind: 'theme', path: 'colors.ghostPressedContent' },
        // `icon` (not `iconColor`) here too — mirrors source.
        icon: { kind: 'theme', path: 'colors.ghostPressedIcon' },
      },
      focused: {
        borderColor: { kind: 'theme', path: 'colors.ghostFocusedBorder' },
        backgroundColor: { kind: 'theme', path: 'colors.ghostFocusedBackground' },
        color: { kind: 'theme', path: 'colors.ghostFocusedContent' },
        icon: { kind: 'theme', path: 'colors.ghostFocusedIcon' },
      },
    },

    // ── ButtonTokens.ts: size branches ────────────────────────────────
    block: {
      width: { kind: 'constant', value: '100%' },
    },
    small: {
      padding: {
        kind: 'expression',
        op: '-',
        operands: [
          { kind: 'global', path: 'size40' },
          { kind: 'global', path: 'stroke.width10' },
        ],
      },
      borderWidth: { kind: 'global', path: 'stroke.width10' },
      iconSize: { kind: 'constant', value: 16 },
      focused: {
        borderWidth: { kind: 'constant', value: 0 },
        padding: { kind: 'global', path: 'size40' },
      },
      hasContent: {
        minWidth: { kind: 'constant', value: 64 },
        minHeight: { kind: 'constant', value: 24 },
        paddingHorizontal: {
          kind: 'expression',
          op: '-',
          operands: [
            { kind: 'global', path: 'size80' },
            { kind: 'global', path: 'stroke.width10' },
          ],
        },
        // From ButtonFontTokens.ts (small.hasContent.variant).
        variant: { kind: 'constant', value: 'secondaryStandard' },
        hasIconAfter: {
          spacingIconContentAfter: { kind: 'global', path: 'size40' },
        },
        hasIconBefore: {
          spacingIconContentBefore: { kind: 'global', path: 'size40' },
        },
        focused: {
          paddingHorizontal: { kind: 'global', path: 'size80' },
        },
      },
    },
    medium: {
      padding: {
        kind: 'expression',
        op: '-',
        operands: [
          { kind: 'global', path: 'size60' },
          { kind: 'global', path: 'stroke.width10' },
        ],
      },
      borderWidth: { kind: 'global', path: 'stroke.width10' },
      iconSize: { kind: 'constant', value: 16 },
      focused: {
        borderWidth: { kind: 'constant', value: 0 },
        padding: { kind: 'global', path: 'size60' },
      },
      hasContent: {
        minWidth: { kind: 'constant', value: 96 },
        paddingHorizontal: {
          kind: 'expression',
          op: '-',
          operands: [
            { kind: 'global', path: 'size120' },
            { kind: 'global', path: 'stroke.width10' },
          ],
        },
        // From ButtonFontTokens.ts (medium.hasContent.variant).
        variant: { kind: 'constant', value: 'bodySemibold' },
        hasIconAfter: {
          spacingIconContentAfter: { kind: 'global', path: 'size60' },
        },
        hasIconBefore: {
          spacingIconContentBefore: { kind: 'global', path: 'size60' },
        },
        focused: {
          paddingHorizontal: { kind: 'global', path: 'size120' },
        },
      },
    },
    large: {
      padding: {
        kind: 'expression',
        op: '-',
        operands: [
          { kind: 'global', path: 'size80' },
          { kind: 'global', path: 'stroke.width10' },
        ],
      },
      borderWidth: { kind: 'global', path: 'stroke.width10' },
      iconSize: { kind: 'constant', value: 20 },
      // ButtonFontTokens.ts assigns `variant: 'subheaderSemibold'`
      // directly under `large` (not nested in `hasContent`).
      variant: { kind: 'constant', value: 'subheaderSemibold' },
      focused: {
        borderWidth: { kind: 'constant', value: 0 },
        padding: { kind: 'global', path: 'size80' },
      },
      hasContent: {
        minWidth: { kind: 'constant', value: 96 },
        paddingHorizontal: {
          kind: 'expression',
          op: '-',
          operands: [
            { kind: 'global', path: 'size160' },
            { kind: 'global', path: 'stroke.width10' },
          ],
        },
        hasIconAfter: {
          spacingIconContentAfter: { kind: 'global', path: 'size60' },
        },
        hasIconBefore: {
          spacingIconContentBefore: { kind: 'global', path: 'size60' },
        },
        focused: {
          paddingHorizontal: { kind: 'global', path: 'size160' },
        },
      },
    },

    // ── ButtonTokens.ts: shape branches ───────────────────────────────
    rounded: {
      borderRadius: { kind: 'global', path: 'corner.radius40' },
    },
    circular: {
      borderRadius: { kind: 'global', path: 'corner.radiusCircular' },
    },
    square: {
      borderRadius: { kind: 'global', path: 'corner.radiusNone' },
    },
  },
} as const satisfies ComponentTokens;
