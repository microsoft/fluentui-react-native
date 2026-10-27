import { screen } from '@testing-library/react-native';

import { render } from '../../common/renderWithTheme';
import { Text } from '../../components/text/text';
import { StoryGroup } from './story-group';

describe('StoryGroup', () => {
  it('renders the label before content and exposes the optional named label marker', async () => {
    await render(
      <StoryGroup label="Actions" labelTestID="actions-label" testID="actions">
        <Text>First</Text>
      </StoryGroup>,
    );

    expect(screen.getByTestId('actions-label').props.accessibilityLabel).toBe('Actions');
    expect(screen.getByText('Actions')).toBeTruthy();
    expect(screen.getByTestId('actions').children[0]).toBe(screen.getByTestId('actions-label'));
    expect(screen.getByText('First')).toBeTruthy();
  });
});
