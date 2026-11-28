import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { InfoLabel } from './info-label';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: jest.fn(),
  findNodeHandle: jest.fn(() => 42),
}));

describe('InfoLabel', () => {
  const help = { triggerLabel: 'Explain retention', surfaceLabel: 'Retention help', children: 'Counts calendar days.' };

  it('keeps label delegation and help invocation independent', async () => {
    const focus = jest.fn();
    const onOpenChange = jest.fn();
    const { getByText, getByRole, queryByText } = await render(
      <InfoLabel content="Retention" target={{ kind: 'editor', focus }} help={{ ...help, onOpenChange }} required />,
    );
    const label = getByText('Retention', { includeHiddenElements: true });
    await fireEvent(label, 'pressIn');
    await fireEvent.press(label);
    expect(focus).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(queryByText('Counts calendar days.')).toBeNull();

    await fireEvent(getByRole('button', { name: 'Explain retention' }), 'accessibilityTap');
    expect(onOpenChange.mock.calls).toEqual([[true, { reason: 'trigger' }]]);
    expect(focus).toHaveBeenCalledTimes(1);
    expect(getByRole('group', { name: 'Retention help' })).toBeOnTheScreen();
    expect(getByText('Counts calendar days.')).toBeOnTheScreen();
  });

  it('honors controlled rejection, and disabled suppresses requested content without a callback', async () => {
    const onOpenChange = jest.fn();
    const controlled = { ...help, open: false, onOpenChange };
    const tree = await render(<InfoLabel content="Retention" help={controlled} />);
    await fireEvent.press(tree.getByRole('button', { name: 'Explain retention' }));
    expect(tree.queryByText('Counts calendar days.')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    await tree.rerender(<InfoLabel content="Retention" help={{ ...controlled, open: true }} disabled />);
    expect(tree.getByRole('button', { name: 'Explain retention' })).toBeDisabled();
    expect(tree.queryByText('Counts calendar days.')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });
});
