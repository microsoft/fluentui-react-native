/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Checkbox } from './checkbox';
import type { CheckboxStatus, CheckboxVariant } from './checkbox.types';
import { Input } from '../input/input';
import { Button } from '../button/button';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const variants: readonly { label: string; value: CheckboxVariant }[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'Circular', value: 'circular' },
];

const statuses: readonly { label: string; value: CheckboxStatus }[] = [
  { label: 'Unchecked', value: 'unchecked' },
  { label: 'Checked', value: 'checked' },
  { label: 'Indeterminate', value: 'indeterminate' },
];

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'Checkbox',
    secondaryText: 'Description',
    showLabel: true,
    showSecondaryText: false,
    defaultStatus: 'unchecked',
    testID: 'agentic-storybook-checkbox',
    variant: 'standard',
  },
  argTypes: {
    showLabel: { control: 'boolean' },
    showSecondaryText: { control: 'boolean' },
    defaultStatus: { control: 'select', options: statuses.map(({ value }) => value) },
    variant: { control: 'select', options: variants.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox is a tri-state selection control for explicit submission flows. Use Checkbox when options are independent or when a parent option needs an indeterminate mixed state.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof Checkbox>>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  wdio: [
    desktopIt('toggles native checked state in both directions', { requires: ['physical-click'] }, async ({ browser, expect }) => {
      const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      const checkbox = await browser.$('~agentic-storybook-checkbox');
      expect(await checkbox.getTagName()).toBe('checkbox');
      await expectNativeState(browser, 'agentic-storybook-checkbox', 'checked', false);
      await checkbox.click();
      await expectNativeState(browser, 'agentic-storybook-checkbox', 'checked', true);
      await checkbox.click();
      await expectNativeState(browser, 'agentic-storybook-checkbox', 'checked', false);
    }),
  ],
};

function KeyboardStatusScene() {
  const [changes, setChanges] = useState(0);
  const [presses, setPresses] = useState(0);
  const [releases, setReleases] = useState(0);
  return (
    <View>
      <Input accessibilityLabel="Checkbox entry" testID="checkbox-keyboard-entry" />
      <Checkbox
        label="Receive updates"
        testID="checkbox-keyboard-target"
        onStatusChange={() => setChanges((count) => count + 1)}
        onPress={() => setPresses((count) => count + 1)}
        onPressOut={() => setReleases((count) => count + 1)}
      />
      <Checkbox disabled label="Unavailable" testID="checkbox-keyboard-disabled" />
      <Button content="After checkbox" testID="checkbox-keyboard-after" />
      <StoryStatus testID="checkbox-keyboard-changes">{String(changes)}</StoryStatus>
      <StoryStatus testID="checkbox-keyboard-presses">{String(presses)}</StoryStatus>
      <StoryStatus testID="checkbox-keyboard-releases">{String(releases)}</StoryStatus>
    </View>
  );
}

export const KeyboardStatus: Story = {
  render: () => <KeyboardStatusScene />,
  tags: ['desktop-focus'],
  wdio: [
    desktopIt(
      'CBX-002 CBX-006 toggles once per Space and skips disabled stops in both Tab directions',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'checkbox-keyboard-entry', 'checkbox-keyboard-target');
        for (const [count, checked] of [
          ['1', true],
          ['2', false],
        ] as const) {
          await browser.keys('\uE00D');
          await expectNativeState(browser, 'checkbox-keyboard-target', 'checked', checked);
          await expectNativeState(browser, 'checkbox-keyboard-target', 'focused', true);
          await expect(await browser.$('~checkbox-keyboard-changes')).toHaveText(count);
          await expect(await browser.$('~checkbox-keyboard-presses')).toHaveText(count);
        }
        await browser.keys('\uE004');
        await expectNativeState(browser, 'checkbox-keyboard-after', 'focused', true);
        await expectNativeState(browser, 'checkbox-keyboard-disabled', 'focused', false);
        await browser.keys(['\uE008', '\uE004']);
        await expectNativeState(browser, 'checkbox-keyboard-target', 'focused', true);
      },
    ),
    desktopIt(
      'CBX-002 suppresses held-key repeats and forwards one release at the native activation phase',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect, platform }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'checkbox-keyboard-entry', 'checkbox-keyboard-target');
        try {
          await browser.performActions([
            {
              type: 'key',
              id: 'checkbox-keyboard',
              actions: [
                { type: 'keyDown', value: '\uE00D' },
                { type: 'keyDown', value: '\uE00D' },
              ],
            },
          ]);
          await expect(await browser.$('~checkbox-keyboard-changes')).toHaveText(platform === 'macos' ? '1' : '0');
          await expectNativeState(browser, 'checkbox-keyboard-target', 'checked', platform === 'macos');
          await browser.performActions([{ type: 'key', id: 'checkbox-keyboard', actions: [{ type: 'keyUp', value: '\uE00D' }] }]);
          await expect(await browser.$('~checkbox-keyboard-changes')).toHaveText('1');
          await expect(await browser.$('~checkbox-keyboard-presses')).toHaveText('1');
          await expect(await browser.$('~checkbox-keyboard-releases')).toHaveText('1');
          await expectNativeState(browser, 'checkbox-keyboard-target', 'checked', true);
        } finally {
          await browser.releaseActions();
        }
      },
    ),
    desktopIt(
      'CBX-002 cancels a held press on blur without toggling on a stale key-up',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect, platform }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'checkbox-keyboard-entry', 'checkbox-keyboard-target');
        try {
          await browser.performActions([
            {
              type: 'key',
              id: 'checkbox-keyboard',
              actions: [
                { type: 'keyDown', value: '\uE00D' },
                { type: 'keyDown', value: '\uE004' },
                { type: 'keyUp', value: '\uE004' },
                { type: 'keyUp', value: '\uE00D' },
              ],
            },
          ]);
          await expectNativeState(browser, 'checkbox-keyboard-after', 'focused', true);
          await expectNativeState(browser, 'checkbox-keyboard-target', 'checked', platform === 'macos');
          await expect(await browser.$('~checkbox-keyboard-changes')).toHaveText(platform === 'macos' ? '1' : '0');
          await expect(await browser.$('~checkbox-keyboard-presses')).toHaveText(platform === 'macos' ? '1' : '0');
        } finally {
          await browser.releaseActions();
        }
      },
    ),
  ],
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Style">
        {variants.map(({ label, value }) => (
          <Checkbox key={value} label={label} variant={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Status">
        {statuses.map(({ label, value }) => (
          <Checkbox key={value} label={label} defaultStatus={value} />
        ))}
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the style axis and the tri-state status axis.',
      },
    },
  },
};

