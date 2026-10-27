import { screen } from '@testing-library/react-native';

import { render } from '../../common/renderWithTheme';
import { StoryStatus } from './story-status';

describe('StoryStatus', () => {
  it('exposes the text on a named accessible View and keeps its child text decorative', async () => {
    await render(<StoryStatus testID="status">Ready</StoryStatus>);

    const status = screen.getByTestId('status');
    expect(status.props.accessible).toBe(true);
    expect(status.props.accessibilityLabel).toBe('Ready');
    expect(status.props.accessibilityRole).toBe('text');
    expect(screen.getByText('Ready').props.accessible).toBe(false);
  });
});
