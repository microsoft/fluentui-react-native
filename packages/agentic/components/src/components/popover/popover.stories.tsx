/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { ThemedRoot, useRootInputModality } from '@fluentui-react-native/design';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Popover } from './popover';
import type { PopoverProps, PopoverPosition } from './popover.types';

const styles = StyleSheet.create({
  scene: { alignItems: 'flex-start', gap: 12, padding: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trigger: { minHeight: 32, paddingHorizontal: 12, justifyContent: 'center' },
  content: { maxWidth: 240, gap: 8 },
  narrow: { maxWidth: 160 },
});
const positions: readonly PopoverPosition[] = [
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

function Modality({ testID }: { testID: string }) {
  return <StoryStatus testID={testID}>{useRootInputModality()}</StoryStatus>;
}

function Example(props: PopoverProps) {
  const [changes, setChanges] = React.useState(0);
  const [last, setLast] = React.useState('none');
  return (
    <View style={styles.scene}>
      <Button content="Outside destination" testID="popover-outside" />
      <Input textInput={{ testID: 'popover-entry' }} placeholder="Keyboard entry" />
      <Popover
        {...props}
        onOpenChange={(value: boolean) => {
          setChanges((count) => count + 1);
          setLast(String(value));
          props.onOpenChange?.(value);
        }}
        content={
          props.content === undefined
            ? {
                style: styles.content,
                children: (
                  <View>
                    <Text>Last synced 5 minutes ago.</Text>
                    <Input textInput={{ testID: 'popover-popup-editor' }} placeholder="Popup editor" />
                    <Modality testID="popover-popup-modality" />
                  </View>
                ),
              }
            : props.content
        }
      />
      <StoryStatus testID="popover-request-count">{String(changes)}</StoryStatus>
      <StoryStatus testID="popover-last-request">{last}</StoryStatus>
      <Modality testID="popover-scene-modality" />
    </View>
  );
}

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    defaultOpen: false,
    surfaceAccessibilityLabel: 'Sync details',
    position: 'bottomLeftEdge',
  },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    position: { control: 'select', options: positions },
    trigger: { control: false },
    content: { control: false },
  },
  render: (args: PopoverProps) => (
    <Example
      {...args}
      trigger={{
        testID: 'storybook-popover-trigger',
        accessibilityLabel: 'Show sync details',
        style: styles.trigger,
        children: <Text>Details</Text>,
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Bounded native popup hosting with controlled/uncontrolled open state. Initial child focus and reason-aware restoration are not portable guarantees; P is separate from Menu FM.',
      },
    },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Popover>>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  wdio: {
    'exposes a closed enabled trigger': async ({ browser, expect }) => {
      const trigger = await browser.$('~storybook-popover-trigger');
      await expect(trigger).toExist();
      await expect(trigger).toBeEnabled();
      expect(await trigger.getTagName()).toBe('button');
      await expect(await browser.$('~popover-request-count')).toHaveText('0');
    },
    'opens through native pointer input and dismisses outside': async (context) => {
      const { browser, expect, skip } = context;
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('This case requires physical pointer input.');
        return;
      }
      await (await browser.$('~popover-entry')).click();
      await (await browser.$('~storybook-popover-trigger')).click();
      await expect(await browser.$('~popover-request-count')).toHaveText('1');
      await expect(await browser.$('~popover-last-request')).toHaveText('true');
      await (await browser.$('~popover-outside')).click();
      await expect(await browser.$('~popover-last-request')).toHaveText('false');
      await expect(await browser.$('~popover-request-count')).toHaveText('2');
    },
    'renders actual named popup content and native geometry without focus-changing lookup': async (context) => {
      const { readPopoverContent } = await import('./popover.wdio.ts');
      const features = context.browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        context.skip('Opening the host requires physical pointer input.');
        return;
      }
      await (await context.browser.$('~popover-entry')).click();
      await (await context.browser.$('~storybook-popover-trigger')).click();
      await context.expect(await context.browser.$('~popover-last-request')).toHaveText('true');
      const popup = await readPopoverContent(context);
      if (!popup) return;
      context.expect(popup.content.name).toBe('Sync details');
      context.expect(popup.content.role).toBe('dialog');
      context.expect(popup.content.rect.width).toBeGreaterThanOrEqual(200);
      context.expect(popup.content.rect.height).toBeGreaterThan(0);
      context.expect(await context.browser.isElementDisplayed(await popup.element.elementId)).toBe(true);
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.scene}>
      <View style={styles.row}>
        <Popover surfaceAccessibilityLabel="Available details" trigger={{ children: <Text>Available</Text>, style: styles.trigger }} />
        <Popover
          disabled
          surfaceAccessibilityLabel="Disabled details"
          trigger={{ children: <Text>Disabled</Text>, style: styles.trigger }}
        />
      </View>
      <Text>Content mounts only while open. No selection or modal trap is provided.</Text>
    </View>
  ),
};

