import { mergeProps } from './mergeProps';

describe('mergeProps children handling', () => {
  it('does not let a null child overwrite a real child', () => {
    const result = mergeProps({ children: 'Real' }, { children: null });
    expect(result).toEqual({ children: 'Real' });
  });

  it('does not let an undefined child overwrite a real child', () => {
    const result = mergeProps({ children: 'Real' }, { children: undefined });
    expect(result).toEqual({ children: 'Real' });
  });

  it('lets a later real child override an earlier one', () => {
    const result = mergeProps({ children: 'First' }, { children: 'Second' });
    expect(result).toEqual({ children: 'Second' });
  });

  it('keeps a real child when the null comes first', () => {
    const result = mergeProps({ children: null }, { children: 'Real' });
    expect(result).toEqual({ children: 'Real' });
  });

  it('preserves other props while fixing children', () => {
    const result = mergeProps({ children: 'Real', a: 1 }, { children: null, b: 2 });
    expect(result).toEqual({ children: 'Real', a: 1, b: 2 });
  });
});
