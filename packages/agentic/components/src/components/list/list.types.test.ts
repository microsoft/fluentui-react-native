import type { ListProps } from '../../index';

describe('List types', () => {
  it('only admits mounted collection modes and keyed rows', () => {
    const valid: ListProps = { items: [{ key: 'q1', label: 'Results', disabled: true }], navigationMode: 'items' };
    // @ts-expect-error Nested action traversal is not yet a supported public mode.
    const composite: ListProps = { ...valid, navigationMode: 'composite' };
    // @ts-expect-error Selection is keyed, not positional.
    const positional: ListProps = { ...valid, defaultSelectedKeys: [0] };
    expect([valid, composite, positional]).toHaveLength(3);
  });
});