export const SecondaryText: Story = {
  render: () => (
    <StoryGroup label="Secondary text">
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText />
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText defaultStatus="checked" />
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText defaultStatus="indeterminate" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Secondary text stays visually subordinate while still being announced as supporting context.',
      },
    },
  },
};

export const ExternallyDrivenStatus: Story = {
  render: () => {
    const SelectAll = () => {
      const [statuses, setStatuses] = useState<readonly CheckboxStatus[]>(['unchecked', 'checked']);
      const allChecked = statuses.every((status) => status === 'checked');
      const parentStatus: CheckboxStatus = allChecked ? 'checked' : statuses.some((s) => s === 'checked') ? 'indeterminate' : 'unchecked';
      return (
        <StoryGroup label="Select all">
          <Checkbox
            label="All options"
            onStatusChange={() => setStatuses(statuses.map(() => (allChecked ? 'unchecked' : 'checked')))}
            status={parentStatus}
          />
          {statuses.map((status, index) => (
            <Checkbox
              key={index}
              label={`Option ${index + 1}`}
              onStatusChange={(next: CheckboxStatus) => setStatuses(statuses.map((current, i) => (i === index ? next : current)))}
              status={status}
            />
          ))}
        </StoryGroup>
      );
    };
    return <SelectAll />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A parent checkbox owns the status of its children. Every checkbox is externally driven and reports presses through onStatusChange, which is how the parent resolves its own indeterminate state.',
      },
    },
  },
};

