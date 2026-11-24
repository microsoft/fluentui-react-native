import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { CompoundButton } from './compound-button';

describe('CompoundButton', () => {
  it('exposes one named command and presents supporting text once', async () => {
    const onPress = jest.fn();
    const tree = await render(
      <CompoundButton content="Archive" secondaryContent="Keep a searchable copy" image={{ uri: 'archive.png' }} onPress={onPress} />,
    );
    const target = tree.getByRole('button', { name: 'Archive' });
    expect(target.props.accessibilityHint).toBe('Keep a searchable copy');
    expect(tree.getByText('Keep a searchable copy', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(tree.queryByText('Keep a searchable copy')).toBeNull();
    expect(tree.queryByRole('image', { includeHiddenElements: true })).toBeNull();
    await fireEvent.press(target);
    expect(onPress).toHaveBeenCalledTimes(1);

    await tree.rerender(
      <CompoundButton
        content="Archive"
        secondaryContent="Keep a searchable copy"
        accessibilityLabel="Archive file"
        disabled
        onPress={onPress}
      />,
    );
    const disabled = tree.getByRole('button', { name: 'Archive file' });
    expect(disabled).toBeDisabled();
    await fireEvent.press(disabled);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['small', 48],
    ['medium', 60],
    ['large', 68],
  ] as const)('configures a minimum, not a fixed, height in %s', async (size, minHeight) => {
    const tree = await render(
      <CompoundButton
        size={size}
        appearance="outline"
        content="Archive"
        secondaryContent="Keep a searchable copy"
        style={{ width: 160 }}
        secondaryContentStyle={{ fontSize: 28, lineHeight: 36 }}
      />,
    );
    const rootStyle = StyleSheet.flatten(tree.getByRole('button').props.style);
    expect(rootStyle).toMatchObject({ minHeight, width: 160 });
    expect(rootStyle.height).toBeUndefined();
    const description = tree.getByText('Keep a searchable copy', { includeHiddenElements: true });
    expect(description.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(description.props.style)).toMatchObject({ fontSize: 28, lineHeight: 36 });
  });
});