export const Placement: Story = {
  render: () => (
    <View style={styles.row}>
      {positions.map((position) => (
        <Popover
          key={position}
          position={position}
          surfaceAccessibilityLabel={`${position} details`}
          trigger={{ children: <Text>{position}</Text>, style: styles.trigger }}
          content={{ style: styles.content, children: <Text>Preferred placement is owned by the native host.</Text> }}
        />
      ))}
    </View>
  ),
};

export const Content: Story = {
  render: () => (
    <View style={styles.row}>
      <Popover
        surfaceAccessibilityLabel="Rich details"
        trigger={{ children: <Text>Rich content</Text>, style: styles.trigger }}
        content={{
          style: styles.content,
          children: (
            <View>
              <Text>Structured details</Text>
              <Button content="Content action" />
            </View>
          ),
        }}
      />
      <Popover
        surfaceAccessibilityLabel="Empty details"
        trigger={{ children: <Text>Empty surface</Text>, style: styles.trigger }}
        content={null}
      />
    </View>
  ),
};

export const ExternallyDrivenOpenState: Story = {
  render: (args: PopoverProps) => {
    function Controlled() {
      const [open, setOpen] = React.useState(false);
      return (
        <Example
          {...args}
          open={open}
          onOpenChange={setOpen}
          trigger={{ testID: 'storybook-popover-trigger', children: <Text>Controlled details</Text>, style: styles.trigger }}
        />
      );
    }
    return <Controlled />;
  },
};

export const ControlledRequests: Story = {
  render: (args: PopoverProps) => (
    <Example
      {...args}
      open={false}
      trigger={{ testID: 'storybook-popover-trigger', children: <Text>Request only</Text>, style: styles.trigger }}
    />
  ),
  wdio: {
    'reports the request without mounting or mutating a held controlled value': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('This case requires physical pointer input.');
        return;
      }
      await (await browser.$('~popover-entry')).click();
      await (await browser.$('~storybook-popover-trigger')).click();
      await expect(await browser.$('~popover-request-count')).toHaveText('1');
      await expect(await browser.$('~popover-last-request')).toHaveText('true');
      expect((await browser.$$('~popover-surface-content')).length).toBe(0);
      await (await browser.$('~storybook-popover-trigger')).click();
      await expect(await browser.$('~popover-request-count')).toHaveText('2');
    },
  },
};

export const Accessibility: Story = {
  wdio: {
    'requires real native expanded projection': async ({ desktop, expect, skip }) => {
      const trigger = await desktop.session.findElement('accessibility id', 'storybook-popover-trigger');
      try {
        expect(await trigger.getProperty('expanded')).toBe(false);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'unsupported operation') {
          skip('Native expanded projection is unavailable on this endpoint; this remains a P accessibility gate.');
          return;
        }
        throw error;
      }
    },
    'requires native named Expand and Collapse invocation': async ({ skip }) => {
      skip(
        'The current Desktop Driver protocol has no named ExpandCollapse/AX custom-action invocation. Real action dispatch remains a separately recorded P gate.',
      );
    },
  },
};

export const FocusManagement: Story = {
  tags: ['desktop-focus'],
  wdio: {
    'opens exactly once at the native keyboard activation phase': async (context) => {
      const { requireDesktopFocus, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect, platform } = context;
      await focusByTab(browser, 'popover-entry', 'storybook-popover-trigger');
      try {
        await browser.performActions([{ type: 'key', id: 'popover-keyboard', actions: [{ type: 'keyDown', value: '\uE007' }] }]);
        await expect(await browser.$('~popover-request-count')).toHaveText(platform === 'macos' ? '1' : '0');
        await browser.performActions([{ type: 'key', id: 'popover-keyboard', actions: [{ type: 'keyUp', value: '\uE007' }] }]);
      } finally {
        await browser.releaseActions();
      }
      await expect(await browser.$('~popover-request-count')).toHaveText('1');
      await expect(await browser.$('~popover-last-request')).toHaveText('true');
    },
  },
};

