import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { addons } from 'storybook/preview-api';

import { desktopStoryErrorEvent, desktopStoryReadyEvent } from './DesktopDriverBridge';
import { useDesktopStorybookConfig, useDesktopStorybookTestID } from './DesktopStorybookConfig';
import { createStoryMarker } from './storyMarker';

type DesktopStoryRootProps = {
  children: React.ReactNode;
  storyId: string;
};

export function DesktopStoryRoot({ children, storyId }: DesktopStoryRootProps) {
  const { isCurrentSelection, runtimeInstance, selection } = useDesktopStorybookConfig();
  const testID = useDesktopStorybookTestID('story-root');
  const exposeNativeMarker = Platform.OS === 'macos' || Platform.OS === 'windows' || Platform.OS === ('win32' as any);
  const activeSelection = selection?.storyId === storyId && !selection.cancelled ? selection : undefined;

  React.useEffect(() => {
    if (!activeSelection || !isCurrentSelection(activeSelection) || !runtimeInstance?.portablePlanDigest) {
      return;
    }
    addons.getChannel().emit(desktopStoryReadyEvent, {
      portablePlanDigest: runtimeInstance.portablePlanDigest,
      ...createStoryMarker(activeSelection),
    });
  }, [activeSelection, isCurrentSelection, runtimeInstance?.portablePlanDigest]);

  const marker = JSON.stringify(
    activeSelection
      ? createStoryMarker(activeSelection)
      : {
          previewGeneration: activeSelection?.previewGeneration ?? 0,
          runId: activeSelection?.runId,
          storyId,
        },
  );
  const key = activeSelection ? `${activeSelection.runId}:${activeSelection.previewGeneration}` : storyId;

  if (selection && !activeSelection) {
    return null;
  }

  return (
    <StoryRenderErrorBoundary
      key={key}
      onError={(message) => {
        if (activeSelection && isCurrentSelection(activeSelection)) {
          addons.getChannel().emit(desktopStoryErrorEvent, {
            message,
            ...createStoryMarker(activeSelection),
          });
        }
      }}
    >
      <View accessibilityLabel={marker} accessible={exposeNativeMarker || undefined} style={styles.root} testID={testID}>
        {children}
      </View>
    </StoryRenderErrorBoundary>
  );
}

type StoryRenderErrorBoundaryProps = {
  children: React.ReactNode;
  onError(message: string): void;
};

type StoryRenderErrorBoundaryState = {
  error?: Error;
};

class StoryRenderErrorBoundary extends React.Component<StoryRenderErrorBoundaryProps, StoryRenderErrorBoundaryState> {
  override state: StoryRenderErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): StoryRenderErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error): void {
    this.props.onError(error.message);
  }

  override render(): React.ReactNode {
    return this.state.error ? null : this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
