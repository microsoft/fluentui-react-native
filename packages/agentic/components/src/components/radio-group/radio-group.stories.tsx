/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';

import { Button } from '../button/button';
import { Input } from '../input/input';
import { Text } from '../text/text';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { RadioGroup } from './radio-group';
import { RadioGroupItem } from './radio-group-item';
import type { RadioGroupProps } from './radio-group.types';

const styles = StyleSheet.create({
  scene: { gap: 16, alignItems: 'flex-start' },
  narrow: { maxWidth: 240 },
  row: { flexDirection: 'row', gap: 12 },
});

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: { label: 'Delivery schedule', orientation: 'vertical', required: false, disabled: false, defaultSelectedValue: null },
  argTypes: {
    label: { control: 'text' },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    direction: { control: 'select', options: ['ltr', 'rtl'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    defaultSelectedValue: { control: 'select', options: [null, 'one', 'two', 'three'] },
    selectedValue: { control: false },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Coordinates a named two-to-five-choice group using a visual Label and unchanged Radio stages. Native AX role/state and UIA container qualification remain gated.',
      },
    },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof RadioGroup>>;

export const Default: Story = {
  render: (args: RadioGroupProps) => (
    <RadioGroup {...args} testID="radio-group-default">
      <RadioGroupItem value="one" label="Weekdays" />
      <RadioGroupItem value="two" label="Weekends" />
      <RadioGroupItem value="three" label="Any day" />
    </RadioGroup>
  ),
};

export const Overview: Story = {
  render: () => (
    <View style={styles.scene}>
      <RadioGroup label="Unanswered">
        <RadioGroupItem value="one" label="First" />
        <RadioGroupItem value="two" label="Second" />
      </RadioGroup>
      <RadioGroup label="Required horizontal answer" orientation="horizontal" required defaultSelectedValue="two">
        <RadioGroupItem value="one" label="Yes" />
        <RadioGroupItem value="two" label="No" />
      </RadioGroup>
      <RadioGroup label="Unavailable answer retained" defaultSelectedValue="two">
        <RadioGroupItem value="one" label="Available" />
        <RadioGroupItem value="two" label="Unavailable" disabled />
      </RadioGroup>
    </View>
  ),
};

export const Orientation: Story = {
  render: () => (
    <View style={styles.scene}>
      {(['vertical', 'horizontal'] as const).map((orientation) => (
        <RadioGroup key={orientation} label={`${orientation} layout`} orientation={orientation}>
          <RadioGroupItem value="one" label="First" />
          <RadioGroupItem value="two" label="Second" />
        </RadioGroup>
      ))}
    </View>
  ),
};

export const Required: Story = {
  render: () => (
    <View style={styles.scene}>
      <RadioGroup label="Optional answer">
        <RadioGroupItem value="one" label="First" />
        <RadioGroupItem value="two" label="Second" />
      </RadioGroup>
      <RadioGroup label="Required answer" required accessibilityHint="Choose an answer before saving.">
        <RadioGroupItem value="one" label="First" />
        <RadioGroupItem value="two" label="Second" />
      </RadioGroup>
      <Text>Required is a visual marker; actual native required communication needs separate qualification.</Text>
    </View>
  ),
};

function InteractiveScene({ args, mode = 'accept' }: { args?: Partial<RadioGroupProps>; mode?: 'accept' | 'refuse' | 'delay' }) {
  const [selected, setSelected] = React.useState<string | null>(args?.defaultSelectedValue ?? null);
  const [requests, setRequests] = React.useState(0);
  const [presses, setPresses] = React.useState(0);
  const [actions, setActions] = React.useState(0);
  const [atFocus, setAtFocus] = React.useState('none');
  const [ownerKey, setOwnerKey] = React.useState('none');
  const [held, setHeld] = React.useState('none');
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const select = (value: string | null) => {
    setRequests((count) => count + 1);
    clearTimeout(timer.current);
    if (mode === 'accept') setSelected(value);
    else if (mode === 'delay') timer.current = setTimeout(() => setSelected(value), 600);
  };
  const focused = (value: string) => setAtFocus(`${value}:${selected ?? 'none'}`);
  const pressed = () => setPresses((count) => count + 1);
  const action = () => setActions((count) => count + 1);
  return (
    <View style={styles.scene}>
      <Input accessibilityLabel="Keyboard entry" placeholder="Tab into the group" testID="radio-group-entry" />
      <RadioGroup
        {...args}
        label={args?.label ?? 'Delivery schedule'}
        selectedValue={selected}
        defaultSelectedValue={undefined}
        onSelectionChange={select}
        testID="radio-group-focus"
        onKeyDown={(event: FocusKeyboardEvent) => {
          if (event.nativeEvent.shiftKey && event.nativeEvent.key === 'ArrowRight') setOwnerKey('Shift+ArrowRight');
        }}
      >
        <RadioGroupItem
          value="one"
          label="Weekdays"
          testID="radio-group-one"
          onPress={pressed}
          onFocus={() => focused('one')}
          onAccessibilityAction={action}
          onKeyDown={(event) => {
            if (event.nativeEvent.key === 'Enter' || event.nativeEvent.key === ' ') setHeld(event.nativeEvent.key);
          }}
        />
        <RadioGroupItem value="disabled" label="Unavailable" disabled testID="radio-group-disabled" />
        <RadioGroupItem
          value="two"
          label="Weekends"
          testID="radio-group-two"
          onPress={pressed}
          onFocus={() => focused('two')}
          onAccessibilityAction={action}
        />
        <RadioGroupItem
          value="three"
          label="Any day"
          testID="radio-group-three"
          onPress={pressed}
          onFocus={() => focused('three')}
          onAccessibilityAction={action}
        />
      </RadioGroup>
      <Button content="After group" testID="radio-group-exit" />
      <StoryStatus testID="radio-group-answer">{selected ?? 'none'}</StoryStatus>
      <StoryStatus testID="radio-group-requests">{String(requests)}</StoryStatus>
      <StoryStatus testID="radio-group-presses">{String(presses)}</StoryStatus>
      <StoryStatus testID="radio-group-actions">{String(actions)}</StoryStatus>
      <StoryStatus testID="radio-group-at-focus">{atFocus}</StoryStatus>
      <StoryStatus testID="radio-group-owner-key">{ownerKey}</StoryStatus>
      <StoryStatus testID="radio-group-held-key">{held}</StoryStatus>
    </View>
  );
}

export const Uncontrolled: Story = {
  render: (args: RadioGroupProps) => {
    const Scene = () => {
      const [value, setValue] = React.useState<string | null>(args.defaultSelectedValue ?? null);
      return (
        <View style={styles.scene}>
          <RadioGroup {...args} onSelectionChange={setValue}>
            <RadioGroupItem value="one" label="Weekdays" />
            <RadioGroupItem value="two" label="Weekends" />
            <RadioGroupItem value="three" label="Any day" />
          </RadioGroup>
          <StoryStatus testID="radio-group-uncontrolled-answer">{value ?? 'none'}</StoryStatus>
        </View>
      );
    };
    return <Scene />;
  },
};

export const Controlled: Story = { render: (args: RadioGroupProps) => <InteractiveScene args={args} /> };
export const NoInitialSelection: Story = {
  render: () => <InteractiveScene />,
  tags: ['desktop-focus'],
  wdio: {
    'enters and exits unanswered with Tab and Shift+Tab without selecting': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
      await expect(await browser.$('~radio-group-answer')).toHaveText('none');
      await expect(await browser.$('~radio-group-requests')).toHaveText('0');
      await browser.keys('\uE004');
      await expectNativeState(browser, 'radio-group-exit', 'focused', true);
      try {
        await browser.keys(['\uE008', '\uE004']);
      } finally {
        await browser.releaseActions();
      }
      await expectNativeState(browser, 'radio-group-one', 'focused', true);
      await expect(await browser.$('~radio-group-answer')).toHaveText('none');
      await expect(await browser.$('~radio-group-requests')).toHaveText('0');
    },
    'keeps one Enter press and one change with endpoint activation timing': async (context) => {
      const { requireDesktopFocus, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect, platform } = context;
      await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
      try {
        await browser.performActions([{ type: 'key', id: 'radio-enter', actions: [{ type: 'keyDown', value: '\uE007' }] }]);
        await expect(await browser.$('~radio-group-presses')).toHaveText(platform === 'macos' ? '1' : '0');
        await browser.performActions([{ type: 'key', id: 'radio-enter', actions: [{ type: 'keyUp', value: '\uE007' }] }]);
      } finally {
        await browser.releaseActions();
      }
      await expect(await browser.$('~radio-group-presses')).toHaveText('1');
      await expect(await browser.$('~radio-group-requests')).toHaveText('1');
      await expect(await browser.$('~radio-group-answer')).toHaveText('one');
      await browser.keys('\uE007');
      await expect(await browser.$('~radio-group-presses')).toHaveText('2');
      await expect(await browser.$('~radio-group-requests')).toHaveText('1');
    },
  },
};

