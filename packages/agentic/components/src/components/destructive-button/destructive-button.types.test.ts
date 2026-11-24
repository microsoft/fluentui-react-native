import type { DestructiveButtonProps } from '../../index';

describe('DestructiveButton props', () => {
  it('restricts the danger appearances and requires a name for icon-only commands', () => {
    const leadingIcon = { fontSource: { codepoint: 0xd7 } };
    const namedIcon: DestructiveButtonProps = { leadingIcon, accessibilityLabel: 'Remove saved item' };
    // @ts-expect-error Subtle is the only low-emphasis danger appearance.
    const secondary: DestructiveButtonProps = { content: 'Remove saved item', appearance: 'secondary' };
    // @ts-expect-error An icon alone does not give the command a name.
    const unnamed: DestructiveButtonProps = { leadingIcon };
    // @ts-expect-error The component is a command, not a toggle.
    const toggle: DestructiveButtonProps = { content: 'Remove saved item', selected: true };
    expect([namedIcon, secondary, unnamed, toggle]).toHaveLength(4);
  });
});
