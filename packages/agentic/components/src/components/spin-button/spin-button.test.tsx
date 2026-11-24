import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { SpinButton } from './spin-button';

describe('SpinButton', () => {
  it('preserves an invalid text draft and separately accepts a bounded exact native request', async () => {
    const change = jest.fn();
    const invalid = jest.fn();
    const tree = await render(
      <SpinButton
        min={0}
        max={10}
        step={0.5}
        defaultValue={3}
        accessibilityLabel="Quantity"
        incrementLabel="Increase"
        decrementLabel="Decrease"
        format={(value) => String(value).replace('.', ',')}
        parse={(text) => (text === '-' ? null : Number(text.replace(',', '.')))}
        editorTestID="qty"
        onValueChange={change}
        onInvalidChange={invalid}
      />,
    );
    const editor = () => tree.getByTestId('qty');
    const request = (kind: string, text = '', value = 0) => fireEvent(editor(), 'editorInput', { nativeEvent: { kind, text, value } });
    await request('change', '-');
    await request('commit', '-');
    await request('commit', '-');
    expect(editor().props).toMatchObject({ draft: '-', numericValue: 3, invalid: true });
    expect(invalid.mock.calls).toEqual([[true]]);
    expect(change).not.toHaveBeenCalled();
    await request('cancel');
    expect(editor().props).toMatchObject({ draft: '3', invalid: false });
    await request('accessibility-value', '', 9.5);
    expect(editor().props).toMatchObject({ draft: '9,5', numericValue: 9.5 });
    await request('increment');
    expect(change.mock.calls).toEqual([
      [9.5, { reason: 'accessibility' }],
      [10, { reason: 'increment' }],
    ]);
    expect(editor().props.canIncrement).toBe(false);
  });
});