export const FocusManagement: Story = {
  render: (args: RadioGroupProps) => <InteractiveScene args={{ ...args, defaultSelectedValue: 'one' }} />,
  tags: ['desktop-focus'],
  wdio: {
    'uses both arrow axes, skips disabled, wraps and commits before focus': async (context) => {
      const { runArrowNavigation } = await import('./radio-group.wdio.ts');
      await runArrowNavigation(context);
    },
    'forwards modified navigation without changing the answer': async (context) => {
      const { runModifiedNavigation } = await import('./radio-group.wdio.ts');
      await runModifiedNavigation(context);
    },
    'exposes native checked and selected states independently of callbacks': async (context) => {
      const { runNativeSelectionProjection } = await import('./radio-group.wdio.ts');
      await runNativeSelectionProjection(context);
    },
    'keeps exactly one pointer activation and post-selection Windows focus': async (context) => {
      const { runPointerSelection } = await import('./radio-group.wdio.ts');
      await runPointerSelection(context);
    },
  },
};

export const HorizontalFocusManagement: Story = {
  render: () => <InteractiveScene args={{ orientation: 'horizontal', defaultSelectedValue: 'one' }} />,
  tags: ['desktop-focus'],
  wdio: {
    'uses both arrow axes, skips disabled, wraps and commits before focus': async (context) => {
      const { runArrowNavigation } = await import('./radio-group.wdio.ts');
      await runArrowNavigation(context);
    },
    'forwards modified navigation without changing the answer': async (context) => {
      const { runModifiedNavigation } = await import('./radio-group.wdio.ts');
      await runModifiedNavigation(context);
    },
    'exposes native checked and selected states independently of callbacks': async (context) => {
      const { runNativeSelectionProjection } = await import('./radio-group.wdio.ts');
      await runNativeSelectionProjection(context);
    },
    'keeps exactly one pointer activation and post-selection Windows focus': async (context) => {
      const { runPointerSelection } = await import('./radio-group.wdio.ts');
      await runPointerSelection(context);
    },
  },
};

