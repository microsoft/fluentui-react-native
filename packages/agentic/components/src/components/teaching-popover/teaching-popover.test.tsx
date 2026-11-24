import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { TeachingPopover } from './teaching-popover';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: jest.fn(),
  findNodeHandle: jest.fn(() => 42),
}));
const steps = [
  { key: 'one', title: 'Find tools', body: 'Open your tools.' },
  { key: 'two', title: 'Pin tools', body: 'Keep useful tools nearby.' },
];
describe('TeachingPopover', () => {
  it('keeps accepted controlled steps separate from completion and presence', async () => {
    const onStepChange = jest.fn();
    const onFinish = jest.fn();
    const onOpenChange = jest.fn();
    const props = {
      trigger: { content: 'Tour' },
      title: 'Tour',
      open: true,
      steps,
      nextLabel: 'Next',
      backLabel: 'Back',
      primaryAction: { label: 'Done', onPress: jest.fn() },
      onStepChange,
      onFinish,
      onOpenChange,
    };
    const tree = await render(<TeachingPopover {...props} step="one" />);
    await fireEvent.press(tree.getByRole('button', { name: 'Next' }));
    expect(onStepChange).toHaveBeenCalledWith('two', { reason: 'next' });
    expect(tree.getByRole('button', { name: 'Next' })).toBeOnTheScreen();
    expect(onFinish).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    await tree.rerender(<TeachingPopover {...props} step="two" />);
    expect(onFinish).not.toHaveBeenCalled();
    await fireEvent.press(tree.getByRole('button', { name: 'Back' }));
    expect(onStepChange).toHaveBeenLastCalledWith('one', { reason: 'back' });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
    await fireEvent.press(tree.getByRole('button', { name: 'Done' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'dismiss' });
  });
});
