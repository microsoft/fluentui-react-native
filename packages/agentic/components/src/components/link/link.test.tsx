import { Linking, StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Link } from './link';

describe('Link', () => {
  it('has a native name, underlines wrapped content and ignores nonlink keyboard activation', async () => {
    const navigate = jest.fn();
    const { getByRole, getByText } = await render(<Link content="Team settings" onNavigate={navigate} />);
    const link = getByRole('link', { name: 'Team settings' });
    expect(StyleSheet.flatten(getByText('Team settings', { includeHiddenElements: true }).props.style)).toMatchObject({
      textDecorationLine: 'underline',
      flexShrink: 1,
    });
    await fireEvent.press(link, { nativeEvent: { key: ' ', code: 'Space' } });
    await fireEvent.press(link, { nativeEvent: { key: 'Enter', ctrlKey: true } });
    expect(navigate).not.toHaveBeenCalled();
    await fireEvent.press(link, { nativeEvent: { key: 'Enter' } });
    await fireEvent(link, 'accessibilityTap');
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('dispatches the URL to the platform, and disabled does not navigate', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    try {
      const url = 'https://reactnative.dev/';
      const tree = await render(<Link content="Documentation" url={url} />);
      await fireEvent(tree.getByRole('link', { name: 'Documentation' }), 'accessibilityTap');
      expect(open.mock.calls).toEqual([[url]]);
      await tree.rerender(<Link content="Documentation" url={url} disabled />);
      const disabled = tree.getByRole('link', { name: 'Documentation' });
      expect(disabled).toBeDisabled();
      disabled.props.onAccessibilityTap?.();
      expect(open).toHaveBeenCalledTimes(1);
    } finally {
      open.mockRestore();
    }
  });

  it('diagnoses a blank name and prevents activation of the target', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const navigate = jest.fn();
      const { getByRole } = await render(<Link content="   " onNavigate={navigate} />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('nonblank destination text'));
      const link = getByRole('link');
      expect(link).toBeDisabled();
      link.props.onAccessibilityTap?.();
      expect(navigate).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
