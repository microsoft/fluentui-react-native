import { AccessibilityInfo, View } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Input } from '../input/input';
import { Field } from './field';
import type { FieldBinding } from './field.types';

describe('Field', () => {
  it('maintains ordered per-field declarations without remounting an edited control', async () => {
    const bind = jest.fn(({ label, size, disabled, invalid }: FieldBinding) => (
      <Input accessibilityLabel={label} size={size} disabled={disabled} error={invalid} />
    ));
    const props = { label: 'Project code', renderControl: bind, helperText: 'Use the invitation.' };
    const tree = await render(<Field {...props} />);
    const before = bind.mock.lastCall![0];
    await fireEvent.changeText(tree.getByRole('textbox', { name: 'Project code' }), '123');
    await tree.rerender(<Field {...props} orientation="horizontal" status="error" validationMessage="Enter four digits." required />);
    const error = bind.mock.lastCall![0];
    expect(error).toMatchObject({ labelID: before.labelID, invalid: true, required: true });
    expect(error.descriptionIDs).toEqual([before.descriptionIDs[0], tree.getByRole('text', { name: 'Enter four digits.' }).props.nativeID]);
    expect(tree.getByRole('textbox', { name: 'Project code' })).toHaveDisplayValue('123');

    await tree.rerender(<Field {...props} status="disabled" validationMessage="Enter four digits." required />);
    expect(bind.mock.lastCall![0]).toMatchObject({ invalid: false, disabled: true, descriptionIDs: before.descriptionIDs });
    expect(tree.queryByRole('text', { name: 'Enter four digits.' })).toBeNull();
    expect(tree.getByRole('text', { name: 'Project code' })).toBeOnTheScreen();
  });

  it('announces new validation, not helper changes or an identical render', async () => {
    const speak = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockClear()
      .mockImplementation(() => {});
    try {
      const props = { label: 'Project code', renderControl: () => <View />, validationMessage: 'Enter four digits.' };
      const tree = await render(<Field {...props} />);
      expect(speak).not.toHaveBeenCalled();
      await tree.rerender(<Field {...props} status="error" />);
      expect(speak).toHaveBeenCalledTimes(1);
      await tree.rerender(<Field {...props} status="error" helperText="Check the invitation." />);
      expect(speak).toHaveBeenCalledTimes(1);
      await tree.rerender(<Field {...props} status="disabled" />);
      expect(speak).toHaveBeenCalledTimes(1);
      await tree.rerender(<Field {...props} status="error" />);
      expect(speak).toHaveBeenCalledTimes(1);
      await tree.rerender(<Field {...props} status="warning" validationMessage="This code is almost expired." />);
      expect(speak.mock.calls).toEqual([
        ['Enter four digits.', { queue: true }],
        ['This code is almost expired.', { queue: true }],
      ]);
    } finally {
      speak.mockRestore();
    }
  });
});
