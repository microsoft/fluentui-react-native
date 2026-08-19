import { View } from 'react-native';
import type { Preview } from '@storybook/react-native';

import { StorybookThemeProvider } from './StorybookTheme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <StorybookThemeProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Story />
        </View>
      </StorybookThemeProvider>
    ),
  ],
  parameters: {},
};

export default preview;
