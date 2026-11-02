/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RadiusTrait, Traits } from './traits.types';

type Part = 'root' | 'label';
type Appearance = 'primary' | 'subtle';
type Size = 'small' | 'large';

const validTraits = {
  typography: { label: { lineHeight: 'token', weight: 'regular' } },
  channels: { root: { background: 'interactive', stroke: 'rest' }, label: { foreground: 'interactive' } },
  hover: { base: 'enabled', byAppearance: { subtle: 'suppressed' } },
  focusVisual: 'platform',
  geometry: { root: { radius: { small: 'base200', large: 'base300' }, strokeWidth: { primary: 'thin', subtle: 'none' } } },
} as const satisfies Traits<Part, Appearance, Size>;

const singleValueGeometry = {
  geometry: { root: { radius: 'circular', strokeWidth: 'thin' } },
} as const satisfies Traits<'root', never, never>;

const unknownPart = {
  // @ts-expect-error Facet records accept only declared parts.
  typography: { icon: { lineHeight: 'token', weight: 'regular' } },
} as const satisfies Traits<Part, Appearance, Size>;

const unknownMode = {
  // @ts-expect-error Channel modes are a closed domain.
  channels: { root: { background: 'animated' } },
} as const satisfies Traits<Part, Appearance, Size>;

const incompleteTypography = {
  // @ts-expect-error Typography traits require both line height and weight.
  typography: { label: { lineHeight: 'token' } },
} as const satisfies Traits<Part, Appearance, Size>;

const incompleteScale = {
  // @ts-expect-error A size scale must cover every size.
  geometry: { root: { radius: { small: 'base200' } } },
} as const satisfies Traits<Part, Appearance, Size>;

const scaleWithoutAxis = {
  // @ts-expect-error Components without a size axis accept only a single radius.
  geometry: { root: { radius: { small: 'base200' } } },
} as const satisfies Traits<'root', never, never>;

const unknownAppearance = {
  // @ts-expect-error Hover overrides accept only declared appearances.
  hover: { base: 'enabled', byAppearance: { outline: 'suppressed' } },
} as const satisfies Traits<Part, Appearance, Size>;

const unknownFacet = {
  // @ts-expect-error Traits have no accessibility facet.
  accessibility: { role: 'button' },
} as const satisfies Traits<Part, Appearance, Size>;

// @ts-expect-error Radius roles come from the Flex token tree.
const unknownRadius: RadiusTrait = 'base500';

describe('traits types', () => {
  it('accepts literal constants', () => {
    expect(validTraits.geometry.root.radius.small).toBe('base200');
    expect(singleValueGeometry.geometry.root.radius).toBe('circular');
    expect([
      unknownPart,
      unknownMode,
      incompleteTypography,
      incompleteScale,
      scaleWithoutAxis,
      unknownAppearance,
      unknownFacet,
    ]).toHaveLength(7);
    expect(unknownRadius).toBe('base500');
  });
});
