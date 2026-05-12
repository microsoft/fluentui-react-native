import type { ComponentMetadata } from './ComponentMetadata.ts';
import { validateMetadata } from './validateMetadata.ts';

describe('validateMetadata', () => {
  it('accepts a fully populated, hand-written metadata document', () => {
    const input: ComponentMetadata = {
      name: 'Button',
      importPath: '@fluentui-react-native/button',
      exportName: 'Button',
      baseProps: { children: 'Hi', testID: 'btn' },
      states: [
        { id: 'default', description: 'baseline' },
        { id: 'disabled', props: { disabled: true } },
        {
          id: 'pressed',
          interactions: [{ kind: 'press', targetTestID: 'btn' }],
        },
      ],
    };

    const result = validateMetadata(input);

    expect(result.issues).toEqual([]);
    expect(result.metadata).not.toBeNull();
    expect(result.metadata?.name).toBe('Button');
    expect(result.metadata?.states.length).toBe(3);
    // States are returned in input order.
    expect(result.metadata?.states.map((s) => s.id)).toEqual(['default', 'disabled', 'pressed']);
  });

  it('rejects non-objects with an invalid-type issue', () => {
    const result = validateMetadata('not an object');

    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({
        severity: 'error',
        rule: 'component/invalid-type',
      }),
    ]);
  });

  it('flags every missing required root field by rule', () => {
    const result = validateMetadata({});

    expect(result.metadata).toBeNull();

    const rules = new Set(result.issues.map((i) => i.rule));
    expect(rules.has('component/missing-field')).toBe(true);

    const messages = result.issues.map((i) => i.message).join('\n');
    expect(messages).toContain('metadata.name');
    expect(messages).toContain('metadata.importPath');
    expect(messages).toContain('metadata.exportName');
    expect(messages).toContain('metadata.states');
  });

  it('rejects when states is empty', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      states: [],
    });

    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ rule: 'component/empty-states', severity: 'error' }),
    ]);
  });

  it('rejects duplicate state ids', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      states: [{ id: 'default' }, { id: 'default' }],
    });

    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ rule: 'component/duplicate-state-id' }),
    ]);
  });

  it('rejects malformed interactions', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      states: [
        {
          id: 'default',
          interactions: [{ kind: 'press' }],
        },
      ],
    });

    expect(result.metadata).toBeNull();
    const messages = result.issues.map((i) => i.message).join('\n');
    expect(messages).toContain('targetTestID');
  });

  it('warns when an interaction targets a testID not declared in props', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      states: [
        {
          id: 'pressed',
          interactions: [{ kind: 'press', targetTestID: 'mystery' }],
        },
      ],
    });

    // Shape is fine — this is a warning, not an error.
    expect(result.metadata).not.toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({
        severity: 'warning',
        rule: 'component/dangling-testid',
      }),
    ]);
  });

  it('does not warn when a state-local testID covers the interaction target', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      states: [
        {
          id: 'pressed',
          props: { testID: 'inner' },
          interactions: [{ kind: 'press', targetTestID: 'inner' }],
        },
      ],
    });

    expect(result.metadata).not.toBeNull();
    expect(result.issues).toEqual([]);
  });

  it('accepts every interaction kind', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      baseProps: { testID: 'root' },
      states: [
        {
          id: 'all',
          interactions: [
            { kind: 'press', targetTestID: 'root' },
            { kind: 'focus', targetTestID: 'root' },
            { kind: 'blur', targetTestID: 'root' },
            { kind: 'hover', targetTestID: 'root', state: 'in' },
            { kind: 'changeText', targetTestID: 'root', text: 'hi' },
            { kind: 'scroll', targetTestID: 'root', offset: { x: 0, y: 10 } },
            { kind: 'custom', name: 'longPress', payload: null },
          ],
        },
      ],
    });

    expect(result.issues).toEqual([]);
    expect(result.metadata?.states[0].interactions?.length).toBe(7);
  });

  it('rejects unknown interaction kinds', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      states: [
        {
          id: 'odd',
          interactions: [{ kind: 'teleport', targetTestID: 'x' }],
        },
      ],
    });

    expect(result.metadata).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ rule: 'component/invalid-type' }),
    ]);
  });

  it('rejects empty strings for required root fields', () => {
    const result = validateMetadata({
      name: '',
      importPath: '',
      exportName: '',
      states: [{ id: 'default' }],
    });

    expect(result.metadata).toBeNull();
    const rules = result.issues.map((i) => i.rule);
    // Each empty-string root field produces an invalid-type issue.
    expect(rules.filter((r) => r === 'component/invalid-type').length).toBeGreaterThanOrEqual(3);
  });

  it('rejects an empty state id', () => {
    const result = validateMetadata({
      name: 'X',
      importPath: 'x',
      exportName: 'X',
      states: [{ id: '' }],
    });
    expect(result.metadata).toBeNull();
    expect(result.issues.some((i) => i.rule === 'component/invalid-type' && /non-empty/.test(i.message))).toBe(true);
  });
});
