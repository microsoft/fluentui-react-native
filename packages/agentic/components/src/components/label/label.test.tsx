import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Label } from './label';

describe('Label', () => {
  it('puts native identity on the visible text and keeps the required marker out of its name', async () => {
    const tree = await render(
      <Label content="Project code" labelID="visible-code" nativeID="label-root" testID="label" required disabled />,
    );
    expect(tree.getByText('Project code', { includeHiddenElements: true }).props).toMatchObject({ nativeID: 'visible-code' });
    expect(tree.getByTestId('label').props).toMatchObject({
      nativeID: 'label-root',
      accessibilityLabel: 'Project code',
      accessibilityRole: 'text',
      focusable: false,
    });
    expect(tree.getByText('*', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(tree.queryByText('*')).toBeNull();
  });

  it('only delegates a completed press to its original target', async () => {
    const focus = jest.fn();
    const activate = jest.fn();
    const editor = { kind: 'editor', focus } as const;
    const choice = { kind: 'choice', activate } as const;
    const tree = await render(<Label content="Project" target={editor} />);
    const caption = () => tree.getByText('Project', { includeHiddenElements: true });
    await fireEvent(caption(), 'pressIn');
    expect(focus).not.toHaveBeenCalled();
    await tree.rerender(<Label content="Project" target={{ ...editor }} />);
    await fireEvent.press(caption());
    await fireEvent.press(caption());
    expect(focus).toHaveBeenCalledTimes(1);
    await fireEvent(caption(), 'pressIn');
    await tree.rerender(<Label content="Project" target={choice} />);
    await fireEvent.press(caption());
    expect(activate).not.toHaveBeenCalled();
    await fireEvent(caption(), 'pressIn');
    await tree.rerender(<Label content="Project" target={choice} disabled />);
    await fireEvent.press(caption());
    expect(activate).not.toHaveBeenCalled();
  });
});
