type MappingViolation = {
  rule: string;
  path: string;
  expected: unknown;
  actual: unknown;
};

type MappingInputs = {
  mapping: {
    schemaVersion: number;
    reverse: {
      interactionFallback: string;
      canonical: Record<
        string,
        {
          source: string;
          omitted: string[];
          reason: string;
        }
      >;
      transforms: Record<string, string>;
    };
    tokens: Record<string, unknown>;
  };
  nonFluentValues: Map<string, string>;
  reverseProjection: Record<string, { source: string; fallback?: string; transform?: string }>;
  supportedTypePaths: Set<string>;
  themeProjection: Record<string, string>;
  unsupportedTypePaths: Set<string>;
};

type MappingChecks = {
  assertMappingsConsistent(): void;
  createMappingProjections(
    mapping: MappingInputs['mapping'],
    supportedTypePaths: Set<string>,
  ): {
    themeProjection: MappingInputs['themeProjection'];
    reverseProjection: MappingInputs['reverseProjection'];
    violations: MappingViolation[];
  };
  formatMappingViolations(violations: MappingViolation[]): string;
  loadMappingInputs(): MappingInputs;
  validateMappingInputs(inputs: MappingInputs): MappingViolation[];
};

const { assertMappingsConsistent, createMappingProjections, formatMappingViolations, loadMappingInputs, validateMappingInputs } =
  jest.requireActual<MappingChecks>('../../../scripts/token-mappings/check-mappings.cjs');

function cloneInputs(inputs: MappingInputs): MappingInputs {
  return structuredClone(inputs);
}

