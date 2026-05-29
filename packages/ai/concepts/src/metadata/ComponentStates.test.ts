import type { ComponentMetadata } from './ComponentMetadata.ts';
import { deriveComponentStates } from './ComponentStates.ts';

const buttonLike: ComponentMetadata = {
  name: 'Button',
  importPath: '@fluentui-react-native/button',
  exportName: 'ButtonV1',
  framework: 'v1',
  platforms: ['ios', 'android', 'macos', 'win32', 'windows'],
  states: ['disabled', 'hover', 'press', 'focused'],
  stateCombos: [['press', 'focused']],
  appearances: ['primary', 'subtle'],
  sizes: ['small', 'medium'],
  shapes: ['rounded', 'square'],
  baseProps: { children: 'Hi', testID: 'button-root' },
};

describe('deriveComponentStates', () => {
  it('emits a default branch, an entry per appearance, and parallel size/shape entries', () => {
    const states = deriveComponentStates(buttonLike);
    const keys = Object.keys(states);

    expect(keys).toContain('default');
    expect(keys).toContain('default-disabled');
    expect(keys).toContain('default-press-focused');
    expect(keys).toContain('primary');
    expect(keys).toContain('primary-hover');
    expect(keys).toContain('subtle-press-focused');
    expect(keys).toContain('size-small');
    expect(keys).toContain('size-medium');
    expect(keys).toContain('shape-rounded');
    expect(keys).toContain('shape-square');
  });

  it('drives prop-based states via props and interaction-based states via interactions', () => {
    const states = deriveComponentStates(buttonLike);
    expect(states['default-disabled']).toEqual({ props: { disabled: true } });
    expect(states['default-hover']).toEqual({
      interactions: [{ kind: 'hover', targetTestID: 'button-root', state: 'in' }],
    });
    expect(states['primary-press']).toEqual({
      props: { appearance: 'primary' },
      interactions: [{ kind: 'press', targetTestID: 'button-root' }],
    });
  });

  it('normalizes combo state order so identical combos produce identical keys', () => {
    const reordered: ComponentMetadata = {
      ...buttonLike,
      stateCombos: [['focused', 'press']],
    };
    const states = deriveComponentStates(reordered);
    expect(Object.keys(states)).toContain('default-press-focused');
    expect(Object.keys(states)).not.toContain('default-focused-press');
  });

  it('size and shape entries do not apply states or appearance', () => {
    const states = deriveComponentStates(buttonLike);
    expect(states['size-medium']).toEqual({ props: { size: 'medium' } });
    expect(states['shape-rounded']).toEqual({ props: { shape: 'rounded' } });
  });

  it('returns keys in stable sorted order', () => {
    const states = deriveComponentStates(buttonLike);
    const keys = Object.keys(states);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it('skips interactions when no baseProps.testID is set', () => {
    const noTestID: ComponentMetadata = {
      ...buttonLike,
      baseProps: { children: 'Hi' },
    };
    const states = deriveComponentStates(noTestID);
    expect(states['default-hover']).toEqual({});
    expect(states['default-disabled']).toEqual({ props: { disabled: true } });
  });

  it('emits only the default branch when no appearances are declared', () => {
    const noAppearance: ComponentMetadata = {
      name: 'Divider',
      importPath: '@fluentui-react-native/divider',
      exportName: 'Divider',
      framework: 'v1',
      platforms: ['ios'],
      states: [],
    };
    const states = deriveComponentStates(noAppearance);
    expect(Object.keys(states)).toEqual(['default']);
  });
});