export const ControlledRefusal: Story = {
  render: () => <InteractiveScene mode="refuse" args={{ defaultSelectedValue: 'one' }} />,
  tags: ['desktop-focus'],
  wdio: {
    'does not focus an unchecked destination when the parent refuses': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect, platform } = context;
      await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
      await browser.keys('\uE014');
      await expect(await browser.$('~radio-group-requests')).toHaveText('1');
      await expect(await browser.$('~radio-group-answer')).toHaveText('one');
      await expectNativeState(browser, 'radio-group-one', 'focused', true);
      await expectNativeState(browser, 'radio-group-two', 'focused', false);
      if (platform !== 'macos') {
        await expectNativeState(browser, 'radio-group-one', 'checked', true);
        await expectNativeState(browser, 'radio-group-two', 'checked', false);
      }
      await browser.keys('\uE004');
      await expectNativeState(browser, 'radio-group-exit', 'focused', true);
    },
  },
};

export const ControlledAcknowledgment: Story = {
  render: () => <InteractiveScene mode="delay" args={{ defaultSelectedValue: 'one' }} />,
  tags: ['desktop-focus'],
  wdio: {
    'waits for delayed parent acknowledgment and records selection at native focus': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect, platform } = context;
      await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
      await browser.keys('\uE014');
      await expect(await browser.$('~radio-group-requests')).toHaveText('1');
      await expectNativeState(browser, 'radio-group-two', 'focused', true);
      await expect(await browser.$('~radio-group-answer')).toHaveText('two');
      await expect(await browser.$('~radio-group-at-focus')).toHaveText('two:two');
      if (platform !== 'macos') await expectNativeState(browser, 'radio-group-two', 'checked', true);
      await expect(await browser.$('~radio-group-presses')).toHaveText('0');
    },
  },
};