describe('Flex token mapping consistency', () => {
  const inputs = loadMappingInputs();

  it('keeps the checked-in mapping artifacts consistent', () => {
    expect(assertMappingsConsistent).not.toThrow();
  });

  it('deterministically derives both projections from the YAML source', () => {
    const generated = createMappingProjections(inputs.mapping, inputs.supportedTypePaths);

    expect(generated.violations).toEqual([]);
    expect(generated.themeProjection).toEqual(inputs.themeProjection);
    expect(generated.reverseProjection).toEqual(inputs.reverseProjection);
  });

  it('reports a conflicting Theme projection with both values', () => {
    const changed = cloneInputs(inputs);
    changed.themeProjection['borderRadius.base200'] = 'components.Button.tokens.changed';

    const violations = validateMappingInputs(changed);

    expect(violations).toContainEqual({
      rule: 'theme-projection',
      path: 'borderRadius.base200',
      expected: 'components.Button.tokens.borderRadius',
      actual: 'components.Button.tokens.changed',
    });
    expect(formatMappingViolations(violations)).toContain(
      '[theme-projection] borderRadius.base200: expected "components.Button.tokens.borderRadius"; actual "components.Button.tokens.changed"',
    );
  });

  it('reports an unmapped destination missing from nonFluentFlexTokens', () => {
    const changed = cloneInputs(inputs);
    changed.nonFluentValues.delete('fontFamily.contentEditorial');

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'non-fluent-coverage',
      path: 'fontFamily.contentEditorial',
      expected: 'a value in nonFluentFlexTokens',
      actual: '<missing>',
    });
  });

  it('rejects Theme-backed destinations in nonFluentFlexTokens', () => {
    const changed = cloneInputs(inputs);
    changed.nonFluentValues.set('borderRadius.base200', 'cornerRadius40');

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'non-fluent-coverage',
      path: 'borderRadius.base200',
      expected: '<absent because the destination has a Fluent token source>',
      actual: 'cornerRadius40',
    });
  });

  it('rejects interaction fallbacks when the rest destination is Theme-backed', () => {
    const changed = cloneInputs(inputs);
    changed.nonFluentValues.set('color.hover.backgroundBrandSoft', "'#000000'");

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'interaction-fallback',
      path: 'color.hover.backgroundBrandSoft',
      expected: 'color.backgroundBrandSoft to be absent from flex-from-theme.json',
      actual: 'colors.brandBackground2',
    });
  });

  it('rejects YAML destinations that the token types do not declare', () => {
    const changed = cloneInputs(inputs);
    changed.mapping.tokens['spacing.notARealToken'] = {
      generic: '--gnrc-spacing-not-a-real-token',
    };

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'flex-token-type',
      path: 'spacing.notARealToken',
      expected: 'a path declared by FlexTokens or UnsupportedFlexTokens',
      actual: '<undeclared>',
    });
  });

  it('rejects Theme projections on unsupported destinations', () => {
    const changed = cloneInputs(inputs);
    (changed.mapping.tokens['letterSpacing.contentCode'] as Record<string, unknown>)['furn-theme'] = 'typography.letterSpacing.code';

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'theme-projection',
      path: 'letterSpacing.contentCode',
      expected: '<absent because the destination is unsupported>',
      actual: 'typography.letterSpacing.code',
    });
  });

  it('requires an explicit canonical source for every reverse collision', () => {
    const changed = cloneInputs(inputs);
    delete changed.mapping.reverse.canonical['colors.black'];

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'reverse-canonical',
      path: 'colors.black',
      expected: 'an explicit canonical choice for the ambiguous Theme path',
      actual: '<missing>',
    });
  });

  it('rejects canonical sources outside the collision candidates', () => {
    const changed = cloneInputs(inputs);
    changed.mapping.reverse.canonical['colors.black'].source = 'color.notARealToken';

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'reverse-canonical',
      path: 'colors.black',
      expected: 'one of ["color.expressionAchromaticHeavy","color.fixedBlack","color.shadow"]',
      actual: 'color.notARealToken',
    });
  });

  it('requires every non-canonical candidate and an omission reason', () => {
    const changed = cloneInputs(inputs);
    changed.mapping.reverse.canonical['colors.black'].omitted = ['color.expressionAchromaticHeavy'];
    changed.mapping.reverse.canonical['colors.white'].reason = '';

    const violations = validateMappingInputs(changed);

    expect(violations).toContainEqual({
      rule: 'reverse-omission',
      path: 'colors.black',
      expected: ['color.expressionAchromaticHeavy', 'color.shadow'],
      actual: ['color.expressionAchromaticHeavy'],
    });
    expect(violations).toContainEqual({
      rule: 'reverse-omission',
      path: 'colors.white',
      expected: 'a non-empty omission reason',
      actual: '',
    });
  });

  it('validates generated interaction fallbacks against declared Flex paths', () => {
    const changed = cloneInputs(inputs);
    changed.supportedTypePaths.delete('color.backgroundBrandHeavy');

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'reverse-fallback',
      path: 'colors.brandBackgroundHover',
      expected: 'a declared Flex rest path',
      actual: 'color.backgroundBrandHeavy',
    });
  });

  it('rejects unknown reverse transforms', () => {
    const changed = cloneInputs(inputs);
    changed.mapping.reverse.transforms['colors.black'] = 'notARealTransform';

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'reverse-transform',
      path: 'colors.black',
      expected: ['identity', 'numberToPx'],
      actual: 'notARealTransform',
    });
  });

  it('emits declared reverse transforms into the generated projection', () => {
    const changed = cloneInputs(inputs);
    changed.mapping.reverse.transforms['typography.sizes.body'] = 'numberToPx';

    const generated = createMappingProjections(changed.mapping, changed.supportedTypePaths);

    expect(generated.violations).toEqual([]);
    expect(generated.reverseProjection['typography.sizes.body']).toEqual({
      source: 'fontSize.functionalBodyMedium',
      transform: 'numberToPx',
    });
  });

  it('reports drift in the checked-in reverse projection', () => {
    const changed = cloneInputs(inputs);
    changed.reverseProjection['colors.black'] = { source: 'color.shadow' };

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'reverse-projection',
      path: 'colors.black',
      expected: { source: 'color.fixedBlack' },
      actual: { source: 'color.shadow' },
    });
  });

  it('rejects unknown mapping schema versions', () => {
    const changed = cloneInputs(inputs);
    changed.mapping.schemaVersion = 3;

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'schema',
      path: 'schemaVersion',
      expected: 2,
      actual: 3,
    });
  });
});
