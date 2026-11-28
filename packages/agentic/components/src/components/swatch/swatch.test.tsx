import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Swatch } from './swatch';
import type { SwatchProps } from './swatch.types';

const sample = { kind: 'color', color: '#00000000' } as const;
describe('Swatch', () => {
  it('requests the key without changing the owner’s selection and suppresses disabled requests', async () => {
    const onSelect = jest.fn();
    const props: SwatchProps = { value: 'clear', accessibilityLabel: 'Transparent', sample, onSelect };
    const tree = await render(<Swatch {...props} />);
    const option = () => tree.getByRole('radio', { name: 'Transparent' });
    await fireEvent.press(option());
    expect(onSelect).toHaveBeenLastCalledWith('clear');
    expect(option()).not.toBeChecked();
    await tree.rerender(<Swatch {...props} selected disabled />);
    expect(option()).toBeChecked();
    await fireEvent.press(option());
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
