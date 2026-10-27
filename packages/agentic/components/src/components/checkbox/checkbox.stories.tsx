/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Checkbox } from './checkbox';
import type { CheckboxStatus, CheckboxVariant } from './checkbox.types';
import { Button } from '../button/button';
import { Input } from '../input/input';
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
  wdio: {
    'toggles native checked state in both directions': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('This test requires physical pointer input.');
        return;
      }
      const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      const checkbox = await browser.$('~agentic-storybook-checkbox');
      expect(await checkbox.getTagName()).toBe('checkbox');
      await expectNativeState(browser, 'agentic-storybook-checkbox', 'checked', false);
      await checkbox.click();
      await expectNativeState(browser, 'agentic-storybook-checkbox', 'checked', true);
      await checkbox.click();
      await expectNativeState(browser, 'agentic-storybook-checkbox', 'checked', false);
    },
  },
};

function StatusOwnershipScene() {
  const [uncontrolledReports, setUncontrolledReports] = useState<CheckboxStatus[]>([]);
  const [controlledReports, setControlledReports] = useState<CheckboxStatus[]>([]);
  const [uncontrolledPresses, setUncontrolledPresses] = useState(0);
  const [controlledPresses, setControlledPresses] = useState(0);
  return (
    <View style={styles.story}>
      <Input accessibilityLabel="Keyboard entry" testID="checkbox-keyboard-entry" />
      <Checkbox
        defaultStatus="indeterminate"
        label="Mixed option"
        onPress={() => setUncontrolledPresses((count) => count + 1)}
        onStatusChange={(next: CheckboxStatus) => setUncontrolledReports((reports) => [...reports, next])}
        testID="checkbox-uncontrolled"
      />
      <Checkbox disabled label="Disabled keyboard stop" testID="checkbox-disabled-stop" />
      <Button content="Next keyboard stop" testID="checkbox-next-stop" />
      <Checkbox
        label="Externally selected option"
        onPress={() => setControlledPresses((count) => count + 1)}
        onStatusChange={(next: CheckboxStatus) => setControlledReports((reports) => [...reports, next])}
        status="checked"
        testID="checkbox-controlled"
      />
      <StoryStatus testID="checkbox-uncontrolled-reports">{uncontrolledReports.join(',') || 'none'}</StoryStatus>
      <StoryStatus testID="checkbox-uncontrolled-presses">{String(uncontrolledPresses)}</StoryStatus>
      <StoryStatus testID="checkbox-controlled-reports">{controlledReports.join(',') || 'none'}</StoryStatus>
      <StoryStatus testID="checkbox-controlled-presses">{String(controlledPresses)}</StoryStatus>
    </View>
  );
}

