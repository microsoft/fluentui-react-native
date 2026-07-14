import { METADATA_SCHEMA_VERSION } from '../contracts/metadata.ts';
import { validateComponentMetadataRecord, validateMetadataArtifact, validateMetadataEnvelope } from './index.ts';

describe('validateMetadataEnvelope', () => {
  const validComponent = {
    identity: {
      name: 'Button',
      packageName: '@fluentui-react-native/button',
      exportName: 'Button',
    },
    states: [{ id: 'default' }],
    tokens: { mappings: [{ slot: 'root', property: 'backgroundColor', tokenPath: 'color.brand' }] },
    a11y: { serializedTree: { role: 'button' }, issues: [] },
    notes: { notes: [{ text: 'Baseline state', provenance: { source: 'manual' } }] },
    extraction: { status: 'complete', errors: [] },
  };

  it('accepts a valid metadata envelope and validates nested components', () => {
    const result = validateMetadataEnvelope({
      schemaVersion: METADATA_SCHEMA_VERSION,
      generatedAt: '2025-01-01T00:00:00.000Z',
      generator: { name: '@fluentui-react-native/metadata', version: '0.0.1' },
      components: [validComponent],
    });

    expect(result.isValid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('detects version mismatch with actionable guidance', () => {
    const result = validateMetadataArtifact({
      schemaVersion: '0.9.0',
      generatedAt: '2025-01-01T00:00:00.000Z',
      generator: { name: '@fluentui-react-native/metadata', version: '0.0.1' },
      components: [validComponent],
    });

    expect(result.command).toBe('metadata validate');
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.rule === 'schema/version-mismatch')).toBe(true);
    expect(result.issues.find((issue) => issue.rule === 'schema/version-mismatch')?.hint).toContain('Expected');
  });

  it('validates component records independently', () => {
    const result = validateComponentMetadataRecord({
      identity: {
        name: 'Button',
        packageName: '@fluentui-react-native/button',
        exportName: 'Button',
      },
      states: [{ id: 'default' }, { id: 'default' }],
      tokens: { mappings: [] },
      a11y: { serializedTree: null, issues: [] },
      notes: { notes: [] },
      extraction: { status: 'partial', errors: [] },
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.rule === 'component/duplicate-state-id')).toBe(true);
  });
});
