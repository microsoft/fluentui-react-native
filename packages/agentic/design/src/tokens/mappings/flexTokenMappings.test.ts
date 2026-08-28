type MappingViolation = {
  rule: string;
  path: string;
  expected: unknown;
  actual: unknown;
};

type MappingInputs = {
  mapping: {
    schemaVersion: number;
    tokens: Record<string, unknown>;
  };
  nonFluentValues: Map<string, string>;
  supportedTypePaths: Set<string>;
  themeProjection: Record<string, string>;
  unsupportedTypePaths: Set<string>;
};

type MappingChecks = {
  assertMappingsConsistent(): void;
  formatMappingViolations(violations: MappingViolation[]): string;
  loadMappingInputs(): MappingInputs;
  validateMappingInputs(inputs: MappingInputs): MappingViolation[];
};

const { assertMappingsConsistent, formatMappingViolations, loadMappingInputs, validateMappingInputs } = jest.requireActual<MappingChecks>(
  '../../../scripts/token-mappings/check-mappings.cjs',
);

function cloneInputs(inputs: MappingInputs): MappingInputs {
  return structuredClone(inputs);
}

describe('Flex token mapping consistency', () => {
  const inputs = loadMappingInputs();

  it('keeps the checked-in mapping artifacts consistent', () => {
    expect(assertMappingsConsistent).not.toThrow();
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
    changed.nonFluentValues.delete('borderRadius.base100');

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'non-fluent-coverage',
      path: 'borderRadius.base100',
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
      expected: '<absent because the destination is Theme-backed>',
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

  it('rejects unknown mapping schema versions', () => {
    const changed = cloneInputs(inputs);
    changed.mapping.schemaVersion = 2;

    expect(validateMappingInputs(changed)).toContainEqual({
      rule: 'schema',
      path: 'schemaVersion',
      expected: 1,
      actual: 2,
    });
  });
});
