import type { CompoundButtonProps } from '../../index';

describe('CompoundButton props', () => {
  it('requires two text lines and does not accept interactive content slots', () => {
    const command: CompoundButtonProps = { content: 'Archive', secondaryContent: 'Keep a searchable copy' };
    // @ts-expect-error The supporting line is required.
    const noSecondary: CompoundButtonProps = { content: 'Archive' };
    // @ts-expect-error There is no trailing action or ToggleButton behavior.
    const toggle: CompoundButtonProps = { ...command, selected: true };
    expect([command, noSecondary, toggle]).toHaveLength(3);
  });
});
