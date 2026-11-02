import type { FlexTokens } from '../flex/tokens.types';

/*
 * Component traits are reviewed styling policy that each component declares during spec building, in a private
 * `spec/traits.ts` constant (`as const satisfies Traits<…>`) linked from its SPEC frontmatter. Styling helpers read the
 * facets while building cached theme definitions. These traits are unrelated to iOS `accessibilityTraits`: they never
 * describe accessibility semantics.
 *
 * Omitting a facet means the component does not consume it, never that a default applies.
 */

/** A functional text role; it selects both the font size and the line height token. */
export type FunctionalTypographyRole = Extract<keyof FlexTokens['fontSize'] & keyof FlexTokens['lineHeight'], `functional${string}`>;

/**
 * How a text part uses its role's line height: `token` paints it, `omit` leaves it out, and `layout-only` keeps it out of
 * the text style because the component uses it for layout itself.
 */
export type LineHeightMode = 'token' | 'omit' | 'layout-only';

/** The weight a text part paints; `unowned` leaves weight to the caller and platform. */
export type WeightMode = 'regular' | 'semibold' | 'unowned';

export type TypographyTraits = {
  readonly lineHeight: LineHeightMode;
  readonly weight: WeightMode;
};

/**
 * How a part paints one color property: `unowned` does not paint it, `rest` paints a static value, `interactive` selects
 * hover and pressed values from the token envelope, and `authored` means the component authors its own states.
 */
export type ChannelMode = 'unowned' | 'rest' | 'interactive' | 'authored';

export type ChannelTraits = {
  readonly background?: ChannelMode;
  readonly foreground?: ChannelMode;
  readonly stroke?: ChannelMode;
};

/**
 * Hover paint: `enabled` paints hover values, `suppressed` keeps rest paint while hovered, and `component` means the
 * component owns a specific hover hierarchy. Suppression changes paint only; hover callbacks and behavior remain.
 */
export type HoverMode = 'enabled' | 'suppressed' | 'component';

export type HoverTraits<Variant extends string> = {
  readonly base: HoverMode;
  readonly byAppearance?: { readonly [V in Variant]?: HoverMode };
};

/** `platform` follows the platform focus-visual policy; `custom-always-visible` always draws the component's own ring. */
export type FocusVisualMode = 'platform' | 'custom-always-visible';

/** A Flex radius role, or `none` for square corners. */
export type RadiusTrait = keyof FlexTokens['borderRadius'] | 'none';

/** A Flex stroke width role, or `none` for no stroke. */
export type StrokeWidthTrait = keyof FlexTokens['strokeWidth'] | 'none';

/** One value, or one value for every member of an axis. An axis of `never` allows only a single value. */
export type TraitScale<Axis extends string, Value extends string> = [Axis] extends [never]
  ? Value
  : Value | { readonly [A in Axis]: Value };

/** Radius scales by size; stroke width scales by variant. Structural overrides such as shape stay in code. */
export type GeometryTraits<Size extends string, Variant extends string> = {
  readonly radius?: TraitScale<Size, RadiusTrait>;
  readonly strokeWidth?: TraitScale<Variant, StrokeWidthTrait>;
};

/**
 * A component's traits. `Part` names the styled parts, `Variant` is the appearance axis, and `Size` is the size axis.
 * Every argument is required; pass `never` for an axis the component lacks.
 */
export type Traits<Part extends string, Variant extends string, Size extends string> = {
  readonly typography?: { readonly [P in Part]?: TypographyTraits };
  readonly channels?: { readonly [P in Part]?: ChannelTraits };
  readonly hover?: HoverTraits<Variant>;
  readonly focusVisual?: FocusVisualMode;
  readonly geometry?: { readonly [P in Part]?: GeometryTraits<Size, Variant> };
};