export const StatusOwnership: Story = {
  render: () => <StatusOwnershipScene />,
  tags: ['desktop-e2e', 'desktop-focus'],
  parameters: {
    docs: {
      description: {
        story: 'Tri-state activation, callback counts, controlled ownership, and keyboard navigation past a disabled checkbox.',
      },
    },
  },
  wdio: {
    'CBX-002 advances mixed status with exactly one status and press callback per click': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('This test requires physical pointer input.');
        return;
      }
      const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      const checkbox = await browser.$('~checkbox-uncontrolled');
      await expect(await browser.$('~checkbox-uncontrolled-reports')).toHaveText('none');
      await expect(await browser.$('~checkbox-uncontrolled-presses')).toHaveText('0');
      await checkbox.click();
      await expectNativeState(browser, 'checkbox-uncontrolled', 'checked', true);
      await expect(await browser.$('~checkbox-uncontrolled-reports')).toHaveText('checked');
      await expect(await browser.$('~checkbox-uncontrolled-presses')).toHaveText('1');
      await checkbox.click();
      await expectNativeState(browser, 'checkbox-uncontrolled', 'checked', false);
      await expect(await browser.$('~checkbox-uncontrolled-reports')).toHaveText('checked,unchecked');
      await expect(await browser.$('~checkbox-uncontrolled-presses')).toHaveText('2');
    },
    'CBX-002 reports repeated controlled presses without changing native checked state': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('This test requires physical pointer input.');
        return;
      }
      const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      const checkbox = await browser.$('~checkbox-controlled');
      await expectNativeState(browser, 'checkbox-controlled', 'checked', true);
      await expect(await browser.$('~checkbox-controlled-reports')).toHaveText('none');
      await checkbox.click();
      await expect(await browser.$('~checkbox-controlled-reports')).toHaveText('unchecked');
      await expect(await browser.$('~checkbox-controlled-presses')).toHaveText('1');
      await expectNativeState(browser, 'checkbox-controlled', 'checked', true);
      await checkbox.click();
      await expect(await browser.$('~checkbox-controlled-reports')).toHaveText('unchecked,unchecked');
      await expect(await browser.$('~checkbox-controlled-presses')).toHaveText('2');
      await expectNativeState(browser, 'checkbox-controlled', 'checked', true);
    },
    'CBX-006 activates with Space exactly once and tabs past the disabled checkbox': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'checkbox-keyboard-entry', 'checkbox-uncontrolled');
      await browser.keys('\uE00D');
      await expectNativeState(browser, 'checkbox-uncontrolled', 'checked', true);
      await expect(await browser.$('~checkbox-uncontrolled-reports')).toHaveText('checked');
      await expect(await browser.$('~checkbox-uncontrolled-presses')).toHaveText('1');
      await browser.keys('\uE00D');
      await expectNativeState(browser, 'checkbox-uncontrolled', 'checked', false);
      await expect(await browser.$('~checkbox-uncontrolled-reports')).toHaveText('checked,unchecked');
      await expect(await browser.$('~checkbox-uncontrolled-presses')).toHaveText('2');
      await browser.keys('\uE004');
      await expectNativeState(browser, 'checkbox-next-stop', 'focused', true);
      await expectNativeState(browser, 'checkbox-disabled-stop', 'focused', false);
    },
  },
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
  wdio: {
    'CBX-004 preserves native explicit and fallback names without visible labels': async ({ browser, expect }) => {
      const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      const explicit = await browser.$('~checkbox-explicit-name');
      const fallback = await browser.$('~checkbox-fallback-name');
      expect(await explicit.getTagName()).toBe('checkbox');
      expect(await fallback.getTagName()).toBe('checkbox');
      await expect(explicit).toHaveText('Enable notifications');
      await expect(fallback).toHaveText('Save drafts');
      await expectNativeState(browser, 'checkbox-explicit-name', 'checked', false);
      await expectNativeState(browser, 'checkbox-fallback-name', 'checked', false);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'When the visible label is hidden, the component still requires an accessible name.',
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
  wdio: {
    'CBX-003 wraps the label into a taller constrained row': async ({ browser, expect }) => {
      const narrow = await browser.$('~checkbox-narrow-label');
      const wide = await browser.$('~checkbox-wide-label');
      const narrowRect = await browser.getElementRect(await narrow.elementId);
      const wideRect = await browser.getElementRect(await wide.elementId);
      expect(narrowRect.width).toBeLessThan(wideRect.width);
      expect(narrowRect.height).toBeGreaterThan(wideRect.height);
    },
    'CBX-003 wraps secondary text into a taller constrained row': async ({ browser, expect }) => {
      const narrow = await browser.$('~checkbox-narrow-secondary');
      const wide = await browser.$('~checkbox-wide-secondary');
      const narrowRect = await browser.getElementRect(await narrow.elementId);
      const wideRect = await browser.getElementRect(await wide.elementId);
      expect(narrowRect.width).toBeLessThan(wideRect.width);
      expect(narrowRect.height).toBeGreaterThan(wideRect.height);
    },
  },
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
