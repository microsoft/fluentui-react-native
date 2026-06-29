import { View } from 'react-native';
import type { Preview } from '@storybook/react-native';

const preview: Preview = {
  decorators: [
    (Story) => (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {},
};

export default preview;
