import { render } from '../../common/renderWithTheme';
import { Persona } from './persona';

describe('Persona', () => {
  it('lets localized formatters distinguish a status from identically worded supporting text', async () => {
    const formatIdentity = jest.fn(({ name }: { name: string }) => name);
    const tree = await render(<Persona name="Ana" presence={{ status: 'away', label: 'Away' }} formatIdentity={formatIdentity} />);
    expect(formatIdentity).toHaveBeenLastCalledWith(expect.objectContaining({ presenceLabel: 'Away', secondaryText: undefined }));
    await tree.rerender(<Persona name="Ana" secondaryText="Away" formatIdentity={formatIdentity} />);
    expect(formatIdentity).toHaveBeenLastCalledWith(expect.objectContaining({ presenceLabel: undefined, secondaryText: 'Away' }));
  });

  it('exposes one summary and replaces stale lines and presence with the identity', async () => {
    const tree = await render(<Persona name="Ana" secondaryText="Engineering" presence={{ status: 'away', label: 'Away' }} />);
    expect(tree.getByRole('group', { name: 'Ana, Engineering, Away' }).props.focusable).toBe(false);
    expect(tree.getByText('Engineering', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(tree.queryByText('Engineering')).toBeNull();
    await tree.rerender(<Persona name="Bo" layout="beforeAvatar" tertiaryText="Design" />);
    expect(tree.getByRole('group', { name: 'Bo, Design' })).toBeOnTheScreen();
    expect(tree.queryByText('Engineering', { includeHiddenElements: true })).toBeNull();
    expect(tree.queryByRole('group', { name: /Away/ })).toBeNull();
  });

  it('suppresses an independent target for an explicitly decorative identity', async () => {
    const tree = await render(<Persona name="Ana" decorative testID="identity" />);
    expect(tree.getByTestId('identity', { includeHiddenElements: true }).props.accessible).toBe(false);
    expect(tree.queryByRole('group', { includeHiddenElements: true })).toBeNull();
  });
});
