/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Callout } from './Callout';
import type { CalloutHandle, CalloutProps, DirectionalHint } from './Callout.types';

const directionalHints: readonly DirectionalHint[] = [
  'leftTopEdge',
  'leftCenter',
  'leftBottomEdge',
  'topLeftEdge',
  'topAutoEdge',
  'topCenter',
  'topRightEdge',
  'rightTopEdge',
  'rightCenter',
  'rightBottomEdge',
  'bottomLeftEdge',
  'bottomAutoEdge',
  'bottomCenter',
  'bottomRightEdge',
];

type CalloutExampleProps = CalloutProps & {
  defaultVisible?: boolean;
  showWindowCommands?: boolean;
};

const CalloutExample = ({ defaultVisible = false, onDismiss, onShow, showWindowCommands = false, ...props }: CalloutExampleProps) => {
  const anchorRef = React.useRef<View>(null);
  const calloutRef = React.useRef<CalloutHandle>(null);
  const [visible, setVisible] = React.useState(defaultVisible);
  const [status, setStatus] = React.useState(defaultVisible ? 'Opening' : 'Closed');

  const dismiss = React.useCallback(() => {
    setVisible(false);
    setStatus('Dismissed');
    onDismiss?.();
  }, [onDismiss]);

  const show = React.useCallback(() => {
    setStatus('Shown');
    onShow?.();
  }, [onShow]);

  return (
    <View style={styles.story}>
      <View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setVisible((current) => !current);
            setStatus(visible ? 'Closed' : 'Opening');
          }}
          ref={anchorRef}
          style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
          testID="agentic-storybook-callout-trigger"
        >
          <Text style={styles.triggerText}>{visible ? 'Close callout' : 'Open callout'}</Text>
        </Pressable>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.status} testID="agentic-storybook-callout-status">
        Native window: {status}
      </Text>
      {visible && (
        <Callout {...props} componentRef={calloutRef} onDismiss={dismiss} onShow={show} target={anchorRef}>
          <View style={styles.calloutContent} collapsable={false}>
            <Text style={styles.heading}>Fabric Callout</Text>
            <Text style={styles.body}>This content is hosted in a separate native window.</Text>
            {showWindowCommands && (
              <View style={styles.commandRow}>
                <Pressable accessibilityRole="button" onPress={() => calloutRef.current?.focusWindow()} style={styles.command}>
                  <Text>Focus window</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => calloutRef.current?.blurWindow()} style={styles.command}>
                  <Text>Blur window</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Callout>
      )}
    </View>
  );
};

type Placement = {
  hint: DirectionalHint;
  label: string;
};

const placements: readonly Placement[] = [
  { hint: 'topCenter', label: 'Above' },
  { hint: 'rightCenter', label: 'Right' },
  { hint: 'bottomCenter', label: 'Below' },
  { hint: 'leftCenter', label: 'Left' },
];

const PlacementExample = (props: CalloutProps) => {
  const aboveRef = React.useRef<View>(null);
  const rightRef = React.useRef<View>(null);
  const belowRef = React.useRef<View>(null);
  const leftRef = React.useRef<View>(null);
  const targetRefs = [aboveRef, rightRef, belowRef, leftRef] as const;
  const [selectedIndex, setSelectedIndex] = React.useState<number>();

  return (
    <View style={styles.placementStory}>
      {placements.map(({ hint, label }, index) => (
        <View key={hint} style={styles.placementAnchor}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSelectedIndex(index)}
            ref={targetRefs[index]}
            style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
          >
            <Text style={styles.triggerText}>{label}</Text>
          </Pressable>
        </View>
      ))}
      {selectedIndex !== undefined && (
        <Callout
          {...props}
          directionalHint={placements[selectedIndex].hint}
          onDismiss={() => setSelectedIndex(undefined)}
          target={targetRefs[selectedIndex]}
        >
          <View style={styles.calloutContent} collapsable={false}>
            <Text style={styles.heading}>{placements[selectedIndex].label}</Text>
            <Text style={styles.body}>Click outside the native window to dismiss it.</Text>
          </View>
        </Callout>
      )}
    </View>
  );
};

const meta: Meta<typeof Callout> = {
  title: 'Primitives/Callout',
  component: Callout,
  args: {
    accessibilityLabel: 'Callout example',
    accessibilityRole: 'dialog',
    backgroundColor: '#ffffff',
    borderColor: '#d1d1d1',
    borderRadius: 8,
    borderWidth: 1,
    directionalHint: 'bottomCenter',
    maxWidth: 320,
    setInitialFocus: false,
    testID: 'agentic-storybook-callout',
  },
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'color' },
    borderRadius: { control: { type: 'number', min: 0, max: 24, step: 1 } },
    borderWidth: { control: { type: 'number', min: 0, max: 8, step: 1 } },
    directionalHint: { control: 'select', options: directionalHints },
    maxHeight: { control: { type: 'number', min: 80, max: 600, step: 20 } },
    maxWidth: { control: { type: 'number', min: 120, max: 600, step: 20 } },
    minWidth: { control: { type: 'number', min: 80, max: 400, step: 20 } },
    setInitialFocus: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Callout is an unstyled native primitive that presents React content in a transient window positioned relative to a target.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  render: (args) => <CalloutExample {...args} defaultVisible />,
};

export const Placement: Story = {
  render: (args) => <PlacementExample {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Each trigger requests one of four placement edges. The native Callout remains within the available work area.',
      },
    },
  },
};

export const WindowCommands: Story = {
  args: {
    setInitialFocus: true,
  },
  render: (args) => <CalloutExample {...args} defaultVisible showWindowCommands />,
  parameters: {
    docs: {
      description: {
        story: 'The content buttons exercise Fabric touch handling and the imperative focusWindow and blurWindow native commands.',
      },
    },
  },
};

const styles = StyleSheet.create({
  body: {
    color: '#424242',
    marginTop: 6,
  },
  calloutContent: {
    padding: 16,
    width: 280,
  },
  command: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d1d1d1',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commandRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  heading: {
    color: '#242424',
    fontSize: 16,
    fontWeight: '600',
  },
  placementAnchor: {
    margin: 32,
  },
  placementStory: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 300,
    width: 520,
  },
  status: {
    color: '#616161',
    marginTop: 12,
  },
  story: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    width: 520,
  },
  trigger: {
    backgroundColor: '#0f6cbd',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  triggerPressed: {
    backgroundColor: '#115ea3',
  },
  triggerText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