export const RTL: Story = {
  render: () => <InteractiveScene args={{ direction: 'rtl', orientation: 'horizontal', defaultSelectedValue: 'one' }} />,
  tags: ['desktop-focus'],
  wdio: {
    'maps horizontal arrows to RTL without reversing Home End or vertical order': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
      for (const [key, id, answer] of [
        ['\uE012', 'radio-group-two', 'two'],
        ['\uE011', 'radio-group-one', 'one'],
        ['\uE015', 'radio-group-two', 'two'],
        ['\uE010', 'radio-group-three', 'three'],
        ['\uE014', 'radio-group-two', 'two'],
      ]) {
        await browser.keys(key);
        await expectNativeState(browser, id, 'focused', true);
        await expect(await browser.$('~radio-group-answer')).toHaveText(answer);
      }
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <View style={styles.scene}>
      <RadioGroup label="All choices disabled" defaultSelectedValue="two" disabled>
        <RadioGroupItem value="one" label="First" />
        <RadioGroupItem value="two" label="Selected" />
      </RadioGroup>
      <RadioGroup label="Selected unavailable choice" defaultSelectedValue="two">
        <RadioGroupItem value="one" label="Available" />
        <RadioGroupItem value="two" label="Selected unavailable" disabled />
      </RadioGroup>
    </View>
  ),
};

function DynamicScene() {
  const [values, setValues] = React.useState(['one', 'two', 'three']);
  const [selected, setSelected] = React.useState<string | null>('two');
  const [changes, setChanges] = React.useState(0);
  const [disabled, setDisabled] = React.useState(false);
  return (
    <View style={styles.scene}>
      <Input accessibilityLabel="Keyboard entry" testID="radio-group-entry" />
      <RadioGroup
        label="Dynamic choices"
        defaultSelectedValue="two"
        onSelectionChange={(value: string | null) => {
          setSelected(value);
          setChanges((count) => count + 1);
        }}
      >
        {values.map((value) => (
          <RadioGroupItem key={value} value={value} label={value} disabled={disabled && value === 'two'} testID={`dynamic-${value}`} />
        ))}
      </RadioGroup>
      <Button content="Reorder" testID="dynamic-reorder" onPress={() => setValues((current) => [...current].reverse())} />
      <Button content="Disable answer" testID="dynamic-disable" onPress={() => setDisabled(true)} />
      <Button
        content="Remove answer"
        testID="dynamic-remove"
        onPress={() => setValues((current) => current.filter((value) => value !== 'two'))}
      />
      <StoryStatus testID="dynamic-answer">{selected ?? 'none'}</StoryStatus>
      <StoryStatus testID="dynamic-changes">{String(changes)}</StoryStatus>
    </View>
  );
}

