import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Slider } from './slider';

describe('Slider', () => {
  it('quantizes a direct native set, constrains the pair, and does not change controlled props', async () => {
    const onValueChange = jest.fn();
    const onValueCommit = jest.fn();
    const tree = await render(
      <Slider
        mode="range"
        min={0}
        max={100}
        step={5}
        value={[25, 75]}
        accessibilityLabel="Price"
        thumbLabels={['Low', 'High']}
        thumbTestIDs={['low', 'high']}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    );
    const upper = tree.getByTestId('high');
    expect(upper.props.minimum).toBe(25);
    await fireEvent(upper, 'valueRequest', { nativeEvent: { kind: 'accessibility', value: 6 } });
    expect(onValueChange.mock.calls).toEqual([[[25, 25], { thumb: 'upper' }]]);
    expect(onValueCommit.mock.calls).toEqual(onValueChange.mock.calls);
    expect(upper.props.value).toBe(75);
  });
});