export const HiddenLabel: Story = {
  render: () => (
    <StoryGroup label="Label fallback">
      <Checkbox accessibilityLabel="Enable notifications" label="Hidden label" showLabel={false} testID="checkbox-explicit-name" />
      <Checkbox label="Save drafts" showLabel={false} testID="checkbox-fallback-name" />
    </StoryGroup>
  ),
  wdio: [
    desktopIt('CBX-004 preserves native explicit and fallback names without visible labels', async ({ browser, expect }) => {
      const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      const explicit = await browser.$('~checkbox-explicit-name');
      const fallback = await browser.$('~checkbox-fallback-name');
      expect(await explicit.getTagName()).toBe('checkbox');
      expect(await fallback.getTagName()).toBe('checkbox');
      expect(await explicit.getProperty('name')).toBe('Enable notifications');
      expect(await fallback.getProperty('name')).toBe('Save drafts');
      await expectNativeState(browser, 'checkbox-explicit-name', 'checked', false);
      await expectNativeState(browser, 'checkbox-fallback-name', 'checked', false);
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'When the visible label is hidden, the component still requires an accessible name. Native name and checked state are checked separately; macOS exposes checkbox state through AXValue.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <StoryGroup label="Disabled">
      <Checkbox disabled label="Disabled" />
      <Checkbox disabled label="Disabled" showSecondaryText secondaryText="Unavailable option" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkboxes are unavailable, expose disabled accessibility state, and do not receive focus.',
      },
    },
  },
};

export const ConstrainedText: Story = {
  render: () => (
    <StoryGroup label="Constrained label">
      <Checkbox
        label="Long checkbox label that wraps inside constrained layouts without truncating"
        style={styles.constrained}
        testID="checkbox-narrow-label"
      />
      <Checkbox
        label="Long checkbox label that wraps inside constrained layouts without truncating"
        style={styles.unconstrained}
        testID="checkbox-wide-label"
      />
      <Checkbox
        label="Option"
        secondaryText="Long supporting text that wraps inside constrained layouts without truncating"
        showSecondaryText
        style={styles.constrained}
        testID="checkbox-narrow-secondary"
      />
      <Checkbox
        label="Option"
        secondaryText="Long supporting text that wraps inside constrained layouts without truncating"
        showSecondaryText
        style={styles.unconstrained}
        testID="checkbox-wide-secondary"
      />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkbox text wraps when constrained by surrounding layout.',
      },
    },
  },
  wdio: [
    desktopIt('CBX-003 wraps the label into a taller constrained row', async ({ browser, expect }) => {
      const narrow = await browser.$('~checkbox-narrow-label');
      const wide = await browser.$('~checkbox-wide-label');
      const narrowRect = await browser.getElementRect(await narrow.elementId);
      const wideRect = await browser.getElementRect(await wide.elementId);
      expect(narrowRect.width).toBeLessThan(wideRect.width);
      expect(narrowRect.height).toBeGreaterThan(wideRect.height);
    }),
    desktopIt('CBX-003 wraps secondary text into a taller constrained row', async ({ browser, expect }) => {
      const narrow = await browser.$('~checkbox-narrow-secondary');
      const wide = await browser.$('~checkbox-wide-secondary');
      const narrowRect = await browser.getElementRect(await narrow.elementId);
      const wideRect = await browser.getElementRect(await wide.elementId);
      expect(narrowRect.width).toBeLessThan(wideRect.width);
      expect(narrowRect.height).toBeGreaterThan(wideRect.height);
    }),
  ],
};

const styles = StyleSheet.create({
  constrained: {
    width: 220,
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
  unconstrained: {
    width: 480,
  },
});
