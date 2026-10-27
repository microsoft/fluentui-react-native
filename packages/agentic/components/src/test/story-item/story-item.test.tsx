import { screen } from '@testing-library/react-native';

import { render } from '../../common/renderWithTheme';
import { Text } from '../../components/text/text';
import { StoryItem } from './story-item';

describe('StoryItem', () => {
  it('renders content before its caption', async () => {
    await render(
      <StoryItem label="Caption" testID="item">
        <Text>Sample</Text>
      </StoryItem>,
    );

    const item = screen.getByTestId('item');
    expect(item.children[0]).toBe(screen.getByText('Sample'));
    expect(item.children[1]).toBe(screen.getByText('Caption'));
  });
});
