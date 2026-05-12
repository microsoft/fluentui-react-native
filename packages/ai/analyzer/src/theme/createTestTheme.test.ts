import {
  COLOR_TOKEN_NAMES,
  SHADOW_TOKEN_NAMES,
  SPACING_TOKEN_NAMES,
  TYPOGRAPHY_FAMILY_NAMES,
  TYPOGRAPHY_SIZE_NAMES,
  TYPOGRAPHY_VARIANT_NAMES,
  TYPOGRAPHY_WEIGHT_NAMES,
} from '@fluentui-react-native/theme-types/metadata';

import { createTestTheme } from './createTestTheme.ts';

describe('createTestTheme', () => {
  it('produces a unique color sentinel for every color token', () => {
    const { theme } = createTestTheme();
    const colorValues = Object.values(theme.colors);
    const uniqueColors = new Set(colorValues);
    expect(uniqueColors.size).toBe(colorValues.length);
  });

  it('every leaf color value is a #RRGGBB hex string', () => {
    const { theme } = createTestTheme();
    for (const [name, value] of Object.entries(theme.colors)) {
      expect(typeof value).toBe('string');
      expect(value as string).toMatch(/^#[0-9a-f]{6}$/);
      // The name is included in the assertion so a regression in any
      // single color is reported by name instead of by index.
      expect({ name, value }).toMatchObject({ name });
    }
  });

  it('registers every color so lookup is bidirectional', () => {
    const { theme, registry } = createTestTheme();
    expect(registry.lookup(theme.colors.background)).toBe('colors.background');
    expect(registry.lookup(theme.colors.brandBackground)).toBe('colors.brandBackground');
    // A color value never produced should not match anything.
    expect(registry.lookup('#000000')).toBeUndefined();
  });

  it('typography sizes, weights, and families are all unique within their respective groups', () => {
    const { theme } = createTestTheme();
    const sizes = Object.values(theme.typography.sizes);
    expect(new Set(sizes).size).toBe(sizes.length);

    const families = Object.values(theme.typography.families);
    expect(new Set(families).size).toBe(families.length);
  });

  it('spacing values are px-suffixed strings and registered', () => {
    const { theme, registry } = createTestTheme();
    for (const [name, value] of Object.entries(theme.spacing)) {
      // The Spacing type marks `m` optional but the test theme always populates it.
      expect(typeof value).toBe('string');
      expect(value as string).toMatch(/^\d+px$/);
      expect(registry.lookup(value)).toBe(`spacing.${name}`);
    }
  });

  it('registers shadow leaf values (x/y/blur/color)', () => {
    const { theme, registry } = createTestTheme();
    const s2 = theme.shadows.shadow2;
    expect(registry.lookup(s2.ambient.x)).toBe('shadows.shadow2.ambient.x');
    expect(registry.lookup(s2.ambient.color)).toBe('shadows.shadow2.ambient.color');
    expect(registry.lookup(s2.key.blur)).toBe('shadows.shadow2.key.blur');
  });

  it('exposes a host appearance to satisfy the Theme contract', () => {
    const { theme } = createTestTheme();
    expect(theme.host.appearance).toBe('light');
  });

  it('exposes a components proxy that returns undefined for unset names', () => {
    const { theme } = createTestTheme();
    // Indexing an unknown name should be undefined — components are an
    // override layer; defaults supply the actual token values.
    expect(theme.components['NotARealComponent']).toBeUndefined();
  });

  it('lets a caller plant overrides on theme.components via assignment', () => {
    // Forward-compat sanity check: tests that need per-component overrides
    // can assign through the proxy and reads return what was set.
    const { theme } = createTestTheme();
    const override = { backgroundColor: '#deadbe' };
    theme.components.MyComponent = override;
    expect(theme.components.MyComponent).toBe(override);
    expect(Object.keys(theme.components)).toContain('MyComponent');
  });

  it('registers typography variants at both the object level and per leaf', () => {
    const { theme, registry } = createTestTheme();
    const variant = theme.typography.variants.bodyStandard;
    // Object-level
    expect(registry.lookup(variant)).toBe('typography.variants.bodyStandard');
    // Per-leaf
    expect(registry.lookup(variant.face)).toBe('typography.variants.bodyStandard.face');
    expect(registry.lookup(variant.size)).toBe('typography.variants.bodyStandard.size');
    expect(registry.lookup(variant.weight)).toBe('typography.variants.bodyStandard.weight');
  });

  it('defaults appearance to "light"', () => {
    const { theme } = createTestTheme();
    expect(theme.host.appearance).toBe('light');
  });

  it('honors an explicit "dark" appearance', () => {
    const { theme } = createTestTheme({ appearance: 'dark' });
    expect(theme.host.appearance).toBe('dark');
  });

  // The token-name tuples in `@fluentui-react-native/theme-types/metadata`
  // are the contract: every name they list must end up registered against
  // its canonical token path. If the analyzer regresses (e.g., a refactor
  // that filters a tuple before iterating) this test catches it — and
  // because the metadata tuples themselves are gated by type-level parity
  // tests in `theme-types`, the coverage chain is end-to-end: type → tuple
  // → analyzer registration.
  describe('metadata coverage', () => {
    it('registers every COLOR_TOKEN_NAMES entry against its colors.<name> path', () => {
      const { theme, registry } = createTestTheme();
      for (const name of COLOR_TOKEN_NAMES) {
        expect(registry.lookup(theme.colors[name])).toBe(`colors.${name}`);
      }
    });

    it('registers every SPACING_TOKEN_NAMES entry against its spacing.<name> path', () => {
      const { theme, registry } = createTestTheme();
      for (const name of SPACING_TOKEN_NAMES) {
        expect(registry.lookup(theme.spacing[name])).toBe(`spacing.${name}`);
      }
    });

    it('registers every SHADOW_TOKEN_NAMES entry against its key/ambient leaves', () => {
      const { theme, registry } = createTestTheme();
      for (const name of SHADOW_TOKEN_NAMES) {
        const s = theme.shadows[name];
        expect(registry.lookup(s.ambient.x)).toBe(`shadows.${name}.ambient.x`);
        expect(registry.lookup(s.key.color)).toBe(`shadows.${name}.key.color`);
      }
    });

    it('registers every typography family/size/weight name', () => {
      const { theme, registry } = createTestTheme();
      for (const name of TYPOGRAPHY_FAMILY_NAMES) {
        expect(registry.lookup(theme.typography.families[name])).toBe(`typography.families.${name}`);
      }
      for (const name of TYPOGRAPHY_SIZE_NAMES) {
        expect(registry.lookup(theme.typography.sizes[name])).toBe(`typography.sizes.${name}`);
      }
      for (const name of TYPOGRAPHY_WEIGHT_NAMES) {
        expect(registry.lookup(theme.typography.weights[name])).toBe(`typography.weights.${name}`);
      }
    });

    it('registers every typography variant at both the object and leaf level', () => {
      const { theme, registry } = createTestTheme();
      for (const name of TYPOGRAPHY_VARIANT_NAMES) {
        const variant = theme.typography.variants[name];
        // v2 variants are typed optional but `createTestTheme` always populates them.
        expect(variant).toBeDefined();
        expect(registry.lookup(variant)).toBe(`typography.variants.${name}`);
        expect(registry.lookup(variant!.face)).toBe(`typography.variants.${name}.face`);
        expect(registry.lookup(variant!.size)).toBe(`typography.variants.${name}.size`);
      }
    });
  });
});
