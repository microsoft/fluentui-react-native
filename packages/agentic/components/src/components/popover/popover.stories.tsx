/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Text } from '../text/text';
import { Popover } from './popover';
import type { PopoverAlign, PopoverOpenChangeData, PopoverPlacement } from './popover.types';

type SceneProps = { placement?: PopoverPlacement; align?: PopoverAlign };

function useReasonProbe() {
  const [reason, setReason] = React.useState('None');
  const [focus, setFocus] = React.useState('None');
  const onOpenChange = (open: boolean, { reason: cause }: PopoverOpenChangeData) => {
    setReason(`${open ? 'Opened' : 'Closed'}: ${cause}`);
    if (open) setFocus('None');
  };
  return { reason, focus, setFocus, onOpenChange };
}

function DetailsScene({ placement, align }: SceneProps) {
  const { reason, focus, setFocus, onOpenChange } = useReasonProbe();
  return (
    <View style={styles.story}>
      <Input accessibilityLabel="Popover entry" testID="popover-entry" />
      <View style={styles.center}>
        <Popover
          placement={placement}
          align={align}
          onOpenChange={onOpenChange}
          trigger={{ content: 'Details', testID: 'popover-trigger' }}
          surface={{ accessibilityLabel: 'File details', testID: 'popover-surface' }}
        >
          <Text style={styles.heading}>Quarterly report</Text>
          <Text>Edited by Ada two minutes ago.</Text>
          <View style={styles.actions}>
            <Button content="Open" testID="popover-first" onFocus={() => setFocus('First')} />
            <Button content="Share" testID="popover-second" onFocus={() => setFocus('Second')} />
          </View>
        </Popover>
      </View>
      <StoryStatus testID="popover-reason">{reason}</StoryStatus>
      <StoryStatus testID="popover-focus">{focus}</StoryStatus>
    </View>
  );
}

function StaticContentScene() {
  const { reason, focus, setFocus, onOpenChange } = useReasonProbe();
  return (
    <View style={styles.story}>
      <Popover
        onOpenChange={onOpenChange}
        trigger={{ content: 'About', testID: 'popover-trigger' }}
        surface={{ accessibilityLabel: 'About this file', testID: 'popover-surface', onFocus: () => setFocus('Surface') }}
      >
        <Text>Created in 2026. No interactive content.</Text>
      </Popover>
      <StoryStatus testID="popover-reason">{reason}</StoryStatus>
      <StoryStatus testID="popover-focus">{focus}</StoryStatus>
    </View>
  );
}

function ControlledScene() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('Quarterly report');
  const [reason, setReason] = React.useState('None');
  const [focus, setFocus] = React.useState('None');
  return (
    <View style={styles.story}>
      <Popover
        open={open}
        onOpenChange={(next, data) => {
          setOpen(next);
          setReason(`${next ? 'Opened' : 'Closed'}: ${data.reason}`);
        }}
        trigger={{ content: 'Rename', testID: 'popover-trigger' }}
        surface={{ accessibilityLabel: 'Rename file', testID: 'popover-surface' }}
      >
        <Button
          content="Save"
          testID="popover-save"
          onFocus={() => setFocus('Save')}
          onPress={() => {
            setName(`${name} (renamed)`);
            setReason('Closed: saved');
            setOpen(false);
          }}
        />
        <Text>{name}</Text>
      </Popover>
      <StoryStatus testID="popover-reason">{reason}</StoryStatus>
      <StoryStatus testID="popover-name">{name}</StoryStatus>
      <StoryStatus testID="popover-focus">{focus}</StoryStatus>
    </View>
  );
}

