import type { ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Preview } from '@storybook/react-native';

import { DesktopStoryRoot } from './DesktopStoryRoot';
import { useDesktopStorybookConfig } from './DesktopStorybookConfig';
import { StorybookThemeProvider } from './StorybookTheme';

export function createDesktopStorybookPreview(): Preview {
  return {
    decorators: [
      (Story, context) => {
        const supportedPlatforms = readSupportedPlatforms(context.parameters?.desktopDriver);
        const traversePlatforms = readTraversePlatforms(context.parameters?.desktopDriver);
        const testOnly = context.tags?.includes('desktop-test-only') ?? false;
        return (
          <StorybookThemeProvider>
            <DesktopStoryRoot storyId={context.id}>
              <View style={styles.story}>
                <SupportedPlatformStory
                  Story={Story}
                  storyId={context.id}
                  supportedPlatforms={supportedPlatforms}
                  testOnly={testOnly}
                  traversePlatforms={traversePlatforms}
                />
              </View>
            </DesktopStoryRoot>
          </StorybookThemeProvider>
        );
      },
    ],
    parameters: {},
  };
}

type DesktopPlatform = 'macos' | 'windows' | 'win32';

function SupportedPlatformStory({
  Story,
  storyId,
  supportedPlatforms,
  testOnly,
  traversePlatforms,
}: {
  Story: ComponentType;
  storyId: string;
  supportedPlatforms?: readonly DesktopPlatform[];
  testOnly: boolean;
  traversePlatforms?: readonly DesktopPlatform[];
}) {
  const { runtimeInstance, selection } = useDesktopStorybookConfig();
  const endpoint = runtimeInstance?.endpoint;
  if (endpoint && supportedPlatforms && !supportedPlatforms.includes(endpoint)) {
    return (
      <View accessible accessibilityLabel={`Story unavailable on ${endpoint}`} accessibilityRole="summary" style={styles.unsupported}>
        <Text style={styles.unsupportedTitle}>Story unavailable on {endpoint}</Text>
        <Text>This story supports: {supportedPlatforms.join(', ')}</Text>
      </View>
    );
  }
  if ((testOnly || (endpoint && traversePlatforms && !traversePlatforms.includes(endpoint))) && selection?.storyId !== storyId) {
    return (
      <View
        accessible
        accessibilityLabel={`Story reserved for authored tests on ${endpoint}`}
        accessibilityRole="summary"
        style={styles.unsupported}
      >
        <Text style={styles.unsupportedTitle}>Story reserved for authored tests</Text>
        <Text>The native driver activates this story in an isolated final test.</Text>
      </View>
    );
  }
  return <Story />;
}

function readSupportedPlatforms(value: unknown): readonly DesktopPlatform[] | undefined {
  return readPlatforms(value, 'supportedPlatforms');
}

function readTraversePlatforms(value: unknown): readonly DesktopPlatform[] | undefined {
  return readPlatforms(value, 'traversePlatforms');
}

function readPlatforms(value: unknown, key: 'supportedPlatforms' | 'traversePlatforms'): readonly DesktopPlatform[] | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const supportedPlatforms = (value as Record<typeof key, unknown>)[key];
  if (
    !Array.isArray(supportedPlatforms) ||
    !supportedPlatforms.every((platform) => platform === 'macos' || platform === 'windows' || platform === 'win32')
  ) {
    return undefined;
  }
  return supportedPlatforms;
}

const styles = StyleSheet.create({
  story: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  unsupported: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 480,
    padding: 24,
  },
  unsupportedTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
