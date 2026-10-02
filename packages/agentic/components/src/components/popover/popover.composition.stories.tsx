/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { useFocusTarget, useSlot } from '@fluentui-react-native/framework-base';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { usePopover_unstable } from './usePopover';
import { usePopoverStyles_unstable } from './usePopoverStyles';
import { renderPopover_unstable } from './renderPopover';
import type { PopoverCommittedAnchor, PopoverMenuHostBinding, PopoverMenuHostOptions } from './popover.types';

const styles = StyleSheet.create({
  scene: { alignItems: 'flex-start', gap: 12 },
  trigger: { minHeight: 32, padding: 8 },
});

function ManagedScene() {
  const binding = React.useRef<PopoverMenuHostBinding | null>(null);
  const [attempt, setAttempt] = React.useState(1);
  const [readyCount, setReadyCount] = React.useState(0);
  const [showCount, setShowCount] = React.useState(0);
  const [closeCount, setCloseCount] = React.useState(0);
  const [context, setContext] = React.useState('none');
  const [generation, setGeneration] = React.useState('waiting');
  const options: PopoverMenuHostOptions = {
    policy: 'menu-macos',
    initialFocus: 'owner',
    presentationKey: attempt,
    bindingRef: binding,
    onShow: () => setShowCount((value) => value + 1),
    onReady: (event) => {
      setReadyCount((value) => value + 1);
      setGeneration(event.nativeEvent.generation);
    },
    onDismissContext: (event, current) => {
      if (current.getCurrent() !== undefined) throw new Error('A hidden popup retained command authorization.');
      setContext(event.nativeEvent.reason);
    },
  };
  const state = usePopover_unstable(
    {
      open: true,
      onOpenChange: () => setCloseCount((value) => value + 1),
      surfaceAccessibilityLabel: 'Managed composition',
      trigger: { testID: 'managed-popover-trigger', children: <Text>Managed host</Text>, style: styles.trigger },
      content: { children: <Text>Menu owns initial child focus; this fixture does not automatically focus a child.</Text> },
    },
    { host: options },
  );
  return (
    <View style={styles.scene}>
      <Button content="New intentional attempt" testID="managed-popover-rearm" onPress={() => setAttempt((value) => value + 1)} />
      <Button content="Outside destination" testID="managed-popover-outside" />
      {renderPopover_unstable(state, usePopoverStyles_unstable(state))}
      <StoryStatus testID="managed-popover-ready-count">{String(readyCount)}</StoryStatus>
      <StoryStatus testID="managed-popover-show-count">{String(showCount)}</StoryStatus>
      <StoryStatus testID="managed-popover-rendered">{String(state.surface !== undefined)}</StoryStatus>
      <StoryStatus testID="managed-popover-close-count">{String(closeCount)}</StoryStatus>
      <StoryStatus testID="managed-popover-context">{context}</StoryStatus>
      <StoryStatus testID="managed-popover-generation">{generation}</StoryStatus>
    </View>
  );
}

function ExternalRowScene() {
  const rowRef = React.useRef<View | null>(null);
  const [rootAttached, setRootAttached] = React.useState(false);
  const rootRef = React.useCallback((instance: View | null) => {
    setRootAttached(instance !== null);
    if (instance) return () => setRootAttached(false);
    return undefined;
  }, []);
  const target = useFocusTarget();
  const Row = useSlot(View, {
    ref: rowRef,
    testID: 'external-popover-row',
    accessible: true,
    focusable: true,
    accessibilityLabel: 'Existing row',
    onFocus: target.onFocus,
    onBlur: target.onBlur,
    style: styles.trigger,
  });
  const [attachment, setAttachment] = React.useState<PopoverCommittedAnchor | null>(null);
  React.useLayoutEffect(() => {
    const publish = () => {
      const current = rowRef.current;
      if (current && target.focusTarget.current === current) {
        setAttachment((previous) =>
          previous?.mountGeneration === target.focusTarget.generation
            ? previous
            : { nativeRef: rowRef, mountGeneration: target.focusTarget.generation, lifetime: target.focusTarget },
        );
      } else {
        setAttachment(null);
      }
    };
    publish();
    return target.focusTarget.subscribe(publish);
  }, [target.focusTarget]);
  const state = usePopover_unstable(
    {
      open: true,
      surfaceAccessibilityLabel: 'Existing row details',
      testID: 'external-popover-root',
      ref: rootRef,
      content: { children: <Text>Anchored to the existing row without a second trigger.</Text> },
    },
    {
      host: { policy: 'menu-macos', initialFocus: 'owner', presentationKey: 1 },
      anchor: { mode: 'external', attachment },
    },
  );
  return (
    <View style={styles.scene}>
      <Row ref={target.focusTargetRef}>
        <Text>Existing committed row</Text>
      </Row>
      {renderPopover_unstable(state, usePopoverStyles_unstable(state))}
      <StoryStatus testID="external-popover-root-attached">{String(rootAttached)}</StoryStatus>
    </View>
  );
}

function EndpointScene({ external = false }: { external?: boolean }) {
  return Platform.OS === 'macos' ? (
    external ? (
      <ExternalRowScene />
    ) : (
      <ManagedScene />
    )
  ) : (
    <Text>Managed Menu composition is macOS-only; ordinary Popover remains available.</Text>
  );
}

const meta: Meta = {
  title: 'Components/Popover/Composition',
  render: () => <EndpointScene />,
  parameters: {
    docs: {
      description: {
        component:
          'MacOS-only unstable host transport. Native family focus/return qualification is separate; these cases are not run by this worker.',
      },
    },
  },
};
export default meta;
type Story = WdioStory<StoryObj>;

export const ManagedLifecycle: Story = {
  wdio: {
    'invalidates a controlled native-hidden attempt and permits only intentional rearm': async ({ browser, expect, platform, skip }) => {
      if (platform !== 'macos') {
        skip('Managed Menu composition is explicitly macOS-only.');
        return;
      }
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('Native outside dismissal requires physical pointer input.');
        return;
      }
      await expect(await browser.$('~managed-popover-ready-count')).toHaveText('1');
      await (await browser.$('~managed-popover-outside')).click();
      await expect(await browser.$('~managed-popover-close-count')).toHaveText('1');
      await expect(await browser.$('~managed-popover-context')).toHaveText('native-light-dismiss');
      await (await browser.$('~managed-popover-rearm')).click();
      await expect(await browser.$('~managed-popover-ready-count')).toHaveText('2');
    },
  },
};

export const ExistingRowAnchor: Story = {
  render: () => <EndpointScene external />,
  wdio: {
    'retains the existing row without creating an additional Popover trigger': async ({ browser, expect, platform, skip }) => {
      if (platform !== 'macos') {
        skip('Existing-row managed composition is explicitly macOS-only.');
        return;
      }
      await expect(await browser.$('~external-popover-row')).toExist();
      await expect(await browser.$('~external-popover-root-attached')).toHaveText('true');
      expect((await browser.$$('~popover-trigger')).length).toBe(0);
    },
  },
};