export const DisabledDismissal: Story = {
  render: (args: PopoverProps) => (
    <Example
      {...args}
      defaultOpen
      disabled
      trigger={{ testID: 'storybook-popover-trigger', children: <Text>Disabled open host</Text>, style: styles.trigger }}
    />
  ),
  wdio: {
    'allows an already-open disabled surface to dismiss': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('Dismissal requires physical outside input.');
        return;
      }
      await (await browser.$('~popover-outside')).click();
      await expect(await browser.$('~popover-last-request')).toHaveText('false');
      await expect(await browser.$('~popover-request-count')).toHaveText('1');
    },
  },
};

export const ConstrainedContent: Story = {
  render: (args: PopoverProps) => (
    <Example
      {...args}
      content={{
        style: styles.narrow,
        children: (
          <Text>
            A long description wraps inside a constrained composition without imposing a synthetic line count or changing the native
            measurement floor.
          </Text>
        ),
      }}
      trigger={{ testID: 'storybook-popover-trigger', children: <Text>Constrained details</Text>, style: styles.trigger }}
    />
  ),
  wdio: {
    'requires measured content bounds instead of only flattened styles': async (context) => {
      const { readPopoverContent } = await import('./popover.wdio.ts');
      const features = context.browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        context.skip('Opening requires physical pointer input.');
        return;
      }
      await (await context.browser.$('~popover-entry')).click();
      await (await context.browser.$('~storybook-popover-trigger')).click();
      await context.expect(await context.browser.$('~popover-last-request')).toHaveText('true');
      const popup = await readPopoverContent(context);
      if (!popup) return;
      context.expect(popup.content.rect.width).toBeGreaterThanOrEqual(200);
      context.expect(popup.content.rect.height).toBeGreaterThan(32);
    },
  },
};

function RefScene() {
  const [epoch, setEpoch] = React.useState(0);
  const [changes, setChanges] = React.useState(0);
  const [attached, setAttached] = React.useState(false);
  const triggerRef = React.useCallback((instance: React.ComponentRef<typeof View> | null) => {
    setAttached(instance !== null);
    return () => setAttached(false);
  }, []);
  return (
    <View style={styles.scene}>
      <Button testID="popover-replace" content="Replace component" onPress={() => setEpoch((value) => value + 1)} />
      <Input textInput={{ testID: 'popover-entry' }} placeholder="Keyboard entry" />
      <Popover
        key={epoch}
        surfaceAccessibilityLabel="Attachment details"
        onOpenChange={() => setChanges((value) => value + 1)}
        trigger={{
          testID: 'storybook-popover-trigger',
          children: <Text>Attachment details</Text>,
          style: styles.trigger,
          ref: triggerRef,
        }}
      />
      <StoryStatus testID="popover-ref-state">{String(attached)}</StoryStatus>
      <StoryStatus testID="popover-request-count">{String(changes)}</StoryStatus>
    </View>
  );
}

export const AttachmentLifetime: Story = {
  render: () => <RefScene />,
  wdio: {
    'retains callback ref attachment through rerender and component replacement': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('Replacement fixture requires physical pointer input.');
        return;
      }
      await expect(await browser.$('~popover-ref-state')).toHaveText('true');
      await (await browser.$('~popover-entry')).click();
      await (await browser.$('~storybook-popover-trigger')).click();
      await expect(await browser.$('~popover-request-count')).toHaveText('1');
      await expect(await browser.$('~popover-ref-state')).toHaveText('true');
      await (await browser.$('~popover-replace')).click();
      await expect(await browser.$('~popover-ref-state')).toHaveText('true');
      await (await browser.$('~storybook-popover-trigger')).click();
      await expect(await browser.$('~popover-request-count')).toHaveText('3');
    },
  },
};

export const PopupThemeAndModality: Story = {
  render: (args: PopoverProps) => (
    <ThemedRoot appearance={{ colorScheme: 'dark' }}>
      <Example {...args} trigger={{ testID: 'storybook-popover-trigger', children: <Text>Dark details</Text>, style: styles.trigger }} />
    </ThemedRoot>
  ),
  wdio: {
    'shares scene modality with actual popup input': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      const { readPopoverContent } = await import('./popover.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await browser.$('~popover-entry')).click();
      await (await browser.$('~storybook-popover-trigger')).click();
      await expect(await browser.$('~popover-last-request')).toHaveText('true');
      const popup = await readPopoverContent(context);
      if (!popup) return;
      await (await browser.$('~popover-popup-editor')).click();
      await browser.keys('x');
      await expect(await browser.$('~popover-popup-modality')).toHaveText('keyboard');
      await expect(await browser.$('~popover-scene-modality')).toHaveText('keyboard');
    },
  },
};
