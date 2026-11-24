import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { SwatchPicker } from './swatch-picker';
import { adjacentSwatchRow } from './swatchGridNavigation';

const colors = [
  { value: 'blue', accessibilityLabel: 'Blue', sample: { kind: 'color', color: '#004b93' } },
  { value: 'rose', accessibilityLabel: 'Rose', sample: { kind: 'color', color: '#c24468' } },
  { value: 'linen', accessibilityLabel: 'Linen', sample: { kind: 'color', color: '#efddbb' }, disabled: true },
] as const;

describe('SwatchPicker', () => {
  it('keeps selection by key across reorder and suppresses repeated and disabled activation', async () => {
    const onValueChange = jest.fn();
    const tree = await render(
      <SwatchPicker accessibilityLabel="Finish" items={colors} defaultValue="blue" onValueChange={onValueChange} />,
    );
    const pick = (name: string) => tree.getByRole('radio', { name });
    await fireEvent.press(pick('Blue'), { nativeEvent: {} });
    expect(onValueChange).not.toHaveBeenCalled();
    await fireEvent.press(pick('Rose'), { nativeEvent: {} });
    expect(onValueChange.mock.calls).toEqual([['rose']]);
    await tree.rerender(
      <SwatchPicker accessibilityLabel="Finish" layout="grid" items={[colors[1], colors[2], colors[0]]} onValueChange={onValueChange} />,
    );
    expect(pick('Rose').props.accessibilityState.checked).toBe(true);
    expect(pick('Blue').props.accessibilityState.checked).toBe(false);
    expect(pick('Linen')).toBeDisabled();
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('skips a fully disabled row and picks the nearest visible column', () => {
    const extra = { ...colors[0], value: 'navy' };
    const rect = (x: number, y: number) => ({ x, y, width: 20, height: 20 });
    const geometry = new Map([
      ['blue', rect(24, 0)],
      ['linen', rect(24, 24)],
      ['rose', rect(0, 48)],
      ['navy', rect(24, 48)],
    ]);
    expect(adjacentSwatchRow([...colors, extra], geometry, 'blue', 'down')).toBe('navy');
    expect(adjacentSwatchRow([...colors, extra], geometry, 'blue', 'up')).toBeUndefined();
  });
});
