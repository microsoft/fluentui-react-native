import type { ToolbarProps } from '../../index';

describe('Toolbar props', () => {
  it('reserves the group contract for small and large commands', () => {
    const valid: ToolbarProps = { accessibilityLabel: 'Formatting', children: null };
    // @ts-expect-error Toolbar does not apply a medium group size.
    const invalid: ToolbarProps = { ...valid, size: 'medium' };
    expect([valid, invalid]).toHaveLength(2);
  });
});
