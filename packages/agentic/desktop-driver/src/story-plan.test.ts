import { planTestIds, validateStoryPlan } from './story-plan.ts';
import type { InlineStoryPlan } from './types.ts';

describe('story plan validation', () => {
  const inline: InlineStoryPlan = {
    kind: 'inline',
    id: 'button-default',
    steps: [
      { action: 'expectVisible', target: { testId: 'button' } },
      { action: 'press', target: { testId: 'button' } },
      { action: 'expect', target: { testId: 'status' }, property: 'text', equals: 'Pressed' },
    ],
  };

  it('accepts a well-formed inline plan', () => {
    expect(validateStoryPlan(inline)).toBe(inline);
    expect(planTestIds(inline)).toEqual(['button', 'status']);
  });

  it('accepts a linked spec plan', () => {
    expect(validateStoryPlan({ kind: 'spec', id: 'button-rich', spec: './button.desktop.spec.ts' })).toMatchObject({ kind: 'spec' });
  });

  it('rejects a non-relative spec path', () => {
    expect(() => validateStoryPlan({ kind: 'spec', id: 'x', spec: '/etc/passwd' })).toThrow(/relative path/);
  });

  it('rejects a target that is not a bare testId', () => {
    expect(() => validateStoryPlan({ kind: 'inline', id: 'x', steps: [{ action: 'press', target: { xpath: '//button' } }] })).toThrow(
      /exactly one property, "testId"/,
    );
  });

  it('rejects an unknown action', () => {
    expect(() => validateStoryPlan({ kind: 'inline', id: 'x', steps: [{ action: 'evaluate' }] })).toThrow(/must be one of/);
  });

  it('rejects an expectation whose value type does not match the property', () => {
    expect(() =>
      validateStoryPlan({
        kind: 'inline',
        id: 'x',
        steps: [{ action: 'expect', target: { testId: 'a' }, property: 'enabled', equals: 'true' }],
      }),
    ).toThrow(/must be a boolean/);
  });

  it('rejects a plan id that is not kebab-case', () => {
    expect(() => validateStoryPlan({ ...inline, id: 'Button Default' })).toThrow(/kebab-case/);
  });

  it('rejects a non-serializable plan', () => {
    const cyclic: Record<string, unknown> = { kind: 'inline', id: 'x', steps: [] };
    cyclic.self = cyclic;
    expect(() => validateStoryPlan(cyclic)).toThrow(/JSON-serializable/);
  });

  it('accepts repeated references that are not cyclic', () => {
    const target = { testId: 'shared-target' };
    expect(() =>
      validateStoryPlan({
        kind: 'inline',
        id: 'shared',
        steps: [
          { action: 'expectVisible', target },
          { action: 'press', target },
        ],
      }),
    ).not.toThrow();
  });

  it('rejects an unsupported schema version', () => {
    expect(() => validateStoryPlan({ ...inline, version: 99 })).toThrow(/version/);
  });
});
