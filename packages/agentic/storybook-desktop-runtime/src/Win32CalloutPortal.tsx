import * as React from 'react';
import { StyleSheet } from 'react-native';

import { Callout } from '@fluentui-react-native/callout';
import type { CalloutProps, DirectionalHint } from '@fluentui-react-native/callout';
import { RootInputBoundary } from '@fluentui-react-native/design';
import { useTheme } from '@storybook/react-native-theming';

type Win32CalloutPortalProps = React.PropsWithChildren<{
  accessibilityLabel: string;
  directionalHint: DirectionalHint;
  height: number;
  onDismiss: () => void;
  onShow?: () => void;
  target: CalloutProps['target'];
  testID: string;
  visible: boolean;
  width: number;
}>;

export function Win32CalloutPortal({
  accessibilityLabel,
  children,
  directionalHint,
  height,
  onDismiss,
  onShow,
  target,
  testID,
  visible,
  width,
}: Win32CalloutPortalProps) {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Callout
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="dialog"
      backgroundColor={theme.background.content}
      borderColor={theme.appBorderColor}
      borderRadius={8}
      borderWidth={1}
      directionalHint={directionalHint}
      gapSpace={4}
      maxHeight={height}
      maxWidth={width}
      minPadding={12}
      minWidth={width}
      onDismiss={onDismiss}
      onShow={onShow}
      setInitialFocus
      target={target}
      testID={testID}
    >
      <RootInputBoundary
        collapsable={false}
        style={[styles.content, { backgroundColor: theme.background.content, height, width }]}
        testID={`${testID}-content`}
      >
        {children}
      </RootInputBoundary>
    </Callout>
  );
}

const styles = StyleSheet.create({
  content: {
    overflow: 'hidden',
  },
});
