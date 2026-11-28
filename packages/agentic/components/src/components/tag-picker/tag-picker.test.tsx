import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { TagPicker } from './tag-picker';

const options = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
];
describe('TagPicker', () => {
  it('keeps removal distinct from option selection and preserves a rejected controlled selection', async () => {
    const change = jest.fn();
    const tree = await render(
      <TagPicker
        options={options}
        accessibilityLabel="Labels"
        selectedValues={['blue', 'green']}
        placeholder="Choose labels"
        formatRemoveLabel={(option) => `Remove ${option.label}`}
        onSelectionChange={change}
      />,
    );
    const remove = tree.getByRole('button', { name: 'Remove Blue' });
    await fireEvent.press(remove);
    expect(change.mock.calls).toEqual([[['green'], { value: 'blue', reason: 'remove' }]]);
    expect(tree.getByRole('button', { name: 'Remove Blue' })).toBeOnTheScreen();
    expect(tree.getByRole('button', { name: 'Remove Green' })).toBeOnTheScreen();
  });
});
