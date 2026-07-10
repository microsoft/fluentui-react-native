import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Callout } from '@fluentui-react-native/callout';
import type { CalloutNativeCommands, DirectionalHint } from '@fluentui-react-native/callout';

/**
 * Storybook stories for the native (Fabric) {@link Callout} component from
 * `@fluentui-react-native/callout`.
 *
 * These stories are loaded by the on-device react-native-macos storybook app in
 * `packages/agentic-components/storybook` (via its `../../src/**\/*.stories` glob) and are the
 * primary way we validate the macOS Fabric implementation of Callout: the callout renders in its
 * own floating window anchored to the button, so the stories provide an anchor plus controls for
 * the props that affect placement and behavior.
 */

const DIRECTIONAL_HINTS: DirectionalHint[] = [
  'leftCenter',
  'topCenter',
  'rightCenter',
  'bottomCenter',
  'topLeftEdge',
  'topRightEdge',
  'bottomLeftEdge',
  'bottomRightEdge',
];

type CalloutDemoProps = {
  /** Suggested drop direction/alignment of the callout relative to the anchor. */
  directionalHint?: DirectionalHint;
  /** Renders a beak pointing at the anchor target. */
  isBeakVisible?: boolean;
  /** Whether the callout becomes the key window when shown (macOS). */
  setInitialFocus?: boolean;
};

/**
 * Interactive harness: an anchor button toggles a Callout anchored to it via a target ref. The
 * callout exposes a couple of inner controls so focus/dismiss behavior can be exercised on device.
 */
function CalloutDemo({
  directionalHint = 'bottomLeftEdge',
  isBeakVisible = false,
  setInitialFocus = false,
}: CalloutDemoProps): React.JSX.Element {
  const [visible, setVisible] = React.useState(false);
  const anchorRef = React.useRef<View>(null);
  const calloutRef = React.useRef<CalloutNativeCommands>(null);

  return (
    <View style={styles.root}>
      <Pressable ref={anchorRef} accessibilityRole="button" style={styles.anchor} onPress={() => setVisible((v) => !v)}>
        <Text style={styles.anchorLabel}>{visible ? 'Hide Callout' : 'Show Callout'}</Text>
      </Pressable>

      {visible && (
        <Callout
          componentRef={calloutRef}
          target={anchorRef}
          directionalHint={directionalHint}
          isBeakVisible={isBeakVisible}
          setInitialFocus={setInitialFocus}
          onDismiss={() => setVisible(false)}
        >
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>Callout</Text>
            <Text style={styles.calloutBody}>Anchored to the button with a target ref (direction: {directionalHint}).</Text>
            <View style={styles.calloutActions}>
              <Pressable accessibilityRole="button" style={styles.calloutButton} onPress={() => calloutRef.current?.focusWindow()}>
                <Text style={styles.calloutButtonLabel}>Focus window</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.calloutButton} onPress={() => setVisible(false)}>
                <Text style={styles.calloutButtonLabel}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </Callout>
      )}
    </View>
  );
}
CalloutDemo.displayName = 'Callout';

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchor: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#0078d4',
  },
  anchorLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  callout: {
    minWidth: 220,
    padding: 12,
    gap: 8,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  calloutBody: {
    fontSize: 13,
  },
  calloutActions: {
    flexDirection: 'row',
    gap: 8,
  },
  calloutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#e1dfdd',
  },
  calloutButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#201f1e',
  },
});

const meta: Meta<typeof CalloutDemo> = {
  title: 'Native/Callout',
  component: CalloutDemo,
  argTypes: {
    directionalHint: { control: 'select', options: DIRECTIONAL_HINTS },
  },
  args: {
    directionalHint: 'bottomLeftEdge',
    isBeakVisible: false,
    setInitialFocus: false,
  },
};

export default meta;

type Story = StoryObj<typeof CalloutDemo>;

/** Default callout anchored below-left of the button. */
export const Default: Story = {};

/** Callout with a beak pointing at the anchor. */
export const WithBeak: Story = {
  args: {
    isBeakVisible: true,
  },
};

/** Callout dropped above-center of the anchor with a beak. */
export const TopCenter: Story = {
  args: {
    directionalHint: 'topCenter',
    isBeakVisible: true,
  },
};

/** Callout that takes key-window focus when shown. */
export const InitialFocus: Story = {
  args: {
    setInitialFocus: true,
  },
};