const meta: Meta<SceneProps> = {
  title: 'Components/Popover',
  render: (args) => <DetailsScene {...args} />,
  args: { placement: 'bottom', align: 'center' },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'start', 'end'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Popover presents supplementary, structured content in a nonmodal native popup anchored to its trigger. Escape and pointer input outside it dismiss it.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<SceneProps>>;

export const Default: Story = {
  tags: ['desktop-focus'],
  wdio: {
    'opens below the trigger as a named group and enters its first content': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { inPopupWindow, ownerScreenRect, surfaceScreenRect } = await import('./popover.wdio.ts');
      const { browser, expect } = context;
      const trigger = await browser.$('~popover-trigger');
      expect(await trigger.getProperty('expanded')).toBe(false);
      await trigger.click();
      await expect(await browser.$('~popover-reason')).toHaveText('Opened: trigger');
      await expect(await browser.$('~popover-focus')).toHaveText('First');
      expect(await trigger.getProperty('expanded')).toBe(true);
      await inPopupWindow(context, async () => {
        const surface = await browser.$('~popover-surface');
        expect(await surface.getProperty('role')).toBe('group');
        expect(await surface.getProperty('name')).toBe('File details');
      });
      const anchor = await ownerScreenRect(context, 'popover-trigger');
      const popup = await surfaceScreenRect(context, 'popover-surface');
      // The Win32 host ignores the placement gap and places the popup flush against the trigger.
      const gap = context.platform === 'win32' ? 0 : 4;
      expect(Math.abs(popup.x + popup.width / 2 - (anchor.x + anchor.width / 2))).toBeLessThanOrEqual(1);
      expect(Math.abs(popup.y - (anchor.y + anchor.height + gap))).toBeLessThanOrEqual(1);
    },
    'keeps Tab inside the popup and returns focus to the trigger on Escape': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'popover-entry', 'popover-trigger');
      await browser.keys('\uE007');
      await expect(await browser.$('~popover-focus')).toHaveText('First');
      await browser.keys('\uE004');
      await expect(await browser.$('~popover-focus')).toHaveText('Second');
      await browser.keys('\uE004');
      await expect(await browser.$('~popover-focus')).toHaveText('First');
      await browser.keys('\uE00C');
      await expect(await browser.$('~popover-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'popover-trigger', 'focused', true);
    },
    'closes on outside input and on a trigger press without reopening': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectClosed } = await import('./popover.wdio.ts');
      const { browser, expect } = context;
      const trigger = await browser.$('~popover-trigger');
      await trigger.click();
      await expect(await browser.$('~popover-focus')).toHaveText('First');
      await (await browser.$('~popover-entry')).click();
      await expect(await browser.$('~popover-reason')).toHaveText('Closed: dismiss');
      await expectClosed(context, 'popover-trigger');
      await trigger.click();
      await expect(await browser.$('~popover-reason')).toHaveText('Opened: trigger');
      await expect(await browser.$('~popover-focus')).toHaveText('First');
      await trigger.click();
      await expect(await browser.$('~popover-reason')).toHaveText('Closed: trigger');
      await expectClosed(context, 'popover-trigger');
    },
  },
};

export const Placement: Story = {
  args: { placement: 'top', align: 'start' },
  parameters: {
    docs: { description: { story: 'Logical placement and alignment; native placement flips and clamps to the work area.' } },
  },
};

export const StaticContent: Story = {
  render: () => <StaticContentScene />,
  tags: ['desktop-focus'],
  parameters: {
    docs: { description: { story: 'Without focusable content, the surface itself becomes the entry focus stop.' } },
  },
  wdio: {
    'focuses the surface when no content can take focus': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await browser.$('~popover-trigger')).click();
      await expect(await browser.$('~popover-reason')).toHaveText('Opened: trigger');
      await expect(await browser.$('~popover-focus')).toHaveText('Surface');
      await browser.keys('\uE00C');
      await expect(await browser.$('~popover-reason')).toHaveText('Closed: dismiss');
    },
  },
};

export const Controlled: Story = {
  render: () => <ControlledScene />,
  tags: ['desktop-focus'],
  parameters: {
    docs: { description: { story: 'Content closes a controlled Popover; focus returns to its trigger.' } },
  },
  wdio: {
    'returns focus to the trigger when content closes the popup': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectClosed } = await import('./popover.wdio.ts');
      const { browser, expect } = context;
      await (await browser.$('~popover-trigger')).click();
      await expect(await browser.$('~popover-reason')).toHaveText('Opened: trigger');
      await expect(await browser.$('~popover-focus')).toHaveText('Save');
      await browser.keys('\uE007');
      await expect(await browser.$('~popover-name')).toHaveText('Quarterly report (renamed)');
      await expectClosed(context, 'popover-trigger');
      await expectNativeState(browser, 'popover-trigger', 'focused', true);
    },
  },
};

const styles = StyleSheet.create({
  story: {
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
  },
  center: {
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 24,
  },
  heading: {
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
