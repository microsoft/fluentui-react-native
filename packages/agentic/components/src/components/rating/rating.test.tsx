import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Rating } from './rating';

describe('Rating', () => {
  it('does not confuse unset with zero and reports a fractional native request exactly once', async () => {
    const change = jest.fn();
    const tree = await render(
      <Rating
        accessibilityLabel="Quality"
        targetTestID="quality"
        formatValue={(value) => (value === null ? 'No rating' : `${value} stars`)}
        onValueChange={change}
      />,
    );
    const native = () => tree.getByTestId('quality');
    expect(native().props).toMatchObject({ hasValue: false, valueDescription: 'No rating' });
    await fireEvent(native(), 'valueRequest', { nativeEvent: { kind: 'keyboard', value: 0 } });
    expect(native().props).toMatchObject({ hasValue: true, value: 0, valueDescription: '0 stars' });
    await fireEvent(native(), 'valueRequest', { nativeEvent: { kind: 'accessibility', value: 3.5 } });
    await fireEvent(native(), 'valueRequest', { nativeEvent: { kind: 'clear', value: 3.5 } });
    expect(change.mock.calls).toEqual([[0], [3.5], [null]]);
    expect(native().props.hasValue).toBe(false);
  });
});
