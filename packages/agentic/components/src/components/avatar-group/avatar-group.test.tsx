import { Pressable } from 'react-native';
import { render } from '../../common/renderWithTheme';
import { AvatarGroup } from './avatar-group';

const includeHidden = { includeHiddenElements: true };
const members = ['Ada', 'Bo', 'Cara', 'Di', 'Eli', 'Flo'].map((name) => ({
  key: name,
  name,
  avatar: { initials: name.slice(0, 2).toUpperCase() },
}));

describe('AvatarGroup', () => {
  it('switches between five visible members and four with overflow, in source order', async () => {
    const formatOverflow = (count: number) => ({ text: `+${count}`, accessibilityLabel: `${count} more reviewers` });
    const tree = await render(<AvatarGroup members={members} accessibilityLabel="Reviewers" formatOverflow={formatOverflow} />);
    const group = () => tree.getByRole('group');
    expect(group().props).toMatchObject({ accessibilityLabel: 'Reviewers, Ada, Bo, Cara, Di, 2 more reviewers', focusable: false });
    expect(tree.getByText('+2', includeHidden)).toBeOnTheScreen();
    expect(tree.queryByText('+2')).toBeNull();
    expect(tree.queryByText('EL', includeHidden)).toBeNull();

    await tree.rerender(<AvatarGroup members={members.slice(1)} accessibilityLabel="Reviewers" formatOverflow={formatOverflow} />);
    expect(group().props.accessibilityLabel).toBe('Reviewers, Bo, Cara, Di, Eli, Flo');
    expect(tree.getByText('FL', includeHidden)).toBeOnTheScreen();
    expect(tree.queryByText('+2', includeHidden)).toBeNull();
  });

  it('omits blank identities and yields the accessible summary to an enclosing command', async () => {
    const tree = await render(<AvatarGroup members={[{ ...members[0], name: ' ' }]} testID="empty" />);
    expect(tree.queryByRole('group', includeHidden)).toBeNull();
    expect(tree.queryByText('AD', includeHidden)).toBeNull();

    await tree.rerender(
      <Pressable accessibilityRole="button" accessibilityLabel="Open reviewer roster">
        <AvatarGroup members={members} decorative testID="visual-reviewers" />
      </Pressable>,
    );
    expect(tree.getByRole('button', { name: 'Open reviewer roster' })).toBeOnTheScreen();
    expect(tree.queryByRole('group')).toBeNull();
    expect(tree.getByTestId('visual-reviewers', includeHidden).props).toMatchObject({
      accessible: false,
      accessibilityElementsHidden: true,
    });
  });
});