export const DynamicMembership: Story = {
  render: () => <DynamicScene />,
  tags: ['desktop-focus'],
  wdio: {
    'retains answer on reorder and disable then clears removal once without stealing outside focus': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect, platform } = context;
      await focusByTab(browser, 'radio-group-entry', 'dynamic-two');
      await (await browser.$('~dynamic-reorder')).click();
      await expect(await browser.$('~dynamic-answer')).toHaveText('two');
      await expect(await browser.$('~dynamic-changes')).toHaveText('0');
      await (await browser.$('~dynamic-disable')).click();
      await expect(await browser.$('~dynamic-answer')).toHaveText('two');
      if (platform !== 'macos') await expectNativeState(browser, 'dynamic-two', 'checked', true);
      await (await browser.$('~dynamic-remove')).click();
      await expect(await browser.$('~dynamic-answer')).toHaveText('none');
      await expect(await browser.$('~dynamic-changes')).toHaveText('1');
      if (platform !== 'macos') await expectNativeState(browser, 'dynamic-remove', 'focused', true);
      await expectNativeState(browser, 'dynamic-one', 'focused', false);
      await expectNativeState(browser, 'dynamic-three', 'focused', false);
    },
  },
};

function RefScene() {
  const [generation, setGeneration] = React.useState(0);
  const [attached, setAttached] = React.useState(false);
  const [cleanups, setCleanups] = React.useState(0);
  const root = React.useRef<React.ComponentRef<typeof View>>(null);
  const ref = React.useCallback((instance: React.ComponentRef<typeof View> | null) => {
    setAttached(instance !== null);
    if (instance)
      return () => {
        setAttached(false);
        setCleanups((count) => count + 1);
      };
    return undefined;
  }, []);
  return (
    <View style={styles.scene}>
      <Input accessibilityLabel="Keyboard entry" testID="radio-group-entry" />
      <RadioGroup label="Native refs" ref={root}>
        <RadioGroupItem value="one" label="One" testID="ref-one" ref={ref} key={generation} />
        <RadioGroupItem value="two" label="Two" testID="ref-two" />
      </RadioGroup>
      <Button content="Replace target" testID="ref-replace" onPress={() => setGeneration((value) => value + 1)} />
      <StoryStatus testID="ref-attached">{String(attached)}</StoryStatus>
      <StoryStatus testID="ref-cleanups">{String(cleanups)}</StoryStatus>
    </View>
  );
}

export const Refs: Story = {
  render: () => <RefScene />,
  tags: ['desktop-focus'],
  wdio: {
    'cleans up a replaced target and preserves subsequent native Tab navigation': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await expect(await browser.$('~ref-attached')).toHaveText('true');
      await expect(await browser.$('~ref-cleanups')).toHaveText('0');
      await (await browser.$('~ref-replace')).click();
      await expect(await browser.$('~ref-cleanups')).toHaveText('1');
      await expect(await browser.$('~ref-attached')).toHaveText('true');
      await focusByTab(browser, 'radio-group-entry', 'ref-one');
      await browser.keys('\uE014');
      await expectNativeState(browser, 'ref-two', 'focused', true);
    },
  },
};

export const AccessibilityActions: Story = {
  render: () => <InteractiveScene />,
  wdio: {
    'requires real UIA Select or AX custom-action invocation, not a click surrogate': async ({ skip }) => {
      skip(
        'The current Desktop Driver protocol exposes click input, not named Select/AX custom-action invocation. Native action/count and group speech acceptance require coordinator-owned endpoint tooling.',
      );
    },
    'requires native group role and discoverable children on macOS': async ({ platform, browser, expect, skip }) => {
      if (platform === 'macos') {
        skip('Installed RNmacOS Fabric has no inspected radio/radiogroup AX role conversion; this is a native acceptance blocker.');
        return;
      }
      await expect(await browser.$('~radio-group-focus')).toHaveAttribute('name', 'Delivery schedule');
      await expect(await browser.$('~radio-group-one')).toHaveAttribute('name', 'Weekdays');
      await expect(await browser.$('~radio-group-two')).toHaveAttribute('name', 'Weekends');
    },
  },
};

export const ConstrainedLayout: Story = {
  render: () => (
    <View style={styles.narrow}>
      <RadioGroup label="Choose a schedule that works for everyone involved in this delivery" required>
        <RadioGroupItem
          value="one"
          label="A longer weekday option that can wrap within the available width"
          secondaryText="Supporting information remains attached."
          showSecondaryText
        />
        <RadioGroupItem value="two" label="A longer weekend option for a different preference" />
      </RadioGroup>
    </View>
  ),
};
