import type { ComponentMetadata } from '@fluentui-react-native/concepts';

import { validateMetadata } from './validateMetadata.ts';

describe('validateMetadata', () => {
  it('accepts a fully populated metadata document', () => {
    const input: ComponentMetadata = {
      name: 'Button',
      importPath: '@fluentui-react-native/button',
      exportName: 'ButtonV1',
      framework: 'v1',
      platforms: ['ios', 'android'],
      states: ['disabled', 'hover', 'press', 'focused'],
      stateCombos: [['press', 'focused']],
      appearances: ['primary', 'subtle'],
      sizes: ['small', 'medium'],
      shapes: ['rounded'],
      baseProps: { children: 'Hi', testID: 'btn' },
    };

    const result = validateMetadata(input);

    expect(result.issues).toEqual([]);
    expect(result.metadata).not.toBeNull();
    expect(result.metadata?.name).toBe('Button');
    expect(result.metadata?.framework).toBe('v1');
    expect(result.metadata?.platforms).toEqual(['ios', 'android']);
  });

  it('rejects non-objects with an invalid-type issue', () => {
    const result = validateMetadata('not an object');

    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ severity: 'error', rule: 'component/invalid-type' }),
    ]);
  });

  it('flags every missing required root field', () => {
    const result = validateMetadata({});

    expect(result.metadata).toBeNull();
    const messages = result.issues.map((i) => i.message).join('\n');
    expect(messages).toContain('metadata.name');
    expect(messages).toContain('metadata.importPath');
    expect(messages).toContain('metadata.exportName');
    expect(messages).toContain('metadata.framework');
    expect(messages).toContain('metadata.platforms');
    expect(messages).toContain('metadata.states');
  });

  it('rejects an empty platforms array', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      framework: 'v1',
      platforms: [],
      states: [],
    });
    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'component/empty-platforms' })]),
    );
  });

  it('rejects an unknown framework value', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      framework: 'v9000',
      platforms: ['ios'],
      states: [],
    });
    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'component/invalid-enum' })]),
    );
  });

  it('rejects an unknown platform value', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      framework: 'v1',
      platforms: ['ios', 'unknown'],
      states: [],
    });
    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'component/invalid-enum' })]),
    );
  });

  it('rejects an unknown state value', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      framework: 'v1',
      platforms: ['ios'],
      states: ['teleported'],
    });
    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'component/invalid-enum' })]),
    );
  });

  it('rejects a state combo with fewer than two members', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      framework: 'v1',
      platforms: ['ios'],
      states: ['press'],
      stateCombos: [['press']],
    });
    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'component/invalid-type' })]),
    );
  });

  it('warns when interaction-driven states are declared without a baseProps.testID', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      framework: 'v1',
      platforms: ['ios'],
      states: ['hover'],
    });

    expect(result.metadata).not.toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ severity: 'warning', rule: 'component/dangling-testid' }),
    ]);
  });

  it('does not warn for prop-only states without a testID', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      framework: 'v1',
      platforms: ['ios'],
      states: ['disabled', 'checked'],
    });

    expect(result.metadata).not.toBeNull();
    expect(result.issues).toEqual([]);
  });

  it('rejects empty strings for required root fields', () => {
    const result = validateMetadata({
      name: '',
      importPath: '',
      exportName: '',
      framework: 'v1',
      platforms: ['ios'],
      states: [],
    });
    expect(result.metadata).toBeNull();
    expect(
      result.issues.filter((i) => i.rule === 'component/invalid-type').length,
    ).toBeGreaterThanOrEqual(3);
  });
});
